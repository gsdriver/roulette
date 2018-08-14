//
// Handles whether to join (or pass) on a tounrmanet
//

'use strict';

const tournament = require('../tournament');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can only do while waiting to join a tournament
    return (attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      ((request.intent.name === 'AMAZON.YesIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    let speech;
    const reprompt = res.strings.TOURNAMENT_WELCOME_REPROMPT;

    attributes.currentHand = 'tournament';
    if (!attributes.tournament) {
      // New player
      const MAXSPINS = 50;
      const STARTINGBANKROLL = 1000;

      attributes.tournamentsPlayed = (this.attributes.tournamentsPlayed + 1) || 1;
      attributes['tournament'] = {
        bankroll: STARTINGBANKROLL,
        doubleZeroWheel: true,
        canReset: false,
        minBet: 1,
        maxBet: 500,
        maxSpins: MAXSPINS,
        high: STARTINGBANKROLL,
        spins: 0,
        timestamp: Date.now(),
      };

      speech = res.strings.TOURNAMENT_WELCOME_NEWPLAYER
        .replace('{0}', STARTINGBANKROLL)
        .replace('{1}', MAXSPINS);
      speech += reprompt;
      handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt);
    } else {
      const hand = attributes[attributes.currentHand];

      return new Promise((resolve, reject) => {
        speech = res.strings.TOURNAMENT_WELCOME_BACK.replace('{0}', hand.maxSpins - hand.spins);
        tournament.readStanding(event.request.locale, attributes, (standing) => {
          if (standing) {
            speech += standing;
          }

          speech += reprompt;
          handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt);
          resolve();
        });
      });
    }
  },
};
