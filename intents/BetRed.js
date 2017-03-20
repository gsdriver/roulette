//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  HandleIntent: function(intent, session, context, callback) {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let speech;
    const reprompt = 'Place another bet or say spin the wheel to spin.';
    const bet = {};

    bet.amount = utils.betAmount(intent, session);
    bet.numbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    bet.type = 'Red';
    if (session.attributes.bets) {
      session.attributes.bets.unshift(bet);
    } else {
      session.attributes.bets = [bet];
    }

    speech = bet.amount + ' unit';
    if (bet.amount > 1) {
      speech += 's';
    }
    speech += ' placed on red';
    speech += ('. ' + reprompt);

    // OK, let's callback
    callback(session, context, null, speech, reprompt);
  },
};
