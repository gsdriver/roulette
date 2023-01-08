//
// Manages upsells for the skill - recommending an upsell
// and recording information that will be used to make future
// upsell suggestions
//
// This skill defines four trigger points:
//  1. Launch
//  2. On tournament day
//  3. When listing a set of purchased products with none purchased
//
// Versions for analysis:
//  v1.0 - no upsell on launch (once every 3 days), upsell on tournament day (always), upsell on listpurchase
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
  getUpsell: function(handlerInput, trigger) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let directive;
    const now = Date.now();
    const availableProducts = getAvailableProducts(attributes);

    if (availableProducts.length === 0) {
      // There is nothing to upsell
      return;
    }

    // Reserved for our usage
    if (!attributes.upsell) {
      attributes.upsell = {};
      attributes.upsell.prompts = {};
      attributes.upsell.sessions = 0;
    }
    attributes.upsell.version = '1.0';
    if (!attributes.upsell[trigger]) {
      attributes.upsell[trigger] = {};
    }

    // Clear legacy prompts structure
    if (attributes.prompts) {
      attributes.prompts.crazydiamond = undefined;
      attributes.prompts.holiday = undefined;
    }

    // Since we are called on launch, this
    // will help us see the full session length
    if (!attributes.upsell.start) {
      attributes.upsell.start = now;
      attributes.upsell.sessions = (attributes.upsell.sessions + 1) || 1;
      attributes.upsell.availableProducts = availableProducts;
    }

    attributes.upsell[trigger].trigger = now;
    attributes.upsell[trigger].count = (attributes.upsell[trigger].count + 1) || 1;
    const upsellProduct = shouldUpsell(attributes, availableProducts, trigger, now);
    if (upsellProduct) {
      attributes.upsell[trigger].impression = {product: upsellProduct, time: now};
      attributes.upsell.prompts[upsellProduct] = now;
      directive = {
        'type': 'Connections.SendRequest',
        'name': 'Upsell',
        'payload': {
          'InSkillProduct': {
            productId: attributes.paid[upsellProduct].productId,
          },
          'upsellMessage': selectUpsellMessage(handlerInput, upsellProduct, trigger.toUpperCase() + '_UPSELL'),
        },
        'token': upsellProduct,
      };
    }

    return directive;
  },
  saveSession: function(handlerInput) {
    // Is this a "natural" end to the session or an upsell?
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder.getResponse();
    const now = Date.now();
    let upsell = false;
    let promise;
    const availableProducts = getAvailableProducts(attributes);

    // Save if there are available products OR if we ended on upsell
    if (availableProducts.length
      || (attributes.upsell && attributes.upsell.endOnUpsell)) {
      if (response.directives) {
        response.directives.forEach((directive) => {
          if ((directive.type === 'Connections.SendRequest') &&
            ((directive.name === 'Upsell') || (directive.name === 'Buy'))) {
            upsell = true;
            attributes.upsell.endOnUpsell = true;
          }
        });
      }

      // If it wasn't an upsell, save and reset session details
      // otherwise, persist as if it were part of the same session
      if (!upsell) {
        // Save session closing information
        if (!attributes.upsell) {
          attributes.upsell = {};
        }
        attributes.upsell.end = now;

        // If available product list has changed, it means an upsell happened!
        attributes.upsell.sold = (attributes.upsell.availableProducts &&
          (availableProducts.length < attributes.upsell.availableProducts.length));
        attributes.upsell.availableProducts = undefined;

        // Save to S3 - if we are saving data
        if (process.env.SNSTOPIC) {
          const params = {
            Body: JSON.stringify(attributes.upsell),
            Bucket: 'garrett-alexa-upsell',
            Key: 'roulette/' + handlerInput.requestEnvelope.session.user.userId
              + '/' + Date.now() + '.txt',
          };
          promise = s3.putObject(params).promise();
        }

        // Clear everything except the prompts and sessions data
        const prompts = attributes.upsell.prompts 
          ? JSON.parse(JSON.stringify(attributes.upsell.prompts))
          : undefined;
        const sessions = attributes.upsell.sessions;
        attributes.upsell = {};
        attributes.upsell.prompts = prompts;
        attributes.upsell.sessions = sessions;
        attributes.upsell.lastSession = now;
      }
    }

    if (!promise) {
      promise = Promise.resolve();
    }
    return promise;
  },
};

// The message is hardcoded
function selectUpsellMessage(handlerInput, game, message) {
  let selection;
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  // Store upsell messages locally
  const upsellMessages = {
    'LAUNCH_UPSELL': 'Hello, welcome to Roulette Wheel. We have a weekly tournament round available for purchase. Want to learn more?|Hi, welcome to Roulette Wheel. We\'re proud to introduce a weekly tournament round now available for purchase! Want to hear more about it?|Welcome back to Roulette Wheel. In addition to our normal play, we also have a weekly tournament round available for purchase. Are you interested in hearing more about it?',
    'TOURNAMENT_UPSELL': 'Thanks for playing. We have a tournament round happening right now. You can enter the weekly tournament by purchasing a subscription. Want to learn more?',
    'LISTPURCHASES_UPSELL': 'You don\'t have any products purchased, but we have a weekly tournament subscription available. Want to learn more?|You haven\'t purchased any products, but we have a weekly tournament subscription pack available for purchase. Would you like to hear more?|You haven\'t bought any products yet, but we have a weekly tournament round available for purchase. Want to hear more?',
  };
  const previousplayerUpsellMessages = {
    'LAUNCH_UPSELL': 'Welcome to Roulette Wheel. Thank you for playing the Roulette Wheel tournament in the past. We now require a subscription in order to enter the weekly tournament. Want to learn more?',
    'TOURNAMENT_UPSELL': 'We have a tournament round happening today and now require a subscription to enter. Want to learn more?',
    'LISTPURCHASES_UPSELL': 'You don\'t have any products purchased. However, we now require a subscription to enter the weekly tournament. Want to learn more?',
  };

  const options = attributes.temp.payToPlay
    ? previousplayerUpsellMessages[message].split('|')
    : upsellMessages[message].split('|');
  selection = Math.floor(Math.random() * options.length);
  if (selection === options.length) {
    selection--;
  }
  attributes.upsellSelection = 'v' + (selection + 1);
  return options[selection];
}

function shouldUpsell(attributes, availableProducts, trigger, now) {
  let upsellProduct;
  const product = availableProducts[0];

  // Have we already offered an upsell on this trigger in this session?
  if (attributes.upsell[trigger].impression) {
    return;
  }

  switch (trigger) {
    case 'launch':
      // Upsell once every three days, after their third time playing
      if (attributes.upsell.sessions > 2) {
        if (!attributes.upsell.prompts[product] ||
          ((now - attributes.upsell.prompts[product]) > 3*24*60*60*1000)) {
            upsellProduct = product;
        }
      }
      break;

    case 'tournament':
      // Always upsell
      upsellProduct = product;
      break;

    case 'listpurchases':
      // Always upsell
      upsellProduct = product;
      break;

    default:
      // Unknown trigger
      break;
  }

  return upsellProduct;
}

function getAvailableProducts(attributes) {
  const availableProducts = [];

  if (attributes.needsToBuyTournament) {
    availableProducts.push('Tournament');
  }

  return availableProducts;
}
