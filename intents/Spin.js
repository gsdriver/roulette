//
// Spins the wheel and determines the payouts!
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function(intent, session, context, callback) {
    // When you spin, you either have to have bets or prior bets
    let bets;
    let speechError;
    let speech;
    let reprompt;

    if (!session.attributes.bets && !session.attributes.lastbets) {
      speechError = 'Sorry, you have to place a bet before you can spin the wheel.';
      reprompt = 'Place a bet';
      callback(session, context, speechError, speech, reprompt);
    } else {
      if (session.attributes.bets) {
        bets = session.attributes.bets;
      } else if (session.attributes.lastbets) {
        bets = session.attributes.lastbets;
      }

      // Just spin the wheel!  Pick a random number from -1 to 36 inclusive
      const spin = Math.floor(Math.random() * 38) - 1;

      speech = 'The ball landed on ' + utils.slot(spin) + '. ';

      // Now let's determine the payouts
      calculatePayouts(bets, spin, (winAmount, winString) => {
        // Add the amount won and spit out the string to the user and the card
        speech += winString;
        callback(session, context, speechError, speech, reprompt);
      });
    }
  },
};

//
// Internal functions
//

function calculatePayouts(bets, spin, callback) {
  let winAmount = 0;
  let winString = '';
  let bet;
  let i;

  for (i = 0; i < bets.length; i++) {
    bet = bets[i];

    // Is this a winner?  If so, add it to the winning amount
    if (bet.numbers.indexOf(spin) > -1) {
      // Winner!
      if (winString.length > 0) {
        winString += ', and ';
      }
      switch (bet.type) {
        case 'SingleNumber':
          winString += 'your bet on ' + utils.slot(bet.numbers[0]) + ' won';
          winAmount += 35 * bet.amount;
          break;
        case 'Black':
          winString += 'your bet on black won';
          winAmount += bet.amount;
          break;
        case 'Red':
          winString += 'your bet on red won';
          winAmount += bet.amount;
          break;
        case 'Even':
          winString += 'your bet on even won';
          winAmount += bet.amount;
          break;
        case 'Odd':
          winString += 'your bet on odd won';
          winAmount += bet.amount;
          break;
        case 'Column':
          winString += 'your bet on the ' + utils.ordinal(bet.numbers[0]) + ' column won';
          winAmount += 2 * bet.amount;
          break;
        case 'Dozen':
          winString += 'your bet on the ' + utils.ordinal(bet.numbers[11] / 12) + ' dozen won';
          winAmount += 2 * bet.amount;
          break;
        case 'Split':
          winString += 'your split bet on ' + utils.slot(bet.numbers[0]) + ' and ' + utils.slot(bet.numbers[1]) + ' won';
          winAmount += 17 * bet.amount;
          break;
        case 'Corner':
          winString += 'your corner bet on ' + utils.slot(bet.numbers[0]) + ' and ' + utils.slot(bet.numbers[1]) +
            ' and ' + utils.slot(bet.numbers[2]) + ' and ' + utils.slot(bet.numbers[3]) + ' won';
          winAmount += 8 * bet.amount;
          break;
        default:
          console.log('Unknown bet time in CalculatePayouts');
          break;
      }
    }
  }

  // If there was no winner, set the win string to all beta lost
  if (winString.length > 0) {
    winString += '.';
  } else {
    winString = 'Sorry, all of your bets lost.';
  }

  callback(winAmount, winString);
}
