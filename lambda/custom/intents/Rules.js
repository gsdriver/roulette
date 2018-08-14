//
// Handles setting the rules of the game (either a single or double zero board)
//

'use strict';

const utils = require('../utils');

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
    let numZeroes;

    attributes.temp.resetting = undefined;
    if (!attributes[attributes.currentHand].canReset) {
      // Sorry, you can't reset this or change the rules
      speech = res.strings.TOURNAMENT_NOCHANGERULES;
      reprompt = res.strings.TOURNAMENT_INVALIDACTION_REPROMPT;
      speech += reprompt;
    } else if (!event.request.intent.slots.Rules
            || !event.request.intent.slots.Rules.value) {
      // Sorry - reject this
      speech = res.strings.RULES_NO_WHEELTYPE;
      reprompt = res.strings.RULES_ERROR_REPROMPT;
      speech += reprompt;
    } else {
      numZeroes = res.mapWheelType(event.request.intent.slots.Rules.value);
      if (!numZeroes) {
        speech = res.strings.RULES_INVALID_VARIANT.replace('{0}', event.request.intent.slots.Rules.value);
        reprompt = res.strings.RULES_ERROR_REPROMPT;
        speech += reprompt;
      } else {
        // OK, set the wheel, clear all bets, and set the bankroll based on the highScore object
        let hand;

        // Clear the old
        hand = attributes[attributes.currentHand];
        hand.bets = undefined;
        hand.lastbets = undefined;

        // Set the new
        attributes.currentHand = (numZeroes == 2) ? 'american' : 'european';
        hand = attributes[attributes.currentHand];

        speech = (numZeroes == 2) ? res.strings.RULES_SET_AMERICAN : res.strings.RULES_SET_EUROPEAN;
        speech += res.strings.RULES_CLEAR_BETS;
        speech += utils.readBankroll(event.request.locale, attributes);
        speech += res.strings.RULES_WHAT_NEXT;
        reprompt = res.strings.RULES_REPROMPT;
      }
    }

    handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt);
  },
};
