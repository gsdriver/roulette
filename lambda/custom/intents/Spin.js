//
// Spins the wheel and determines the payouts!
//

'use strict';

const utils = require('../utils');
const buttons = require('../buttons');
const tournament = require('../tournament');
const seedrandom = require('seedrandom');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Button press counts as spin if it's a new button
    // or one that's been pressed before
    if (!attributes.temp.joinTournament && (request.type === 'GameEngine.InputHandlerEvent')) {
      const buttonId = buttons.getPressedButton(request, attributes);
      if (!attributes.temp.buttonId || (buttonId == attributes.temp.buttonId)) {
        attributes.temp.buttonId = buttonId;
        return true;
      }
    }

    // Can't do while waiting to join a tournament
    return (!attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      ((request.intent.name === 'SpinIntent') ||
      (request.intent.name === 'AMAZON.NextIntent') ||
      (request.intent.name === 'AMAZON.YesIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);
    let bets;
    let speech;
    let reprompt;
    const hand = attributes[attributes.currentHand];

    return new Promise((resolve, reject) => {
      let spinResponse;
      if (!(hand.bets && (hand.bets.length > 0))
        && !(hand.lastbets && (hand.lastbets.length > 0))) {
        speech = res.strings.SPIN_NOBETS.replace('{0}', res.getBetSuggestion(handlerInput));
        reprompt = res.strings.SPIN_INVALID_REPROMPT;
        spinResponse = handlerInput.responseBuilder
          .speak(speech)
          .reprompt(reprompt)
          .getResponse();
        resolve(spinResponse);
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
            speech = res.strings.SPIN_CANTBET_LASTBETS.replace('{0}', hand.bankroll);
            reprompt = res.strings.SPIN_INVALID_REPROMPT;
            spinResponse = handlerInput.responseBuilder
              .speak(speech)
              .reprompt(reprompt)
              .getResponse();
            resolve(spinResponse);
            return;
          } else {
            hand.bankroll -= totalBet;
          }
        }

        // Pick a random number from -1 (if double zero) or 0 (if single zero) to 36 inclusive
        let spin;
        const randomValue = seedrandom(event.session.user.userId + (hand.timestamp ? hand.timestamp : ''))();

        if (hand.doubleZeroWheel) {
          spin = Math.floor(randomValue * 38) - 1;
        } else {
          spin = Math.floor(randomValue * 37);
        }
        // Just in case random value was 1.0
        if (spin == 37) {
          spin--;
        }

        speech = res.strings.SPIN_NO_MORE_BETS;
        speech += res.strings.SPIN_RESULT.replace('{0}', utils.speakNumbers(event.request.locale, [spin], true));

        // Now let's determine the payouts
        const winning = calculatePayouts(event.request.locale, bets, spin);
        reprompt = res.strings.SPIN_REPROMPT;
        if (attributes.temp.buttonId) {
          const buttonColor = ((winning.delta > 0) ? '00FE10'
            : ((winning.delta === 0) ? '00FEFE' : 'FE0000'));
          buttons.colorButton(handlerInput, attributes.temp.buttonId, buttonColor);
          buttons.buildButtonDownAnimationDirective(handlerInput, [attributes.temp.buttonId]);
        }

        // Add the amount won and spit out the string to the user and the card
        hand.bankroll += winning.amount;
        speech += res.strings.SPIN_SUMMARY_RESULT.replace('{0}', winning.text).replace('{1}', hand.bankroll);
        speech += addAchievements(event, attributes, spin);

        // If they have no units left, reset the bankroll
        if (hand.bankroll < 1) {
          if (hand.canReset) {
            hand.resets = (hand.resets + 1) || 1;
            hand.bankroll = 1000;
            bets = undefined;
            speech += res.strings.SPIN_BUSTED;
            reprompt = res.strings.SPIN_BUSTED_REPROMPT;
          } else {
            // Can't reset - this hand is over - we will end the session and return
            resolve(tournament.outOfMoney(handlerInput, speech));
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

        utils.updateLeaderBoard(event, attributes);
        hand.spins++;
        if (hand.maxSpins && (hand.spins >= hand.maxSpins)) {
          // Whoops, we are done
          tournament.outOfSpins(handlerInput, speech, (response) => {
            spinResponse = handlerInput.responseBuilder
              .speak(response)
              .withShouldEndSession(true)
              .getResponse();
            resolve(spinResponse);
          });
        } else {
          if (hand.maxSpins) {
            speech += res.strings.TOURNAMENT_SPINS_REMAINING.replace('{0}', hand.maxSpins - hand.spins);
          }
          if (hand.bankroll > hand.high) {
            hand.high = hand.bankroll;
          }

          hand.lastbets = bets;
          hand.bets = null;

          // And reprompt
          speech += reprompt;
          spinResponse = handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt)
            .getResponse();
          resolve(spinResponse);
        }
      }
    });
  },
};

//
// Internal functions
//

function calculatePayouts(locale, bets, spin) {
  let winAmount = 0;
  let totalBet = 0;
  let winString;
  let bet;
  let i;
  let betAmount;
  const res = require('../resources')(locale);
  const winners = [];

  for (i = 0; i < bets.length; i++) {
    // Is this a winner?  If so, add it to the winning amount
    bet = bets[i];
    betAmount = parseInt(bet.amount);
    totalBet += betAmount;
    if (bet.numbers.indexOf(spin) > -1) {
      // Winner!
      winners.push(res.mapBetType(bet.type, bet.numbers));
      winAmount += (36 / bet.numbers.length) * betAmount;
    }
  }

  // If there was no winner, set the win string to all bets lost
  if (winners.length) {
    winString = res.strings.SPIN_WINNER_BET
      .replace('{0}', speechUtils.and(winners, {locale: locale}));
  } else {
    winString = res.strings.SPIN_LOST_BETS;
  }

  return {amount: winAmount, delta: (winAmount - totalBet), text: winString};
}

function addAchievements(event, attributes, spin) {
  const hand = attributes[attributes.currentHand];
  const res = require('../resources')(event.request.locale);
  let firstDailyHand;
  let speech = '';

  if (hand.timestamp) {
    const lastPlay = new Date(hand.timestamp);
    const now = new Date(Date.now());
    firstDailyHand = (lastPlay.getDate() != now.getDate());
  } else {
    firstDailyHand = true;
  }
  hand.timestamp = Date.now();
  if (firstDailyHand) {
    if (!attributes.achievements) {
      attributes.achievements = {daysPlayed: 1};
    } else {
      attributes.achievements.daysPlayed = (attributes.achievements.daysPlayed)
          ? (attributes.achievements.daysPlayed + 1) : 1;
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

    if (!attributes.achievements) {
      attributes.achievements = {};
    }

    attributes.achievements.streakScore = (attributes.achievements.streakScore)
          ? (attributes.achievements.streakScore + matchScore) : matchScore;
    if (!process.env.NOACHIEVEMENT) {
      speech += res.strings.SPIN_STREAK_EARN.replace('{0}', hand.matches).replace('{1}', matchScore);
    }
  }

  return speech;
}
