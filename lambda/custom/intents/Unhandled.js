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

    // Fail silently if this was an unhandled button event
    if (event.request.type !== 'GameEngine.InputHandlerEvent') {
      if (attributes.temp.joinTournament) {
        return handlerInput.responseBuilder
          .speak(res.strings.UNKNOWNINTENT_TOURNAMENT)
          .reprompt(res.strings.UNKNOWNINTENT_TOURNAMENT_REPROMPT)
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(res.strings.UNKNOWN_INTENT)
          .reprompt(res.strings.UNKNOWN_INTENT_REPROMPT)
          .getResponse();
      }
    }
  },
};
