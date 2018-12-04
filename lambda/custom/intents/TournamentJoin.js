//
// Handles whether to join (or pass) on a tounrmanet
//

'use strict';

const tournament = require('../tournament');
const buttons = require('../buttons');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Button press counts as yes if it's a new button
    // or one that's been pressed before
    if (attributes.temp.joinTournament && (request.type === 'GameEngine.InputHandlerEvent')) {
      const buttonId = buttons.getPressedButton(request, attributes);
      if (buttonId && (!attributes.temp.buttonId || (buttonId == attributes.temp.buttonId))) {
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
    let speech;

    return tournament.joinTournament(handlerInput)
    .then((text) => {
      speech = text;
      return handlerInput.jrm.render(ri('TOURAMENT_WELCOME_REPROMPT'));
    }).then((reprompt) => {
      // Note strings have already been resolved
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt)
        .getResponse();
    });
  },
};
