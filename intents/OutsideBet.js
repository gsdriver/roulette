//
// Handles outside bets - red, black, high, low, even, odd, column, and dozen
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let reprompt;
    let speechError;
    let ssml;
    let ordinal;
    const bet = {};
    const res = require('../' + this.event.request.locale + '/resources');

    // For column and dozen, there needs to be an ordinal
    if ((this.event.request.intent.name === 'ColumnIntent') ||
            (this.event.request.intent.name === 'DozenIntent')) {
      if (!this.event.request.intent.slots.Ordinal
        || !this.event.request.intent.slots.Ordinal.value) {
        // Sorry - reject this
        speechError = (this.event.request.intent.name === 'ColumnIntent')
              ? res.strings.BETCOLUMN_INVALID_COLUMN
              : res.strings.BETDOZEN_INVALID_DOZEN;
        reprompt = res.strings.BET_INVALID_REPROMPT;
      } else {
        ordinal = res.valueFromOrdinal(this.event.request.intent.slots.Ordinal.value);
        if (!ordinal) {
          speechError = (this.event.request.intent.name === 'ColumnIntent')
              ? res.strings.BETCOLUMN_INVALID_COLUMN_VALUE
              : res.strings.BETDOZEN_INVALID_DOZEN_VALUE;
          speechError = speechError.replace('{0}', this.event.request.intent.slots.Ordinal.value);
          reprompt = res.strings.BET_INVALID_REPROMPT;
        }
      }
    }

    // Keep validating input if we don't have an error yet
    if (!speechError) {
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
      }
    }

    if (!speechError) {
      // OK, we're good to bet - let's set up the numbers and type
      switch (this.event.request.intent.name) {
        case 'BlackIntent':
          bet.numbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
          bet.type = 'Black';
          ssml = res.strings.BETBLACK_PLACED;
          break;
        case 'RedIntent':
          bet.numbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
          bet.type = 'Red';
          ssml = res.strings.BETRED_PLACED;
          break;
        case 'EvenIntent':
          bet.numbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
          bet.type = 'Even';
          ssml = res.strings.BETEVEN_PLACED;
          break;
        case 'OddIntent':
          bet.numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
          bet.type = 'Odd';
          ssml = res.strings.BETODD_PLACED;
          break;
        case 'HighIntent':
          bet.numbers = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
          bet.type = 'High';
          ssml = res.strings.BETHIGH_PLACED;
          break;
        case 'LowIntent':
          bet.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
          bet.type = 'Low';
          ssml = res.strings.BETLOW_PLACED;
          break;
        case 'ColumnIntent':
          bet.numbers = [];
          for (let i = 0; i < 12; i++) {
            bet.numbers.push(3*i + ordinal);
          }
          bet.type = 'Column';
          ssml = res.strings.BETCOLUMN_PLACED.replace('{2}', ordinal);
          break;
        case 'DozenIntent':
          bet.numbers = [];
          for (let i = 0; i < 12; i++) {
            bet.numbers.push(12*(ordinal-1)+i+1);
          }
          bet.type = 'Dozen';
          ssml = res.strings.BETDOZEN_PLACED.replace('{2}', ordinal);
          break;
        default:
          // This shouldn't happen
          console.log('Invalid outside bet???');
          break;
      }

      if (this.attributes.bets) {
        this.attributes.bets.unshift(bet);
      } else {
        this.attributes.bets = [bet];
      }

      reprompt = res.strings.BET_PLACED_REPROMPT;
      ssml = ssml.replace('{0}', bet.amount).replace('{1}', reprompt);
    }

    if (this.handler.state !== 'TOURNAMENT') {
      this.handler.state = 'INGAME';
    }
    utils.emitResponse(this.emit, this.event.request.locale, speechError, null, ssml, reprompt);
  },
};
