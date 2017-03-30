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

    if (!(session.attributes.bets && (session.attributes.bets.length > 0))
      && !(session.attributes.lastbets && (session.attributes.lastbets.length > 0))) {
      speechError = 'Sorry, you have to place a bet before you can spin the wheel.';
      reprompt = 'Place a bet';
      callback(session, context, speechError, speech, null, reprompt);
    } else {
      if (session.attributes.bets && (session.attributes.bets.length > 0)) {
        bets = session.attributes.bets;
      } else if (session.attributes.lastbets && (session.attributes.lastbets.length > 0)) {
        // They want to re-use the same bets they did last time - make sure there
        // is enough left in the bankroll and update the bankroll before we spin
        let i;
        let totalBet = 0;

        bets = session.attributes.lastbets;
        for (i = 0; i < bets.length; i++) {
          totalBet += parseInt(bets[i].amount);
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

      // Pick a random number from -1 (if double zero) or 0 (if single zero) to 36 inclusive
      let spin;

      if (session.attributes.doubleZeroWheel) {
        spin = Math.floor(Math.random() * 38) - 1;
      } else {
        spin = Math.floor(Math.random() * 37);
      }

      speech = '<speak>No more bets! <audio src="https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3" />';
      speech += ('The ball landed on ' + utils.speakNumbers([spin], true) + '. ');

      // Now let's determine the payouts
      calculatePayouts(bets, spin, (winAmount, winString) => {
        reprompt = 'Place new bets, or say spin to use the same set of bets again.';

        // Add the amount won and spit out the string to the user and the card
        speech += winString;
        session.attributes.bankroll += winAmount;
        speech += (' You have ' + session.attributes.bankroll + ' units left. ');
        speech += reprompt;
        speech += '</speak>';

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
        case 'Black':
        case 'Red':
        case 'Even':
        case 'Odd':
        case 'High':
        case 'Low':
          winString += 'your bet on ' + bet.type + ' won';
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
        case 'Numbers':
          winString += 'your bet on ' + utils.speakNumbers(bet.numbers) + ' won';
          winAmount += (36 / bet.numbers.length) * betAmount;
          break;
        default:
          console.log('Unknown bet type in CalculatePayouts');
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
