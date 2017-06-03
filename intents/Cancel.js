//
// Cancels the previous bet, if any
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    let speech;
    let response;
    let reprompt;
    let speechError;

    if (this.attributes.bets && (this.attributes.bets.length > 0)) {
      const bet = this.attributes.bets.shift();

      speech = 'Removing your bet of ' + bet.amount + ' unit';
      if (bet.amount > 1) {
        speech += 's';
      }

      switch (bet.type) {
        case 'Black':
        case 'Red':
        case 'Even':
        case 'Odd':
        case 'High':
        case 'Low':
          speech += ' on ' + bet.type;
          break;
        case 'Column':
          speech += ' on the ' + utils.ordinal(bet.numbers[0]) + ' column';
          break;
        case 'Dozen':
          speech += ' on the ' + utils.ordinal(bet.numbers[11] / 12) + ' dozen';
          break;
        case 'Numbers':
          speech += ' on ' + utils.speakNumbers(bet.numbers);
          break;
        default:
          console.log('Unknown bet type in Cancel');
          break;
      }
    } else {
      // No bets that can be cancelled
      response = 'Thanks for playing! Goodbye.';
    }

    reprompt = 'Place a bet';
    if (this.attributes.bets && (this.attributes.bets.length > 0)) {
      reprompt += ' or say spin to spin the wheel.';
    }
    speech += ('. ' + reprompt);

    utils.emitResponse(this.emit, null, response, speech, reprompt);
  },
};
