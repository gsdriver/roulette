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

    // You need at least one number
    if (!this.event.request.intent.slots.FirstNumber
      || !this.event.request.intent.slots.FirstNumber.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must say a number for this bet';
      reprompt = 'What else can I help you with?';
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
          num = utils.number(numberSlots[i].value, this.attributes.doubleZeroWheel);
          if (num == undefined) {
            speechError = 'Sorry, ' + numberSlots[i].value + ' is not a valid number.';
            reprompt = 'What else can I help you with?';
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
            speechError = 'Sorry, ' + this.event.request.intent.slots.FirstNumber.value + ' is not a valid roulette bet';
            reprompt = 'What else can I help you with?';
            break;
          case 5:
            speechError = 'Sorry, you cannot place a bet on five numbers';
            reprompt = 'What else can I help you with?';
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
              speechError = 'Sorry those numbers are not adjacent on a roulette wheel.';
              reprompt = 'What else can I help you with?';
            }
            break;
          case 3:
            if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
              && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == numbers[0] + 1))) {
              // This is not a valid bet
              speechError = 'Sorry those numbers are not adjacent on a roulette wheel.';
              reprompt = 'What else can I help you with?';
            }
            break;
          case 4:
            if (!((numbers[0] > 0) && (numbers[1] == (numbers[0] + 1))
              && (numbers[3] == (numbers[2] + 1)) && (numbers[2] == (numbers[0] + 3))
              && (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3)))) {
              // This is not a valid bet
              speechError = 'Sorry those numbers are not adjacent on a roulette wheel.';
              reprompt = 'What else can I help you with?';
            }
            break;
          case 6:
            if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
              && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == (numbers[0] + 1))
              && (Math.ceil(numbers[3] / 3) == Math.ceil(numbers[5] / 3))
              && (numbers[5] == (numbers[4] + 1)) && (numbers[4] == (numbers[3] + 1)))) {
              // This is not a valid bet
              speechError = 'Sorry those numbers are not adjacent on a roulette wheel.';
              reprompt = 'What else can I help you with?';
            }
        }
      }

      if (!speechError) {
        const bet = {};
        bet.amount = utils.betAmount(this.event.request.intent, this.attributes);
        if (isNaN(bet.amount) || (bet.amount == 0)) {
          speechError = 'I\'m sorry, ' + bet.amount + ' is not a valid amount to bet.';
          reprompt = 'What else can I help you with?';
        } else if (bet.amount === -1) {
          // Oops, you can't bet this much
          speechError = 'Sorry, this bet exceeds your bankroll of ' + this.attributes.bankroll + ' units.';
          reprompt = 'What else can I help you with?';
        } else {
          bet.numbers = numbers;
          bet.type = 'Numbers';
          if (this.attributes.bets) {
            this.attributes.bets.unshift(bet);
          } else {
            this.attributes.bets = [bet];
          }

          // OK, let's callback
          reprompt = 'Place another bet or say spin the wheel to spin.';
          ssml = utils.speakBet(bet.amount, 'bet on ' + utils.speakNumbers(numbers) + '.', reprompt);
        }
      }
    }

    // OK, let's callback
    utils.emitResponse(this.emit, speechError, null, ssml, reprompt);
  },
};


