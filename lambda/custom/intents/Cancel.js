//
// Cancels the previous bet, if any
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const hand = attributes[attributes.currentHand];

    // Note Cancel comes at the end, so we've already checked
    // for other instances where No or Cancel might apply
    return (!attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      (hand.bets && (hand.bets.length > 0)) &&
      ((request.intent.name === 'AMAZON.CancelIntent') ||
        (request.intent.name === 'AMAZON.NoIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    let speech;
    let reprompt;
    const hand = attributes[attributes.currentHand];
    const bet = hand.bets.shift();

    hand.bankroll += bet.amount;
    speech = res.strings.CANCEL_REMOVE_BET
      .replace('{Amount}', bet.amount)
      .replace('{Bet}', utils.mapBetType(handlerInput, bet.type, bet.numbers));

    // Reprompt based on whether we still have bets or not
    if (hand.bets && (hand.bets.length > 0)) {
      reprompt = res.strings.CANCEL_REPROMPT_WITHBET;
    } else {
      reprompt = res.strings.CANCEL_REPROMPT_NOBET;
    }
    speech += reprompt;
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
