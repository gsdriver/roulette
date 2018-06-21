//
// Resets your bankroll and clears all bets
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // We will ask them if they want to reset
    const res = require('../' + this.event.request.locale + '/resources');
    let speech;
    let reprompt;
    const hand = this.attributes[this.attributes.currentHand];

    if (hand.canReset) {
      speech = res.strings.RESET_CONFIRM;
      reprompt = res.strings.RESET_CONFIRM;
      this.handler.state = 'CONFIRMRESET';
    } else {
      speech = res.strings.TOURNAMENT_NORESET;
      reprompt = res.strings.TOURNAMENT_INVALIDACTION_REPROMPT;
    }

    utils.emitResponse(this, null, null, speech, reprompt);
  },
  handleYesReset: function() {
    // Confirmed - let's reset
    const res = require('../' + this.event.request.locale + '/resources');
    const hand = this.attributes[this.attributes.currentHand];

    // Reset the hands (keep number of spins though)
    hand.bankroll = 1000;
    hand.high = 1000;
    hand.bets = undefined;
    hand.lastbets = undefined;

    this.handler.state = 'INGAME';
    utils.emitResponse(this, null, null,
          res.strings.RESET_COMPLETED, res.strings.RESET_REPROMPT);
  },
  handleNoReset: function() {
    // Nope, they are not going to reset - so go back to start a new game
    const res = require('../' + this.event.request.locale + '/resources');

    this.handler.state = 'INGAME';
    utils.emitResponse(this, null, null,
          res.strings.RESET_ABORTED, res.strings.RESET_REPROMPT);
  },
};
