//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    // This intent must have four numbers (1-36) associated with it, and they
    // must be adjecent to each other on the board
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let ssml;
    let speechError;
    let reprompt;
    const numbers = [];

    if (!intent.slots.FirstNumber || !intent.slots.FirstNumber.value
      || !intent.slots.SecondNumber || !intent.slots.SecondNumber.value
      || !intent.slots.ThirdNumber || !intent.slots.ThirdNumber.value
      || !intent.slots.FourthNumber || !intent.slots.FourthNumber.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must say four numbers with a corner bet';
      reprompt = 'What else can I help you with?';
    } else {
      numbers.push(utils.number(intent.slots.FirstNumber.value));
      numbers.push(utils.number(intent.slots.SecondNumber.value));
      numbers.push(utils.number(intent.slots.ThirdNumber.value));
      numbers.push(utils.number(intent.slots.FourthNumber.value));
      if (numbers[0] === undefined) {
        speechError = 'Sorry, ' + intent.slots.FirstNumber.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else if (numbers[1] === undefined) {
        speechError = 'Sorry, ' + intent.slots.SecondNumber.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else if (numbers[2] === undefined) {
        speechError = 'Sorry, ' + intent.slots.ThirdNumber.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else if (numbers[3] === undefined) {
        speechError = 'Sorry, ' + intent.slots.FourthNumber.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else {
        const bet = {};

        // Make sure these are adjacent numbers and are all greater than 0
        numbers.sort();
        if (!((numbers[0] > 0) && (numbers[1] == (numbers[0] + 1))
          && (numbers[3] == (numbers[2] + 1)) && (numbers[2] == (numbers[0] + 3))
          && (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3)))) {
          // This is not a valid bet
          speechError = 'Sorry those numbers are not adjacent on a roulette wheel.';
          reprompt = 'What else can I help you with?';
        } else {
          bet.amount = utils.betAmount(intent, session);
          if (bet.amount === -1) {
            // Oops, you can't bet this much
            speechError = 'Sorry, this bet exceeds your bankroll of ' + session.attributes.bankroll + ' units.';
            reprompt = 'What else can I help you with?';
          } else {
            bet.numbers = numbers;
            bet.type = 'Corner';
            if (session.attributes.bets) {
              session.attributes.bets.unshift(bet);
            } else {
              session.attributes.bets = [bet];
            }

            // OK, let's callback
            reprompt = 'Place another bet or say spin the wheel to spin.';
            ssml = utils.speakBet(bet.amount, 'corner bet on ' + utils.speakNumbers(numbers) + '.', reprompt);
          }
        }
      }
    }

    // OK, let's callback
    callback(session, context, speechError, null, ssml, reprompt);
  },
};
