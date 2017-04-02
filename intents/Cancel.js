//
// Cancels the previous bet, if any
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    let speech;
    let reprompt;
    let speechError;

    if (session.attributes.bets && (session.attributes.bets.length > 0)) {
      const bet = session.attributes.bets.shift();

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

      reprompt = 'Place a bet';
      if (session.attributes.bets && (session.attributes.bets.length > 0)) {
        reprompt += ' or say spin to spin the wheel.';
      }
    } else {
      // No bets that can be cancelled so exit
      speechError = 'Thanks for playing! Goodbye.';
    }

    callback(session, context, speechError, speech, null, reprompt);
  },
};
