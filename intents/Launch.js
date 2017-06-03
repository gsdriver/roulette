//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll and offer a few things they can do
    const reprompt = 'You can place a bet by saying bet on red, bet on six, or bet on the first dozen';
    let speech = 'Welcome to Roulette Wheel. ';

    speech += ('You have ' + this.attributes.bankroll + ' units. ');

    utils.readRank(this.attributes, (err, rank) => {
      // Let them know their current rank
      if (rank) {
        speech += rank;
      }

      speech += reprompt;
      utils.emitResponse(this.emit, null, null, speech, reprompt);
    });
  },
};
