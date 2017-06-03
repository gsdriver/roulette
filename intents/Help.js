//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll and offer a few things they can do
    let helpText;
    let reprompt = 'You can place a bet by saying phrases like bet on red, bet on six, or bet on the first dozen.';

    helpText = 'Playing with ' + ((this.attributes.doubleZeroWheel)
      ? 'a double zero American ' : 'a single zero European ') + 'wheel. ';
    helpText += 'You have ' + this.attributes.bankroll + ' units. ';

    if (this.attributes.bets) {
      helpText += 'Say spin the wheel to play your bets. ';
      reprompt = 'You can place additional bets by saying phrases like bet on red, bet on six, or bet on the first dozen.';
    } else if (this.attributes.lastbets) {
      helpText += 'Say spin the wheel to play the same bets from last time. ';
      reprompt = 'You can place new bets by saying phrases like bet on red, bet on six, or bet on the first dozen.';
    }

    helpText += reprompt;
    utils.emitResponse(this.emit, null, null, helpText, reprompt);
  },
};
