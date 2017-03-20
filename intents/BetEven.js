//
// Handles bet of a single number - "Bet on five"
//

'use strict';

var utils = require('../utils');

module.exports = {
  HandleIntent : function(intent, session, context, callback) {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let speech;
    let reprompt;
    let bet = {};

    bet.amount = utils.BetAmount(intent, session);
    bet.numbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
    bet.type = 'Even';
    if (session.attributes.bets) {
      session.attributes.bets.unshift(bet);
    } else {
      session.attributes.bets = [bet];
    }

    speech = bet.amount + ' unit';
    if (bet.amount > 1) {
      speech += 's';
    }
    speech += ' placed on even numbers';
    reprompt = 'Place another bet or say spin the wheel to spin.';
    speech += ('. ' + reprompt);

    // OK, let's callback
    callback(session, context, null, speech, reprompt);
  }
};
