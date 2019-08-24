//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');
const buttons = require('../buttons');
const ri = require('@jargon/alexa-skill-sdk').ri;
const upsell = require('../UpsellEngine');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if (request.type === 'LaunchRequest') {
      return true;
    } else if (attributes.temp.joinTournament && (request.type === 'IntentRequest')
      && ((request.intent.name === 'AMAZON.NoIntent') || (request.intent.name === 'AMAZON.CancelIntent'))) {
      return true;
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech = 'LAUNCH_WELCOME';
    const speechParams = {};
    const repromptParams = {};

    return utils.getBetSuggestion(handlerInput)
    .then((suggestion) => {
      speechParams.Suggestion = suggestion;
      repromptParams.Suggestion = suggestion;

      // See what they can buy
      const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
      return ms.getInSkillProducts(event.request.locale)
      .then((inSkillProductInfo) => {
        return inSkillProductInfo;
      })
      .catch((error) => {
        // Ignore errors
        return;
      });
    }).then((inSkillProductInfo) => {
      console.log(inSkillProductInfo);
      if (inSkillProductInfo) {
        let state;
        attributes.paid = {};
        inSkillProductInfo.inSkillProducts.forEach((product) => {
          if (product.entitled === 'ENTITLED') {
            state = 'PURCHASED';
          } else if (product.purchasable == 'PURCHASABLE') {
            state = 'AVAILABLE';
          }

          if (state) {
            attributes.paid[product.referenceName] = {
              productId: product.productId,
              state: state,
            };
          }
        });
      }

      return utils.getGreeting(handlerInput);
    }).then((greeting) => {
      // If we are here because they passed on joining the tournament
      // and they are already in it, reset to the default wheel
      speechParams.Greeting = greeting;
      if (attributes.temp.joinTournament) {
        if (attributes.currentHand == 'tournament') {
          attributes.currentHand = utils.defaultWheel(event.request.locale);
        }
      }

      // If there is an active tournament, go to the start tournament state
      const canEnter = tournament.canEnterTournament(attributes);
      if (!attributes.temp.joinTournament) {
        if ((canEnter === false) && !attributes.temp.noUpsell) {
          // Upsell opportunity!
          const directive = upsell.getUpsell(handlerInput, 'tournament');
          if (directive) {
            directive.token = 'roulette.' + directive.token + '.launch';
            return handlerInput.responseBuilder
              .addDirective(directive)
              .withShouldEndSession(true)
              .getResponse();
          }
        }

        if (canEnter) {
          // Great, enter the tournament!
          attributes.temp.joinTournament = true;
          const output = tournament.promptToEnter(event.request.locale, attributes);
          return handlerInput.jrb
            .speak(ri(output.speech))
            .reprompt(ri(output.reprompt))
            .getResponse();
        } else {
          // Check if we should upsell (as a launch)
          if (!attributes.temp.noUpsell) {
            const directive = upsell.getUpsell(handlerInput, 'launch');
            if (directive) {
              directive.token = 'roulette.' + directive.token + '.launch';
              return handlerInput.responseBuilder
                .addDirective(directive)
                .withShouldEndSession(true)
                .getResponse();
            }
          }
        }
      } else {
        attributes.temp.joinTournament = undefined;
      }

      // Tell them the rules, their bankroll and offer a few things they can do
      speechParams.TournamentResult = attributes.temp.tournamentResult ? attributes.temp.tournamentResult : '';
      attributes.temp.tournamentResult = undefined;

      // Since we aren't in a tournament, make sure current hand isn't set to one
      if (attributes.currentHand === 'tournament') {
        attributes.currentHand = utils.defaultWheel(event.request.locale);
      }

      const hand = attributes[attributes.currentHand];

      // There was a bug where you could get to $0 bankroll without auto-resetting
      // Let the user know they can say reset if they have $0
      if ((hand.bankroll === 0) && hand.canReset) {
        speech += '_BUSTED';
        hand.bankroll = 1000;
      }

      if (buttons.supportButtons(handlerInput)) {
        speech += '_BUTTON';
      }
      return handlerInput.jrb
        .speak(ri(speech, speechParams))
        .reprompt(ri('LAUNCH_REPROMPT', repromptParams))
        .getResponse();
    });
  },
};
