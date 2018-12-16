//
// Reads the top high scores
//

'use strict';

const utils = require('../utils');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can't do while waiting to join a tournament
    return (!attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      (request.intent.name === 'HighScoreIntent'));
  },
  handle: function(handlerInput) {
    return utils.readLeaderBoard(handlerInput)
    .then((highScores) => {
      const speechParams = {};
      speechParams.HighScores = highScores;
      return handlerInput.jrb
        .speak(ri('HIGHSCORE_TEXT', speechParams))
        .reprompt(ri('HIGHSCORE_REPROMPT'))
        .getResponse();
    });
  },
};
