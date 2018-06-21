//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll, and offer a few things they can do
    const res = require('../' + this.event.request.locale + '/resources');
    let helpText;
    let reprompt = res.strings.HELP_REPROMPT;
    const hand = this.attributes[this.attributes.currentHand];

    // Special help for survey offered
    if ((this.handler.state === 'SURVEYOFFERED')
        || (this.handler.state === 'INSURVEY')) {
      utils.emitResponse(this, null, null,
              res.strings.SURVEY_HELP_TEXT, res.strings.SURVEY_HELP_REPROMPT);
    } else if (this.attributes.currentHand === 'tournament') {
      // Help is different for tournament play
      tournament.readHelp(this);
    } else {
      helpText = (hand.doubleZeroWheel)
        ? res.strings.HELP_WHEEL_AMERICAN
        : res.strings.HELP_WHEEL_EUROPEAN;

      // Read
      helpText += utils.readBankroll(this.event.request.locale, this.attributes);
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
      utils.emitResponse(this, null, null,
              helpText, reprompt, res.strings.HELP_CARD_TITLE, cardText);
    }
  },
};
