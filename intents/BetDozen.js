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
    let ssml;
    let speechError;
    let dozen;
    let reprompt;

    if (!intent.slots.Ordinal || !intent.slots.Ordinal.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must specify the first, second, or third dozen';
      reprompt = 'What else can I help you with?';
    } else {
      dozen = utils.valueFromOrdinal(intent.slots.Ordinal.value);
      if (!dozen) {
        speechError = 'Sorry, ' + intent.slots.Ordinal.value + ' is not a valid dozen';
        reprompt = 'What else can I help you with?';
      } else {
        const bet = {};

        bet.amount = utils.betAmount(intent, session);
        bet.numbers = [];
        for (let i = 0; i < 12; i++) {
          bet.numbers.push(12*(dozen-1)+i+1);
        }

        bet.type = 'Dozen';
        if (session.attributes.bets) {
          session.attributes.bets.unshift(bet);
        } else {
          session.attributes.bets = [bet];
        }

        reprompt = 'Place another bet or say spin the wheel to spin.';
        ssml = utils.speakBet(bet.amount, 'placed on the ' + utils.ordinal(dozen) + ' dozen.', reprompt);
      }
    }

    // OK, let's callback
    callback(session, context, speechError, null, ssml, reprompt);
  },
};
