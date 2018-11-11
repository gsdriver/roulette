//
// Unhandled intents
//

'use strict';

const utils = require('../utils');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    return true;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Fail silently if this was an unhandled button event
    if ((event.request.type !== 'GameEngine.InputHandlerEvent') &&
      (event.request.type !== 'System.ExceptionEncountered')) {
      if (attributes.temp.joinTournament) {
        return handlerInput.jrb
          .speak(ri('UNKNOWNINTENT_TOURNAMENT'))
          .reprompt(ri('UNKNOWNINTENT_TOURNAMENT_REPROMPT'))
          .getResponse();
      } else {
        return utils.getBetSuggestion(handlerInput)
        .then((suggestion) => {
          const params = {};
          params.Suggestion = suggestion;
          return handlerInput.responseBuilder
            .speak(ri('UNKNOWN_INTENT', params))
            .reprompt(ri('UNKNOWN_INTENT_REPROMPT', params))
            .getResponse();
        });
      }
    }
  },
};
