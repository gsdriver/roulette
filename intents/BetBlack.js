//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let reprompt;
    const bet = {};
    let speechError;
    let ssml;

    bet.amount = utils.betAmount(intent, session);
    if (bet.amount === -1) {
      // Oops, you can't bet this much
      speechError = 'Sorry, this bet exceeds your bankroll of ' + session.attributes.bankroll + ' units.';
      reprompt = 'What else can I help you with?';
    } else {
      bet.numbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
      bet.type = 'Black';
      if (session.attributes.bets) {
        session.attributes.bets.unshift(bet);
      } else {
        session.attributes.bets = [bet];
      }

      reprompt = 'Place another bet or say spin the wheel to spin.';
      ssml = utils.speakBet(bet.amount, 'placed on black.', reprompt);
    }

    // OK, let's callback
    callback(session, context, speechError, null, ssml, reprompt);
  },
};
