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
    bet.numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
    bet.type = 'Odd';
    if (session.attributes.bets) {
      session.attributes.bets.unshift(bet);
    } else {
      session.attributes.bets = [bet];
    }

    speech = bet.amount + ' unit';
    if (bet.amount > 1) {
      speech += 's';
    }
    speech += ' placed on odd numbers';
    reprompt = 'Place another bet or say spin the wheel to spin.';
    speech += ('. ' + reprompt);

    // OK, let's callback
    callback(session, context, null, speech, reprompt);
  }
};
