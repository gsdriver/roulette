//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');

module.exports = {
  canHandle: function(handlerInput) {
    return handlerInput.requestEnvelope.session.new ||
      (handlerInput.requestEnvelope.request.type === 'LaunchRequest');
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    const reprompt = res.strings.LAUNCH_REPROMPT;
    let speech = res.strings.LAUNCH_WELCOME;
    let tournamentResult;

    return new Promise((resolve, reject) => {
      tournament.getTournamentComplete(event.request.locale, attributes, (result) => {
        // If there is an active tournament, go to the start tournament state
        if (tournament.canEnterTournament(attributes)) {
          // Great, enter the tournament!
          attributes.temp.joinTournament = true;
          const output = tournament.promptToEnter(event.request.locale, attributes);
          handlerInput.responseBuilder
            .speak(result + output.speech)
            .reprompt(output.reprompt);
          resolve();
        } else {
          if (result && (result.length > 0)) {
            tournamentResult = result;
          }
          complete();
        }
      });

      function complete() {
        // Tell them the rules, their bankroll and offer a few things they can do
        if (tournamentResult) {
          speech += tournamentResult;
        }

        // Since we aren't in a tournament, make sure current hand isn't set to one
        if (attributes.currentHand === 'tournament') {
          attributes.currentHand = utils.defaultWheel(event.request.locale);
        }

        const hand = attributes[attributes.currentHand];

        // There was a bug where you could get to $0 bankroll without auto-resetting
        // Let the user know they can say reset if they have $0
        if ((hand.bankroll === 0) && hand.canReset) {
          speech += res.strings.SPIN_BUSTED;
          hand.bankroll = 1000;
        } else {
          speech += utils.readBankroll(event.request.locale, attributes);
        }

        speech += reprompt;
        handlerInput.responseBuilder
          .speak(speech)
          .reprompt(reprompt);
        resolve();
      }
    });
  },
};
