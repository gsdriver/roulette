//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    const reprompt = 'Place another bet or say spin the wheel to spin.';
    const bet = {};

    bet.amount = utils.betAmount(intent, session);
    bet.numbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
    bet.type = 'Even';
    if (session.attributes.bets) {
      session.attributes.bets.unshift(bet);
    } else {
      session.attributes.bets = [bet];
    }

    // OK, let's callback
    const ssml = utils.speakBet(bet.amount, 'placed on even numbers', reprompt);
    callback(session, context, null, null, ssml, reprompt);
  },
};
