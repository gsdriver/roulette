//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let reprompt;
    const bet = {};
    let speechError;
    let ssml;

    bet.amount = utils.betAmount(this.event.request.intent, this.attributes);
    if (isNaN(bet.amount) || (bet.amount == 0)) {
      speechError = 'I\'m sorry, ' + bet.amount + ' is not a valid amount to bet.';
      reprompt = 'What else can I help you with?';
    } else if (bet.amount === -1) {
      // Oops, you can't bet this much
      speechError = 'Sorry, this bet exceeds your bankroll of ' + this.attributes.bankroll + ' units.';
      reprompt = 'What else can I help you with?';
    } else {
      let i;

      bet.numbers = [];
      for (i = 1; i <= 18; i++) {
        bet.numbers.push(i);
      }
      bet.type = 'Low';

      if (this.attributes.bets) {
        this.attributes.bets.unshift(bet);
      } else {
        this.attributes.bets = [bet];
      }

      reprompt = 'Place another bet or say spin the wheel to spin.';
      ssml = utils.speakBet(bet.amount, 'placed on low numbers.', reprompt);
    }

    // OK, let's callback
    utils.emitResponse(this.emit, speechError, null, ssml, reprompt);
  },
};