//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // This intent must have four numbers (1-36) associated with it, and they
    // must be adjecent to each other on the board
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let ssml;
    let speechError;
    let reprompt;
    const numbers = [];
    const res = require('../' + this.event.request.locale + '/resources');

    // You need at least one number
    if (!this.event.request.intent.slots.FirstNumber
      || !this.event.request.intent.slots.FirstNumber.value) {
      // Sorry - reject this
      speechError = res.strings.BETNUMBERS_MISSING_NUMBERS;
      reprompt = res.strings.BET_INVALID_REPROMPT;
    } else {
      // Up to six numbers will be considered
      let count = 0;
      let i;
      let num;
      const numberSlots = [this.event.request.intent.slots.FirstNumber,
        this.event.request.intent.slots.SecondNumber,
        this.event.request.intent.slots.ThirdNumber,
        this.event.request.intent.slots.FourthNumber,
        this.event.request.intent.slots.FifthNumber,
        this.event.request.intent.slots.SixthNumber];

      for (i = 0; i < numberSlots.length; i++) {
        if (numberSlots[i] && numberSlots[i].value) {
          num = utils.number(this.event.request.locale,
            numberSlots[i].value, this.attributes.doubleZeroWheel);
          if (num == undefined) {
            speechError = res.strings.BETNUMBERS_INVALID_NUMBER.replace('{0}', numberSlots[i].value);
            reprompt = res.strings.BET_INVALID_REPROMPT;
          } else {
            numbers.push(num);
            count++;
          }
        }
      }

      if (!speechError) {
        // Now for the data validation - different based on the count of numbers
        numbers.sort((a, b) => (a - b));
        switch (count) {
          case 0:
            speechError = res.strings.BETNUMBERS_INVALID_FIRSTNUMBER.replace('{0}', this.event.request.intent.slots.FirstNumber.value);
            reprompt = res.strings.BET_INVALID_REPROMPT;
            break;
          case 5:
            speechError = res.strings.BETNUMBERS_INVALID_FIVENUMBERS;
            reprompt = res.strings.BET_INVALID_REPROMPT;
            break;
          case 1:
            // Any number works
            break;
          case 2:
            if (!(((numbers[0] === -1) && (numbers[1] === 0))
              || (numbers[1] == (numbers[0] + 3))
              || ((numbers[1] == (numbers[0] + 1))
              && (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3))))) {
              // This is not a valid bet
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
            break;
          case 3:
            if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
              && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == numbers[0] + 1))) {
              // This is not a valid bet
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
            break;
          case 4:
            if (!((numbers[0] > 0) && (numbers[1] == (numbers[0] + 1))
              && (numbers[3] == (numbers[2] + 1)) && (numbers[2] == (numbers[0] + 3))
              && (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3)))) {
              // This is not a valid bet
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
            break;
          case 6:
            if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
              && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == (numbers[0] + 1))
              && (Math.ceil(numbers[3] / 3) == Math.ceil(numbers[5] / 3))
              && (numbers[5] == (numbers[4] + 1)) && (numbers[4] == (numbers[3] + 1)))) {
              // This is not a valid bet
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
        }
      }

      if (!speechError) {
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
          bet.numbers = numbers;
          bet.type = 'Numbers';
          if (this.attributes.bets) {
            this.attributes.bets.unshift(bet);
          } else {
            this.attributes.bets = [bet];
          }

          // OK, let's callback
          reprompt = res.strings.BET_PLACED_REPROMPT;
          ssml = res.strings.BETNUMBERS_PLACED.replace('{0}', bet.amount).replace('{1}', utils.speakNumbers(this.event.request.locale, numbers)).replace('{2}', reprompt);
        }
      }
    }

    // OK, let's callback
    this.handler.state = 'INGAME';
    utils.emitResponse(this.emit, this.event.request.locale, speechError, null, ssml, reprompt);
  },
};


