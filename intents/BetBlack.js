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
    const res = require('../' + this.event.request.locale + '/resources');

    bet.amount = utils.betAmount(this.event.request.intent, this.attributes);
    if (isNaN(bet.amount) || (bet.amount == 0)) {
      speechError = res.strings.BET_INVALID_AMOUNT.replace('{0}', bet.amount);
      reprompt = res.strings.BET_INVALID_REPROMPT;
    } else if (bet.amount > 500) {
      speechError = res.strings.BET_EXCEEDS_MAX;
      reprompt = res.strings.BET_INVALID_REPROMPT;
    } else if (bet.amount === -1) {
      // Oops, you can't bet this much
      speechError = res.strings.BET_EXCEEDS_BANKROLL.replace('{0}', this.attributes.bankroll);
      reprompt = res.strings.BET_INVALID_REPROMPT;
    } else {
      bet.numbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
      bet.type = 'Black';
      if (this.attributes.bets) {
        this.attributes.bets.unshift(bet);
      } else {
        this.attributes.bets = [bet];
      }

      reprompt = res.strings.BET_PLACED_REPROMPT;
      ssml = res.strings.BETBLACK_PLACED.replace('{0}', bet.amount).replace('{1}', reprompt);
    }

    utils.emitResponse(this.emit, this.event.request.locale, speechError, null, ssml, reprompt);
  },
};
