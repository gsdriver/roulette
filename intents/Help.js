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
      utils.emitResponse(this.emit, this.event.request.locale,
            null, null, res.strings.SURVEY_HELP_TEXT, res.strings.SURVEY_HELP_REPROMPT);
    } else if (this.attributes.currentHand === 'tournament') {
      // Help is different for tournament play
      tournament.readHelp(this.emit, this.event.request.locale, this.attributes);
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

      helpText += reprompt;
      this.emit(':askWithCard', helpText, reprompt, res.strings.HELP_CARD_TITLE, res.strings.HELP_CARD_TEXT);
    }
  },
};
