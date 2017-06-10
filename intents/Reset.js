//
// Resets your bankroll and clears all bets
//

'use strict';

module.exports = {
  handleIntent: function() {
    // We will ask them if they want to reset
    const res = require('../' + this.event.request.locale + '/resources');
    const speech = res.strings.RESET_CONFIRM;

    this.handler.state = 'CONFIRMRESET';
    this.emit(':ask', speech, speech);
  },
  handleYesReset: function() {
    // Confirmed - let's reset
    const res = require('../' + this.event.request.locale + '/resources');
    let hand;

    // Reset the hands (keep number of spins though)
    hand = this.attributes['american'];
    hand.bankroll = 1000;
    hand.high = 1000;
    hand.bets = undefined;
    hand.lastbets = undefined;

    hand = this.attributes['european'];
    hand.bankroll = 1000;
    hand.high = 1000;
    hand.bets = undefined;
    hand.lastbets = undefined;

    this.handler.state = 'INGAME';
    this.emit(':ask', res.strings.RESET_COMPLETED, res.strings.RESET_REPROMPT);
  },
  handleNoReset: function() {
    // Nope, they are not going to reset - so go back to start a new game
    const res = require('../' + this.event.request.locale + '/resources');

    this.handler.state = 'INGAME';
    this.emit(':ask', res.strings.RESET_ABORTED, res.strings.RESET_REPROMPT);
  },
};
