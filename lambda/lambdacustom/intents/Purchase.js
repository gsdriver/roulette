//
// Handles purchasing of premium content
//

'use strict';

const utils = require('../utils');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return (request.type === 'IntentRequest')
      && attributes.paid && (request.intent.name === 'PurchaseIntent');
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // We only have product which is nice!
    const product = 'Tournament';
    if (!attributes.paid || !attributes.paid[product]) {
      // That really shouldn't happen
      return handlerInput.jrb
        .speak(ri('UNKNOWN_INTENT', {Suggestion: 'Help'}))
        .reprompt(ri('UNKNOWN_INTENT_REPROMPT', {Suggestion: 'Help'}))
        .getResponse();
    }

    const token = 'roulette.Tournament.launch';
    return handlerInput.jrb
      .addDirective({
        'type': 'Connections.SendRequest',
        'name': 'Buy',
        'payload': {
          'InSkillProduct': {
            'productId': attributes.paid[product].productId,
          },
        },
        'token': token,
      })
      .withShouldEndSession(true)
      .getResponse();
  },
};
