//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');
const buttons = require('../buttons');

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
    const res = require('../resources')(event.request.locale);
    const reprompt = res.strings.LAUNCH_REPROMPT.replace('{0}', utils.getBetSuggestion(handlerInput));
    let speech = res.strings.LAUNCH_WELCOME;

    // If we are here because they passed on joining the tournament
    // and they are already in it, reset to the default wheel
    if (attributes.temp.joinTournament) {
      if (attributes.currentHand == 'tournament') {
        attributes.currentHand = utils.defaultWheel(event.request.locale);
      }
    }

    // If there is an active tournament, go to the start tournament state
    if (!attributes.temp.joinTournament && tournament.canEnterTournament(attributes)) {
      // Great, enter the tournament!
      attributes.temp.joinTournament = true;
      const output = tournament.promptToEnter(event.request.locale, attributes);
      return handlerInput.responseBuilder
        .speak(output.speech)
        .reprompt(output.reprompt)
        .getResponse();
    } else {
      attributes.temp.joinTournament = undefined;
    }

    // Tell them the rules, their bankroll and offer a few things they can do
    if (attributes.temp.tournamentResult) {
      speech += attributes.temp.tournamentResult;
      attributes.temp.tournamentResult = undefined;
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

    if (buttons.supportButtons(handlerInput)) {
      speech += res.strings.LAUNCH_WELCOME_BUTTON;
    }
    speech += reprompt;
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
