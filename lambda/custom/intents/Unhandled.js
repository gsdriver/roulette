//
// Unhandled intents
//

'use strict';

module.exports = {
  canHandle: function(handlerInput) {
    return true;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const res = require('../resources')(event.request.locale);
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Are they resetting?
    if (attributes.temp.resetting) {
      handlerInput.responseBuilder
        .speak(res.strings.UNKNOWNINTENT_RESET)
        .reprompt(res.strings.UNKNOWNINTENT_RESET_REPROMPT);
    } else {
      handlerInput.responseBuilder
        .speak(res.strings.UNKNOWN_INTENT)
        .reprompt(res.strings.UNKNOWN_INTENT_REPROMPT);
    }
  },
};
