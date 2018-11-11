//
// Handles stop, which will exit the skill
//

'use strict';

const ads = require('../ads');
const tournament = require('../tournament');
const ri = require('@jargon/alexa-skill-sdk').ri;

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

    return ads.getAd(attributes, 'roulette', event.request.locale)
    .then((adText) => {
      const params = {};
      let speech;

      if (tournament.playReminderText()) {
        speech = 'EXIT_GAME_TOURNAMENT';
      } else {
        speech = 'EXIT_GAME';
        params.Ad = adText;
      }

      return handlerInput.jrb
        .speak(ri(speech, params))
        .withShouldEndSession(true)
        .getResponse();
    });
  },
};
