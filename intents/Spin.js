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
      callback(session, context, speechError, speech, null, reprompt);
    } else {
      if (session.attributes.bets) {
        bets = session.attributes.bets;
      } else if (session.attributes.lastbets) {
        // They want to re-use the same bets they did last time - make sure there
        // is enough left in the bankroll and update the bankroll before we spin
        let i;
        let totalBet = 0;

        bets = session.attributes.lastbets;
        for (i = 0; i < bets.length; i++) {
          totalBet += parseInt([i].amount);
        }
        if (totalBet > session.attributes.bankroll) {
          speechError = 'Sorry, your bankroll of ' + session.attributes.bankroll + ' units can\'t support your last set of bets.';
          reprompt = 'Place a bet';
          callback(session, context, speechError, speech, null, reprompt);
          return;
        } else {
          session.attributes.bankroll -= totalBet;
        }
      }

      // Just spin the wheel!  Pick a random number from -1 to 36 inclusive
      const spin = Math.floor(Math.random() * 38) - 1;

      speech = '<speak>No more bets! <audio src="https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3" />';
      speech += ('The ball landed on ' + utils.slot(spin, true) + '. ');

      // Now let's determine the payouts
      calculatePayouts(bets, spin, (winAmount, winString) => {
        // Add the amount won and spit out the string to the user and the card
        speech += winString;
        session.attributes.bankroll += winAmount;
        speech += (' You have ' + session.attributes.bankroll + ' units left.');
        speech += '</speak>';

        reprompt = 'Place new bets, or say spin to use the same set of bets';
        session.attributes.lastbets = bets;
        session.attributes.bets = null;
        callback(session, context, speechError, null, speech, reprompt);
      });
    }
  },
};

//
// Internal functions
//

function calculatePayouts(bets, spin, callback) {
  let winAmount = 0;
  let totalBet = 0;
  let winString = '';
  let bet;
  let i;
  let betAmount;

  for (i = 0; i < bets.length; i++) {
    bet = bets[i];

    // Is this a winner?  If so, add it to the winning amount
    betAmount = parseInt(bet.amount);
    totalBet += betAmount;
    if (bet.numbers.indexOf(spin) > -1) {
      // Winner!
      if (winString.length > 0) {
        winString += ', and ';
      }
      switch (bet.type) {
        case 'SingleNumber':
          winString += 'your bet on ' + utils.slot(bet.numbers[0]) + ' won';
          winAmount += 36 * betAmount;
          break;
        case 'Black':
          winString += 'your bet on black won';
          winAmount += 2 * betAmount;
          break;
        case 'Red':
          winString += 'your bet on red won';
          winAmount += 2 * betAmount;
          break;
        case 'Even':
          winString += 'your bet on even won';
          winAmount += 2 * betAmount;
          break;
        case 'Odd':
          winString += 'your bet on odd won';
          winAmount += 2 * betAmount;
          break;
        case 'Column':
          winString += 'your bet on the ' + utils.ordinal(bet.numbers[0]) + ' column won';
          winAmount += 3 * betAmount;
          break;
        case 'Dozen':
          winString += 'your bet on the ' + utils.ordinal(bet.numbers[11] / 12) + ' dozen won';
          winAmount += 3 * betAmount;
          break;
        case 'Split':
          winString += 'your split bet on ' + utils.slot(bet.numbers[0]) + ' and ' + utils.slot(bet.numbers[1]) + ' won';
          winAmount += 18 * betAmount;
          break;
        case 'Corner':
          winString += 'your corner bet on ' + utils.slot(bet.numbers[0]) + ' and ' + utils.slot(bet.numbers[1]) +
            ' and ' + utils.slot(bet.numbers[2]) + ' and ' + utils.slot(bet.numbers[3]) + ' won';
          winAmount += 9 * betAmount;
          break;
        default:
          console.log('Unknown bet time in CalculatePayouts');
          break;
      }
    }
  }

  // If there was no winner, set the win string to all bets lost
  if (winString.length > 0) {
    winString += '.';
  } else {
    winString = 'Sorry, all of your bets lost.';
  }

  // Give them a summary of how much they won or lost
  if (winAmount > totalBet) {
    winString += (' You won ' + (winAmount - totalBet) + ' units.');
  } else if (winAmount < totalBet) {
    winString += (' You lost ' + (totalBet - winAmount) + ' units.');
  } else {
    winString += ' You broke even.';
  }

  callback(winAmount, winString);
}
