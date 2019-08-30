//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return ((request.type === 'IntentRequest') &&
      (request.intent.name === 'AMAZON.HelpIntent'));
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const hand = attributes[attributes.currentHand];
    let speech;
    const speechParams = {};

    // Special help for join tournament
    if (attributes.temp.joinTournament) {
      return handlerInput.jrb
        .speak(ri('HELP_JOIN_TOURNAMENT'))
        .reprompt(ri('HELP_JOIN_TOURNAMENT_REPROMPT'))
        .getResponse();
    } else if (attributes.currentHand === 'tournament') {
      // Help is different for tournament play
      return tournament.readHelp(handlerInput);
    } else {
      const achievementScore = utils.getAchievementScore(attributes.achievements);

      speech = (hand.doubleZeroWheel) ? 'HELP_WHEEL_AMERICAN' : 'HELP_WHEEL_EUROPEAN';
      speechParams.Bankroll = hand.bankroll;
      speechParams.Achievements = (achievementScore && !process.env.NOACHIEVEMENT)
        ? achievementScore : 0;
      if (hand.bets) {
        speech += '_WITHBETS';
      } else if (hand.lastbets) {
        speech += '_LASTBETS';
      } else {
        speech += '_CHECKAPP';
      }

      return utils.betRange(handlerInput, hand)
      .then((range) => {
        const helpParams = {};
        helpParams.Range = range;
        return handlerInput.jrb
          .speak(ri(speech, speechParams))
          .reprompt(ri('HELP_REPROMPT'))
          .withSimpleCard(ri('HELP_CARD_TITLE'), ri('HELP_CARD_TEXT', helpParams))
          .getResponse();
      });
    }
  },
};
