//
// Spins the wheel and determines the payouts!
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // When you spin, you either have to have bets or prior bets
    let bets;
    let speechError;
    let speech;
    let reprompt;
    const res = require('../' + this.event.request.locale + '/resources');

    if (!(this.attributes.bets && (this.attributes.bets.length > 0))
      && !(this.attributes.lastbets && (this.attributes.lastbets.length > 0))) {
      speechError = res.strings.SPIN_NOBETS;
      reprompt = res.strings.SPIN_INVALID_REPROMPT;
      utils.emitResponse(this.emit, this.event.request.locale, speechError, null, speech, reprompt);
    } else {
      if (this.attributes.bets && (this.attributes.bets.length > 0)) {
        bets = this.attributes.bets;
      } else if (this.attributes.lastbets && (this.attributes.lastbets.length > 0)) {
        // They want to re-use the same bets they did last time - make sure there
        // is enough left in the bankroll and update the bankroll before we spin
        let i;
        let totalBet = 0;

        bets = this.attributes.lastbets;
        for (i = 0; i < bets.length; i++) {
          totalBet += parseInt(bets[i].amount);
        }
        if (totalBet > this.attributes.bankroll) {
          speechError = res.strings.SPIN_CANTBET_LASTBETS.replace('{0}', this.attributes.bankroll);
          reprompt = res.strings.SPIN_INVALID_REPROMPT;
          utils.emitResponse(this.emit, this.event.request.locale,
            speechError, null, speech, reprompt);
          return;
        } else {
          this.attributes.bankroll -= totalBet;
        }
      }

      // Pick a random number from -1 (if double zero) or 0 (if single zero) to 36 inclusive
      let spin;

      if (this.attributes.doubleZeroWheel) {
        spin = Math.floor(Math.random() * 38) - 1;
      } else {
        spin = Math.floor(Math.random() * 37);
      }

      speech = res.strings.SPIN_NO_MORE_BETS;
      speech += res.strings.SPIN_RESULT.replace('{0}', utils.speakNumbers(this.event.request.locale, [spin], true));

      // Now let's determine the payouts
      calculatePayouts(this.event.request.locale, bets, spin, (winAmount, winString) => {
        reprompt = res.strings.SPIN_REPROMPT;
        let newHigh = false;

        // Add the amount won and spit out the string to the user and the card
        speech += winString;
        this.attributes.bankroll += winAmount;
        speech += res.strings.SPIN_REMAINING_BANKROLL.replace('{0}', this.attributes.bankroll);

        // If they have no units left, reset the bankroll
        if (this.attributes.bankroll < 1) {
          this.attributes.bankroll = 1000;
          bets = undefined;
          speech += res.strings.SPIN_BUSTED;
          reprompt = res.strings.SPIN_BUSTED_REPROMPT;
        } else {
          // They still have money left, but if they don't have enough to support
          // the last set of bets again, then clear that now
          let i;
          let totalBet = 0;

          for (i = 0; i < bets.length; i++) {
            totalBet += parseInt(bets[i].amount);
          }

          if (this.attributes.bankroll < totalBet) {
            bets = undefined;
            speech += res.strings.SPIN_BANKROLL_TOOSMALL_FORLASTBETS;
            reprompt = res.strings.SPIN_BUSTED_REPROMPT;
          }
        }

        // Now let's update the scores
        this.attributes.highScore.timestamp = Date.now();
        if (this.attributes.doubleZeroWheel) {
          this.attributes.highScore.currentAmerican = this.attributes.bankroll;
          this.attributes.highScore.spinsAmerican++;
          if (this.attributes.highScore.currentAmerican > this.attributes.highScore.highAmerican) {
            this.attributes.highScore.highAmerican = this.attributes.highScore.currentAmerican;
            speech += res.strings.SPIN_NEW_HIGHBANKROLL;
            newHigh = true;
          }
        } else {
          this.attributes.highScore.currentEuropean = this.attributes.bankroll;
          this.attributes.highScore.spinsEuropean++;
          if (this.attributes.highScore.currentEuropean > this.attributes.highScore.highEuropean) {
            this.attributes.highScore.highEuropean = this.attributes.highScore.currentEuropean;
            speech += res.strings.SPIN_NEW_HIGHBANKROLL;
            newHigh = true;
          }
        }

        this.attributes.lastbets = bets;
        this.attributes.bets = null;
        this.handler.state = 'INGAME';

        if (newHigh) {
          // Tell them their rank now
          utils.readRank(this.event.request.locale, this.attributes, false, (err, rank) => {
            if (rank) {
              speech += rank;
            }

            // And reprompt
            speech += reprompt;
            utils.emitResponse(this.emit, this.event.request.locale,
              speechError, null, speech, reprompt);
          });
        } else {
          // And reprompt
          speech += reprompt;
          utils.emitResponse(this.emit, this.event.request.locale,
            speechError, null, speech, reprompt);
        }
      });
    }
  },
};

//
// Internal functions
//

function calculatePayouts(locale, bets, spin, callback) {
  let winAmount = 0;
  let totalBet = 0;
  let winString = '';
  let bet;
  let i;
  let betAmount;
  const res = require('../' + locale + '/resources');

  for (i = 0; i < bets.length; i++) {
    bet = bets[i];

    // Is this a winner?  If so, add it to the winning amount
    betAmount = parseInt(bet.amount);
    totalBet += betAmount;
    if (bet.numbers.indexOf(spin) > -1) {
      // Winner!
      if (winString.length > 0) {
        winString += res.strings.SPIN_WINNER_AND;
      }

      winString += res.strings.SPIN_WINNER_BET.replace('{0}', res.mapBetType(bet.type, bet.numbers));
      winAmount += (36 / bet.numbers.length) * betAmount;
    }
  }

  // If there was no winner, set the win string to all bets lost
  if (winString.length > 0) {
    winString += '.';
  } else {
    winString = res.strings.SPIN_LOST_BETS;
  }

  // Give them a summary of how much they won or lost
  if (winAmount > totalBet) {
    winString += res.strings.SPIN_SUMMARY_WIN.replace('{0}', (winAmount - totalBet));
  } else if (winAmount < totalBet) {
    winString += res.strings.SPIN_SUMMARY_LOSE.replace('{0}', (totalBet - winAmount));
  } else {
    winString += res.strings.SPIN_SUMMARY_EVEN;
  }

  callback(winAmount, winString);
}
