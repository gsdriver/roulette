//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();
const ri = require('@jargon/alexa-skill-sdk').ri;

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
    const hand = attributes[attributes.currentHand];
    let speech;
    const speechParams = {};
    const betText = [];

    // Tell them the bankroll and their bets
    return utils.readBankroll(handlerInput)
    .then((bankroll) => {
      const bets = (hand.bets) ? hand.bets : hand.lastbets;
      if (!bets) {
        speech = 'REPEAT_PLACE_BETS';
        return [];
      }
      speech = (hand.bets) ? 'REPEAT_BETS' : 'REPEAT_LAST_BETS';
      const promises = [];

      bets.forEach((bet) => {
        const betParams = {};
        betParams.Amount = bet.amount;
        promises.push(utils.mapBetType(handlerInput, bet.type, bet.numbers));
        betText.push(ri('REPEAT_SAY_BET', betParams));
      });

      return Promise.all(promises)
      .then((values) => {
        let i;
        for (i = 0; i < values.length; i++) {
          betText[i].params.Bet = values[i];
        }
        return handlerInput.jrm.renderBatch(betText);
      });
    }).then((betList) => {
      speechParams.Bets = speechUtils.and(betList, {locale: event.request.locale});
      return handlerInput.jrb
        .speak(ri(speech, speechParams))
        .reprompt(ri('REPEAT_REPROMPT'))
        .getResponse();
    });
  },
};
