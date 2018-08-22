//
// Resets your bankroll and clears all bets
//

'use strict';

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return ((request.type === 'IntentRequest') && attributes.temp.resetting
      && ((request.intent.name === 'AMAZON.YesIntent') ||
        (request.intent.name === 'AMAZON.StopIntent') ||
        (request.intent.name === 'AMAZON.NoIntent') ||
        (request.intent.name === 'AMAZON.CancelIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);

    attributes.temp.resetting = undefined;
    if (event.request.intent.name === 'AMAZON.YesIntent') {
      const hand = attributes[attributes.currentHand];

      // Reset the hands (keep number of spins though)
      hand.bankroll = 1000;
      hand.high = 1000;
      hand.bets = undefined;
      hand.lastbets = undefined;

      return handlerInput.responseBuilder
        .speak(res.strings.RESET_COMPLETED)
        .reprompt(res.strings.RESET_REPROMPT)
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(res.strings.RESET_ABORTED)
        .reprompt(res.strings.RESET_REPROMPT)
        .getResponse();
    }
  },
};
