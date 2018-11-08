//
// Handles setting the rules of the game (either a single or double zero board)
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can't do while waiting to join a tournament
    return (!attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      (request.intent.name === 'RulesIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    let speech;
    let reprompt;
    let game;

    return new Promise((resolve, reject) => {
      if (!event.request.intent.slots.Rules
              || !event.request.intent.slots.Rules.value) {
        // Sorry - reject this
        speech = res.strings.RULES_NO_WHEELTYPE;
        reprompt = res.strings.RULES_ERROR_REPROMPT;
        speech += reprompt;
        done(speech, reprompt);
      } else {
        game = utils.mapWheelType(handlerInput, event.request.intent.slots.Rules.value);
        if (!game) {
          speech = res.strings.RULES_INVALID_VARIANT.replace('{0}', event.request.intent.slots.Rules.value);
          reprompt = res.strings.RULES_ERROR_REPROMPT;
          speech += reprompt;
          done(speech, reprompt);
        } else if (game === 'tournament') {
          // Is the tournament active?
          if (!tournament.canEnterTournament(attributes)) {
            speech = res.strings.RULES_NO_TOURNAMENT;
            reprompt = res.strings.RULES_ERROR_REPROMPT;
            speech += reprompt;
            done(speech, reprompt);
          } else {
            // OK, set up the tournament!
            tournament.joinTournament(handlerInput, done);
          }
        } else {
          // OK, set the wheel, clear all bets, and set the bankroll based on the highScore object
          let hand;

          // Clear the old
          hand = attributes[attributes.currentHand];
          hand.bets = undefined;
          hand.lastbets = undefined;

          // Set the new
          attributes.currentHand = game;
          hand = attributes[attributes.currentHand];

          speech = (game === 'american')
            ? res.strings.RULES_SET_AMERICAN
            : res.strings.RULES_SET_EUROPEAN;
          speech += res.strings.RULES_CLEAR_BETS;
          speech += utils.readBankroll(event.request.locale, attributes);
          speech += res.strings.RULES_WHAT_NEXT;
          reprompt = res.strings.RULES_REPROMPT;
          done(speech, reprompt);
        }
      }

      function done(speech, reprompt) {
        const response = handlerInput.responseBuilder
          .speak(speech)
          .reprompt(reprompt)
          .getResponse();
        resolve(response);
      }
    });
  },
};
