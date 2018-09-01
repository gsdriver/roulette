//
// Handles whether to join (or pass) on a tounrmanet
//

'use strict';

const tournament = require('../tournament');
const buttons = require('../buttons');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Button press counts as yes if it's a new button
    // or one that's been pressed before
    if (attributes.temp.joinTournament && (request.type === 'GameEngine.InputHandlerEvent')) {
      const buttonId = buttons.getPressedButton(request, attributes);
      if (!attributes.temp.buttonId || (buttonId == attributes.temp.buttonId)) {
        attributes.temp.buttonId = buttonId;
        return true;
      }
    }

    // Can only do while waiting to join a tournament
    return (attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      ((request.intent.name === 'AMAZON.YesIntent')));
  },
  handle: function(handlerInput) {
    return new Promise((resolve, reject) => {
      tournament.joinTournament(handlerInput, (speech, reprompt) => {
        const response = handlerInput.responseBuilder
          .speak(speech)
          .reprompt(reprompt)
          .getResponse();
        resolve(response);
      });
    });
  },
};
