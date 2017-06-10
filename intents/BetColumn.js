//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // This intent has an ordinal (first, second, or third) associated with it
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let ssml;
    let speechError;
    let column;
    let reprompt;
    const res = require('../' + this.event.request.locale + '/resources');

    if (!this.event.request.intent.slots.Ordinal
      || !this.event.request.intent.slots.Ordinal.value) {
      // Sorry - reject this
      speechError = res.strings.BETCOLUMN_INVALID_COLUMN;
      reprompt = res.strings.BET_INVALID_REPROMPT;
    } else {
      column = res.valueFromOrdinal(this.event.request.intent.slots.Ordinal.value);
      if (!column) {
        speechError = res.strings.BETCOLUMN_INVALID_COLUMN_VALUE.replace('{0}', this.event.request.intent.slots.Ordinal.value);
        reprompt = res.strings.BET_INVALID_REPROMPT;
      } else {
        const bet = {};

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
          bet.numbers = [];
          for (let i = 0; i < 12; i++) {
            bet.numbers.push(3*i + column);
          }

          bet.type = 'Column';
          if (this.attributes.bets) {
            this.attributes.bets.unshift(bet);
          } else {
            this.attributes.bets = [bet];
          }

          reprompt = res.strings.BET_PLACED_REPROMPT;
          ssml = res.strings.BETCOLUMN_PLACED.replace('{0}', bet.amount).replace('{1}', column).replace('{2}', reprompt);
        }
      }
    }

    // OK, let's callback
    if (this.handler.state !== 'TOURNAMENT') {
      this.handler.state = 'INGAME';
    }
    utils.emitResponse(this.emit, this.event.request.locale, speechError, null, ssml, reprompt);
  },
};
