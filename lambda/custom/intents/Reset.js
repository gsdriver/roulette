//
// Resets your bankroll and clears all bets
//

'use strict';

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return ((request.type === 'IntentRequest') && (request.intent.name === 'ResetIntent')
      && !attributes.temp.resetting);
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    let speech;
    let reprompt;
    const hand = attributes[attributes.currentHand];

    if (hand.canReset) {
      speech = res.strings.RESET_CONFIRM;
      reprompt = res.strings.RESET_CONFIRM;
      attributes.temp.resetting = true;
    } else {
      speech = res.strings.TOURNAMENT_NORESET;
      reprompt = res.strings.TOURNAMENT_INVALIDACTION_REPROMPT;
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
