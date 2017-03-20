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
    let speech;
    let speechError;
    let singleNumber;
    let reprompt;

    if (!intent.slots.Number || !intent.slots.Number.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must say a number to bet';
      reprompt = 'What else can I help you with?';
    } else {
      singleNumber = utils.number(intent.slots.Number.value);
      if (!singleNumber) {
        speechError = 'Sorry, ' + intent.slots.Number.value + ' is not a valid roulette bet';
        reprompt = 'What else can I help you with?';
      } else {
        const bet = {};

        bet.amount = utils.betAmount(intent, session);
        bet.numbers = [singleNumber];
        bet.type = 'SingleNumber';
        if (session.attributes.bets) {
          session.attributes.bets.unshift(bet);
        } else {
          session.attributes.bets = [bet];
        }

        speech = bet.amount + ' unit';
        if (bet.amount > 1) {
          speech += 's';
        }
        speech += ' placed on ' + utils.slot(singleNumber);
        reprompt = 'Place another bet or say spin the wheel to spin.';
        speech += ('. ' + reprompt);
      }
    }

    // OK, let's callback
    callback(session, context, speechError, speech, null, reprompt);
  },
};
