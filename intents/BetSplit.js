//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    // This intent must have a number (double zero or 0-36) associated with it
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let ssml;
    let speechError;
    let reprompt;
    const numbers = [];

    if (!intent.slots.FirstNumber || !intent.slots.FirstNumber.value
      || !intent.slots.SecondNumber || !intent.slots.SecondNumber.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must say two numbers with a split bet';
      reprompt = 'What else can I help you with?';
    } else {
      numbers.push(utils.number(intent.slots.FirstNumber.value,
        session.attributes.doubleZeroWheel));
      numbers.push(utils.number(intent.slots.SecondNumber.value,
        session.attributes.doubleZeroWheel));
      if (numbers[0] === undefined) {
        speechError = 'Sorry, ' + intent.slots.FirstNumber.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else if (numbers[1] === undefined) {
        speechError = 'Sorry, ' + intent.slots.SecondNumber.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else {
        const bet = {};

        // Make sure these are adjacent numbers
        numbers.sort();
        if (!(((numbers[0] === -1) && (numbers[1] === 0))
          || (numbers[1] == (numbers[0] + 3))
          || (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3)))) {
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
            bet.type = 'Split';
            if (session.attributes.bets) {
              session.attributes.bets.unshift(bet);
            } else {
              session.attributes.bets = [bet];
            }

            // OK, let's callback
            reprompt = 'Place another bet or say spin the wheel to spin.';
            ssml = utils.speakBet(bet.amount, 'split between ' + utils.speakNumbers(bet.numbers) + '.', reprompt);
          }
        }
      }
    }

    // OK, let's callback
    callback(session, context, speechError, null, ssml, reprompt);
  },
};
