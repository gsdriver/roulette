//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll, their ranking, and offer a few things they can do
    const res = require('../' + this.event.request.locale + '/resources');
    let helpText;
    let reprompt = res.strings.HELP_REPROMPT;

    utils.readRank(this.event.request.locale, this.attributes, false, (err, rank) => {
      helpText = (this.attributes.doubleZeroWheel)
        ? res.strings.HELP_WHEEL_AMERICAN
        : res.strings.HELP_WHEEL_EUROPEAN;
      helpText += res.strings.READ_BANKROLL.replace('{0}', this.attributes.bankroll);
      if (rank) {
        helpText += rank;
      }

      if (this.attributes.bets) {
        helpText += res.strings.HELP_SPIN_WITHBETS;
        reprompt = res.strings.HELP_SPIN_WITHBETS_REPROMPT;
      } else if (this.attributes.lastbets) {
        helpText += res.strings.HELP_SPIN_LASTBETS;
        reprompt = res.strings.HELP_SPIN_LASTBETS_REPROMPT;
      }

      helpText += reprompt;
      this.emit(':askWithCard', helpText, reprompt, res.strings.HELP_CARD_TITLE, res.strings.HELP_CARD_TEXT);
    });
  },
};
