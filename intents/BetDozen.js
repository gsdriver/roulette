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
    let dozen;
    let reprompt;

    if (!this.event.request.intent.slots.Ordinal
      || !this.event.request.intent.slots.Ordinal.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must specify the first, second, or third dozen';
      reprompt = 'What else can I help you with?';
    } else {
      dozen = utils.valueFromOrdinal(this.event.request.intent.slots.Ordinal.value);
      if (!dozen) {
        speechError = 'Sorry, ' + this.event.request.intent.slots.Ordinal.value + ' is not a valid dozen';
        reprompt = 'What else can I help you with?';
      } else {
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
          bet.numbers = [];
          for (let i = 0; i < 12; i++) {
            bet.numbers.push(12*(dozen-1)+i+1);
          }

          bet.type = 'Dozen';
          if (this.attributes.bets) {
            this.attributes.bets.unshift(bet);
          } else {
            this.attributes.bets = [bet];
          }

          reprompt = 'Place another bet or say spin the wheel to spin.';
          ssml = utils.speakBet(bet.amount, 'placed on the ' + utils.ordinal(dozen) + ' dozen.', reprompt);
        }
      }
    }

    // OK, let's callback
    utils.emitResponse(this.emit, speechError, null, ssml, reprompt);
  },
};
