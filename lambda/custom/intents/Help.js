//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return ((request.type === 'IntentRequest') &&
      (request.intent.name === 'AMAZON.HelpIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    let helpText;
    let reprompt = res.strings.HELP_REPROMPT;
    const hand = attributes[attributes.currentHand];

    // Special help for join tournament or resetting bankroll
    if (attributes.temp.resetting) {
      handlerInput.responseBuilder
        .speak(res.strings.HELP_RESET)
        .reprompt(res.strings.HELP_RESET);
    } else if (attributes.temp.joinTournament) {
      handlerInput.responseBuilder
        .speak(res.strings.HELP_JOIN_TOURNAMENT)
        .reprompt(res.strings.HELP_JOIN_TOURNAMENT_REPROMPT);
    } else if (attributes.currentHand === 'tournament') {
      // Help is different for tournament play
      return new Promise((resolve, reject) => {
        tournament.readHelp(event, attributes, resolve);
      });
    } else {
      helpText = (hand.doubleZeroWheel)
        ? res.strings.HELP_WHEEL_AMERICAN
        : res.strings.HELP_WHEEL_EUROPEAN;

      // Read
      helpText += utils.readBankroll(event.request.locale, attributes);
      if (hand.bets) {
        helpText += res.strings.HELP_SPIN_WITHBETS;
        reprompt = res.strings.HELP_SPIN_WITHBETS_REPROMPT;
      } else if (hand.lastbets) {
        helpText += res.strings.HELP_SPIN_LASTBETS;
        reprompt = res.strings.HELP_SPIN_LASTBETS_REPROMPT;
      }

      if (!process.env.NOACHIEVEMENT) {
        helpText = res.strings.HELP_ACHIEVEMENT_POINTS + helpText;
      }
      helpText += reprompt;

      let cardText = res.strings.HELP_CARD_TEXT.replace('{0}', res.betRange(hand));
      if (!process.env.NOACHIEVEMENT) {
        cardText = res.strings.HELP_ACHIEVEMENT_CARD_TEXT + cardText;
      }

      handlerInput.responseBuilder
        .speak(helpText)
        .reprompt(reprompt)
        .withSimpleCard(res.strings.HELP_CARD_TITLE, cardText);
    }
  },
};
