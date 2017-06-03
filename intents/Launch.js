//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll and offer a few things they can do
    const speech = 'Welcome to Roulette Wheel. You can place a bet on individual numbers, red or black, even or odd, and groups of numbers. Place your bets!';
    const reprompt = 'You can place a bet by saying bet on red, bet on six, or bet on the first dozen';

    utils.emitResponse(this.emit, null, null, speech, reprompt);
  },
};
