//
// Handles listing the products you've purchased
// If they don't have anything that they've bought - why not upsell them?
//

'use strict';

const upsell = require('../UpsellEngine');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return ((request.type === 'IntentRequest')
      && attributes.paid && (request.intent.name === 'ListPurchasesIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech = 'LISTPURCHASES_NONE';

    if (attributes.paid && attributes.paid['Tournament'] &&
      (attributes.paid['Tournament'].state === 'PURCHASED')) {
      speech = 'LISTPURCHASES_TOURNAMENT';
    } else if (attributes.needsToBuyTournament && attributes.paid && attributes.paid['Tournament']) {
      // We only support tournament entry - either they have it or they don't
      // and if they are a legacy user, then they don't need to buy it
      if (attributes.paid['Tournament'].state === 'AVAILABLE') {
        // Upsell them!
        const directive = upsell.getUpsell(handlerInput, 'listpurchases');
        if (directive) {
          directive.token = 'roulette.' + directive.token + '.launch';
          if (attributes.temp.payToPlay) {
            directive.token += '.legacy';
          }
          return handlerInput.responseBuilder
            .addDirective(directive)
            .withShouldEndSession(true)
            .getResponse();
        }
      } else {
        speech = 'LISTPURCHASES_TOURNAMENT';
      }
    }

    return handlerInput.jrb
      .speak(ri(speech))
      .reprompt(ri('Jargon.defaultReprompt'))
      .getResponse();
  },
};
