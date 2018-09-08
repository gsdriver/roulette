//
// Handles stop, which will exit the skill
//

'use strict';

const ads = require('../ads');
const tournament = require('../tournament');

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const hand = attributes[attributes.currentHand];

    // Can always handle with Stop
    if (request.type === 'IntentRequest') {
      if (request.intent.name === 'AMAZON.StopIntent') {
        return true;
      }
      // Cancel or no exit if no bets
      if ((request.intent.name === 'AMAZON.CancelIntent') ||
        (request.intent.name === 'AMAZON.NoIntent')) {
        return (!hand.bets || (hand.bets.length === 0));
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);

    return new Promise((resolve, reject) => {
      ads.getAd(attributes, 'roulette', event.request.locale, (adText) => {
        let speech = tournament.getReminderText(event.request.locale);
        speech += res.strings.EXIT_GAME.replace('{0}', adText);
        const response = handlerInput.responseBuilder
          .speak(speech)
          .withShouldEndSession(true)
          .getResponse();
        resolve(response);
      });
    });
  },
};
