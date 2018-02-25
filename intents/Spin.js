//
// Spins the wheel and determines the payouts!
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');

module.exports = {
  handleIntent: function() {
    // When you spin, you either have to have bets or prior bets
    let bets;
    let speechError;
    let speech;
    let reprompt;
    const res = require('../' + this.event.request.locale + '/resources');
    const hand = this.attributes[this.attributes.currentHand];

    if (!(hand.bets && (hand.bets.length > 0))
      && !(hand.lastbets && (hand.lastbets.length > 0))) {
      speechError = res.strings.SPIN_NOBETS;
      reprompt = res.strings.SPIN_INVALID_REPROMPT;
      utils.emitResponse(this, speechError, null, speech, reprompt);
    } else {
      if (hand.bets && (hand.bets.length > 0)) {
        bets = hand.bets;
      } else if (hand.lastbets && (hand.lastbets.length > 0)) {
        // They want to re-use the same bets they did last time - make sure there
        // is enough left in the bankroll and update the bankroll before we spin
        let i;
        let totalBet = 0;

        bets = hand.lastbets;
        for (i = 0; i < bets.length; i++) {
          totalBet += parseInt(bets[i].amount);
        }
        if (totalBet > hand.bankroll) {
          speechError = res.strings.SPIN_CANTBET_LASTBETS.replace('{0}', hand.bankroll);
          reprompt = res.strings.SPIN_INVALID_REPROMPT;
          utils.emitResponse(this, speechError, null, speech, reprompt);
          return;
        } else {
          hand.bankroll -= totalBet;
        }
      }

      // Pick a random number from -1 (if double zero) or 0 (if single zero) to 36 inclusive
      let spin;

      if (hand.doubleZeroWheel) {
        spin = Math.floor(Math.random() * 38) - 1;
      } else {
        spin = Math.floor(Math.random() * 37);
      }

      speech = res.strings.SPIN_NO_MORE_BETS;
      speech += res.strings.SPIN_RESULT.replace('{0}', utils.speakNumbers(this.event.request.locale, [spin], true));

      // Now let's update the scores and check for achievements
      let firstDailyHand;
      if (hand.timestamp) {
        const lastPlay = new Date(hand.timestamp);
        const now = new Date(Date.now());
        firstDailyHand = (lastPlay.getDate() != now.getDate());
      } else {
        firstDailyHand = true;
      }
      hand.timestamp = Date.now();
      if (firstDailyHand) {
        if (!this.attributes.achievements) {
          this.attributes.achievements = {daysPlayed: 1};
        } else {
          this.attributes.achievements.daysPlayed = (this.attributes.achievements.daysPlayed)
              ? (this.attributes.achievements.daysPlayed + 1) : 1;
        }
        if (!process.env.NOACHIEVEMENT) {
          speech += res.strings.SPIN_DAILY_EARN;
        }
      }

      if (hand.lastSpin) {
        if (hand.lastSpin === spin) {
          // You're on a roll!
          hand.matches++;
        } else {
          // Nope - reset
          hand.matches = 1;
        }
      } else {
        // First spin
        hand.matches = 1;
      }
      hand.lastSpin = spin;

      if (hand.matches > 1) {
        const matchScore = Math.pow(2, hand.matches);

        if (!this.attributes.achievements) {
          this.attributes.achievements = {};
        }

        this.attributes.achievements.streakScore = (this.attributes.achievements.streakScore)
              ? (this.attributes.achievements.streakScore + matchScore) : matchScore;
        if (!process.env.NOACHIEVEMENT) {
          speech += res.strings.SPIN_STREAK_EARN.replace('{0}', hand.matches).replace('{1}', matchScore);
        }
      }

      // Now let's determine the payouts
      calculatePayouts(this.event.request.locale, bets, spin, (winAmount, winString) => {
        reprompt = res.strings.SPIN_REPROMPT;

        // Add the amount won and spit out the string to the user and the card
        speech += winString;
        hand.bankroll += winAmount;
        speech += res.strings.SPIN_REMAINING_BANKROLL.replace('{0}', hand.bankroll);

        // If they have no units left, reset the bankroll
        if (hand.bankroll < 1) {
          if (hand.canReset) {
            hand.bankroll = 1000;
            bets = undefined;
            speech += res.strings.SPIN_BUSTED;
            reprompt = res.strings.SPIN_BUSTED_REPROMPT;
          } else {
            // Can't reset - this hand is over - we will end the session and return
            tournament.outOfMoney(this, speech);
            return;
          }
        } else {
          // They still have money left, but if they don't have enough to support
          // the last set of bets again, then clear that now
          let i;
          let totalBet = 0;

          for (i = 0; i < bets.length; i++) {
            totalBet += parseInt(bets[i].amount);
          }

          if (hand.bankroll < totalBet) {
            bets = undefined;
            speech += res.strings.SPIN_BANKROLL_TOOSMALL_FORLASTBETS;
            reprompt = res.strings.SPIN_BUSTED_REPROMPT;
          }
        }

        hand.spins++;
        if (hand.maxSpins) {
          if (hand.spins >= hand.maxSpins) {
            // Whoops, we are done
            tournament.outOfSpins(this, speech);
            return;
          } else {
            speech += res.strings.TOURNAMENT_SPINS_REMAINING.replace('{0}', hand.maxSpins - hand.spins);
          }
        }

        if (hand.bankroll > hand.high) {
          hand.high = hand.bankroll;
        }

        hand.lastbets = bets;
        hand.bets = null;
        this.handler.state = 'INGAME';

        // Wait - if we can offer a survey, let's do that
        if ((reprompt === res.strings.SPIN_REPROMPT) && utils.shouldOfferSurvey(this.attributes)) {
          reprompt = res.strings.SURVEY_OFFER;
          this.handler.state = 'SURVEYOFFERED';
        }

        // And reprompt
        speech += reprompt;
        utils.emitResponse(this, speechError, null, speech, reprompt);
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
