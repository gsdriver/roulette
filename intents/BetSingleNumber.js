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
    let singleNumber;
    let reprompt;

    if (!intent.slots.Number || !intent.slots.Number.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must say a number to bet';
      reprompt = 'What else can I help you with?';
    } else {
      singleNumber = utils.number(intent.slots.Number.value, session.attributes.doubleZeroWheel);
      if (singleNumber === undefined) {
        speechError = 'Sorry, ' + intent.slots.Number.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else {
        const bet = {};

        bet.amount = utils.betAmount(intent, session);
        if (bet.amount === -1) {
          // Oops, you can't bet this much
          speechError = 'Sorry, this bet exceeds your bankroll of ' + session.attributes.bankroll + ' units.';
          reprompt = 'What else can I help you with?';
        } else {
          bet.numbers = [singleNumber];
          bet.type = 'SingleNumber';
          if (session.attributes.bets) {
            session.attributes.bets.unshift(bet);
          } else {
            session.attributes.bets = [bet];
          }

          // OK, let's callback
          reprompt = 'Place another bet or say spin the wheel to spin.';
          ssml = utils.speakBet(bet.amount, 'placed on ' + utils.speakNumbers(bet.numbers) + '.', reprompt);
        }
      }
    }

    // OK, let's callback
    callback(session, context, speechError, null, ssml, reprompt);
  },
};
