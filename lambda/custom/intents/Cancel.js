//
// Cancels the previous bet, if any
//

'use strict';

const utils = require('../utils');
const ri = require('@jargon/alexa-skill-sdk').ri;

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
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech;
    const speechParams = {};
    let reprompt;
    const hand = attributes[attributes.currentHand];
    const bet = hand.bets.shift();

    return utils.mapBetType(handlerInput, bet.type, bet.numbers)
    .then((betType) => {
      hand.bankroll += bet.amount;
      speechParams.Amount = bet.amount;
      speechParams.Bet = betType;
      speech = 'CANCEL_REMOVE_BET';

      // Reprompt based on whether we still have bets or not
      if (hand.bets && (hand.bets.length > 0)) {
        speech += '_WITHBET';
        reprompt = 'CANCEL_REPROMPT_WITHBET';
      } else {
        speech += '_NOBET';
        reprompt = 'CANCEL_REPROMPT_NOBET';
      }
      return handlerInput.jrb
        .speak(ri(speech, speechParams))
        .reprompt(ri(reprompt))
        .getResponse();
    });
  },
};
