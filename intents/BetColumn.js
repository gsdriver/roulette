//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    // This intent has an ordinal (first, second, or third) associated with it
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let speech;
    let speechError;
    let column;
    let reprompt;

    if (!intent.slots.Ordinal || !intent.slots.Ordinal.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must specify the first, second, or third column';
      reprompt = 'What else can I help you with?';
    } else {
      column = utils.valueFromOrdinal(intent.slots.Ordinal.value);
      if (!column) {
        speechError = 'Sorry, ' + intent.slots.Ordinal.value + ' is not a valid column';
        reprompt = 'What else can I help you with?';
      } else {
        const bet = {};

        bet.amount = utils.betAmount(intent, session);
        bet.numbers = [];
        for (let i = 0; i < 12; i++) {
          bet.numbers.push(3*i + column);
        }

        bet.type = 'Column';
        if (session.attributes.bets) {
          session.attributes.bets.unshift(bet);
        } else {
          session.attributes.bets = [bet];
        }

        speech = bet.amount + ' unit';
        if (bet.amount > 1) {
          speech += 's';
        }
        speech += ' placed on the ' + utils.ordinal(column) + ' column';
        reprompt = 'Place another bet or say spin the wheel to spin.';
        speech += ('. ' + reprompt);
      }
    }

    // OK, let's callback
    callback(session, context, speechError, speech, null, reprompt);
  },
};
