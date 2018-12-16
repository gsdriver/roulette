//
// Handles setting the rules of the game (either a single or double zero board)
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can't do while waiting to join a tournament
    return (!attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      (request.intent.name === 'RulesIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech;
    let reprompt;
    const speechParams = {};

    if (!event.request.intent.slots.Rules
      || !event.request.intent.slots.Rules.value) {
      // Sorry - reject this
      return handlerInput.jrb
        .speak(ri('RULES_NO_WHEELTYPE'))
        .reprompt(ri('RULES_ERROR_REPROMPT'))
        .getResponse();
    } else {
      return utils.mapWheelType(handlerInput, event.request.intent.slots.Rules.value)
      .then((game) => {
        if (!game) {
          speechParams.Rule = event.request.intent.slots.Rules.value;
          return handlerInput.jrb
            .speak(ri('RULES_INVALID_VARIANT', speechParams))
            .reprompt(ri('RULES_ERROR_REPROMPT'))
            .getResponse();
        } else if (game === 'tournament') {
          // Is the tournament active?
          if (!tournament.canEnterTournament(attributes)) {
            return handlerInput.jrb
              .speak(ri('RULES_NO_TOURNAMENT'))
              .reprompt(ri('RULES_ERROR_REPROMPT'))
              .getResponse();
          } else {
            // OK, set up the tournament!
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
          }
        } else {
          // OK, set the wheel, clear all bets, and set the bankroll based on the highScore object
          let hand;

          // Clear the old
          hand = attributes[attributes.currentHand];
          hand.bets = undefined;
          hand.lastbets = undefined;

          // Set the new
          attributes.currentHand = game;
          hand = attributes[attributes.currentHand];

          speech = (game === 'american') ? 'RULES_SET_AMERICAN' : 'RULES_SET_EUROPEAN';
          return handlerInput.jrb
            .speak(ri(speech))
            .reprompt(ri(reprompt))
            .getResponse();
        }
      });
    }
  },
};
