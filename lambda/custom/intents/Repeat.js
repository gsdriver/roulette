//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return ((request.type === 'IntentRequest') &&
      ((request.intent.name === 'AMAZON.PreviousIntent') ||
      (request.intent.name === 'AMAZON.FallbackIntent') ||
      (request.intent.name === 'AMAZON.RepeatIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    const hand = attributes[attributes.currentHand];
    let speech;
    const betText = [];
    const reprompt = res.strings.REPEAT_REPROMPT;

    // Tell them the bankroll and their bets
    speech = utils.readBankroll(event.request.locale, attributes);
    if (hand.bets) {
      hand.bets.forEach((bet) => {
        betText.push(res.strings.REPEAT_SAY_BET
          .replace('{0}', bet.amount)
          .replace('{1}', res.mapBetType(bet.type, bet.numbers)));
      });
      speech += res.strings.REPEAT_BETS.replace('{0}', speechUtils.and(betText, {locale: event.request.locale}));
    } else if (hand.lastbets) {
      hand.lastbets.forEach((bet) => {
        betText.push(res.strings.REPEAT_SAY_BET
          .replace('{0}', bet.amount)
          .replace('{1}', res.mapBetType(bet.type, bet.numbers)));
      });
      speech += res.strings.REPEAT_LAST_BETS.replace('{0}', speechUtils.and(betText, {locale: event.request.locale}));
    } else {
      speech += res.strings.REPEAT_PLACE_BETS;
    }
    speech += ' ' + reprompt;

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
