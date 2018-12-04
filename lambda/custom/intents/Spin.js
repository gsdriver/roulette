//
// Spins the wheel and determines the payouts!
//

'use strict';

const utils = require('../utils');
const buttons = require('../buttons');
const seedrandom = require('seedrandom');
const speechUtils = require('alexa-speech-utils')();
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Button press counts as spin if it's a new button
    // or one that's been pressed before
    if (!attributes.temp.joinTournament && (request.type === 'GameEngine.InputHandlerEvent')) {
      const buttonId = buttons.getPressedButton(request, attributes);
      if (buttonId && (!attributes.temp.buttonId || (buttonId == attributes.temp.buttonId))) {
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
    let bets;
    let speech = 'SPIN';
    let reprompt;
    const speechParams = {};
    const hand = attributes[attributes.currentHand];
    let amountWon;

    if (!(hand.bets && (hand.bets.length > 0))
      && !(hand.lastbets && (hand.lastbets.length > 0))) {
      return utils.getBetSuggestion(handlerInput)
      .then((suggestion) => {
        speechParams.Suggestion = suggestion;
        return handlerInput.jrb
          .speak(ri('SPIN_NOBETS', speechParams))
          .reprompt(ri('SPIN_INVALID_REPROMPT'))
          .getResponse();
      });
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
          speechParams.Bankroll = hand.bankroll;
          return handlerInput.jrb
            .speak(ri('SPIN_CANTBET_LASTBETS', speechParams))
            .reprompt(ri('SPIN_INVALID_REPROMPT'))
            .getResponse();
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

      return utils.speakNumbers(handlerInput, [spin], true)
      .then((result) => {
        speechParams.Result = result;
        return calculatePayouts(handlerInput, bets, spin);
      }).then((winning) => {
        // Add the amount won and spit out the string to the user and the card
        let i;
        const winners = [];
        const losers = [];
        hand.bankroll += winning.amount;
        amountWon = winning.delta;

        if (winning.results.length > 1) {
          for (i = 0; i < winning.results.length; i++) {
            if (winning.results[i] === 'win') {
              winners.push(winning.bets[i]);
            } else {
              losers.push(winning.bets[i]);
            }
          }

          speechParams.NumberOfWinners = winners.length;
          speechParams.NumberOfLosers = losers.length;
          speechParams.WinBet = speechUtils.and(winners,
            {locale: handlerInput.requestEnvelope.request.locale});
          speechParams.LoseBet = speechUtils.and(losers,
            {locale: handlerInput.requestEnvelope.request.locale});
        } else {
          speech += '_ONEBET';
        }

        if (amountWon > 0) {
          speech += '_WINNER';
        } else if (amountWon === 0) {
          speech += '_PUSH';
        } else {
          speech += '_LOSE';
          if (!winners.length) {
            speech += '_ALL';
          }
        }

        speechParams.Bankroll = hand.bankroll;
        return addAchievements(handlerInput, spin);
      }).then((text) => {
        speechParams.Achievements = text;

        // If they have no units left, reset the bankroll
        if (hand.bankroll < 1) {
          if (hand.canReset) {
            hand.resets = (hand.resets + 1) || 1;
            hand.bankroll = 1000;
            bets = undefined;
            speech += '_BUSTED';
            reprompt = 'SPIN_BUSTED_REPROMPT';
          } else {
            // Can't reset - this hand is over - we will end the session and return
            attributes.tournament.finished = true;
            return handlerInput.responseBuilder
              .speak(ri('TOURNAMENT_BANKRUPT', speechParams))
              .withShouldEndSession(true)
              .getResponse();
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
            speech += '_BANKROLL_TOOSMALL_FORLASTBETS';
            reprompt = 'SPIN_BUSTED_REPROMPT';
          }
        }

        utils.updateLeaderBoard(event, attributes);
        hand.spins++;
        if (hand.maxSpins && (hand.spins >= hand.maxSpins)) {
          // Whoops, we are done
          attributes.tournament.finished = true;
          return handlerInput.jrb
            .speak(ri('TOURNAMENT_OUTOFSPINS', speechParams))
            .withShouldEndSession(true)
            .getResponse();
        } else {
          speechParams.SpinsRemaining = (hand.maxSpins) ? (hand.maxSpins - hand.spins) : 0;
          if (hand.bankroll > hand.high) {
            hand.high = hand.bankroll;
          }

          hand.lastbets = bets;
          hand.bets = null;
        }

        // If this locale supports Echo buttons and the customer is using a button
        // or has a display screen, we will use the GameEngine
        // to control display and reprompting
        return handlerInput.jrm.renderBatch([
          ri(speech, speechParams),
          ri(reprompt),
        ]).then((resolvedSpeech) => {
          if (buttons.supportButtons(handlerInput)
            && (attributes.temp.buttonId || attributes.display)) {
            // Update the color of the echo button (if present)
            // Look for the first wheel sound to see if there is starting text
            // That tells us whether to have a longer or shorter length of time on the buttons
            // There is a 399 ms pause after the result that tells us where to cut the string
            let firstPart = '';
            const resultPos = resolvedSpeech[0].lastIndexOf('399ms');
            if (resultPos > -1) {
              firstPart = resolvedSpeech[0].substring(resolvedSpeech[0].indexOf('>', resultPos) + 1);
            }
            const timeoutLength = utils.estimateDuration(resolvedSpeech[0])
              - utils.estimateDuration(firstPart);

            attributes.temp.spinColor = ((amountWon > 0)
              ? '00FE10' : ((amountWon === 0) ? '00FEFE' : 'FE0000'));
            buttons.colorDuringSpin(handlerInput, attributes.buttonId);
            buttons.buildButtonDownAnimationDirective(handlerInput, [attributes.temp.buttonId]);
            buttons.setInputHandlerAfterSpin(handlerInput, timeoutLength);
            console.log('Setting timeout of ' + timeoutLength + 'ms');
            handlerInput.responseBuilder.withShouldEndSession(false);
          }

          return handlerInput.responseBuilder
            .speak(resolvedSpeech[0])
            .reprompt(resolvedSpeech[1])
            .getResponse();
        });
      });
    }
  },
};

//
// Internal functions
//

function calculatePayouts(handlerInput, bets, spin) {
  let winAmount = 0;
  let totalBet = 0;
  let bet;
  let i;
  let betAmount;
  const promises = [];
  const results = [];

  for (i = 0; i < bets.length; i++) {
    // Is this a winner?  If so, add it to the winning amount
    bet = bets[i];
    betAmount = parseInt(bet.amount);
    totalBet += betAmount;
    if (bet.numbers.indexOf(spin) > -1) {
      // Winner!
      results.push('win');
      promises.push(utils.mapBetType(handlerInput, bet.type, bet.numbers));
      winAmount += (36 / bet.numbers.length) * betAmount;
    } else {
      results.push('lose');
      promises.push(utils.mapBetType(handlerInput, bet.type, bet.numbers));
    }
  }

  // If there was no winner, set the win string to all bets lost
  return Promise.all(promises)
  .then((betNames) => {
    return {results: results, bets: betNames, delta: (winAmount - totalBet), amount: winAmount};
  });
}

function addAchievements(handlerInput, spin) {
  const attributes = handlerInput.attributesManager.getSessionAttributes();
  const hand = attributes[attributes.currentHand];
  let firstDailyHand;
  let speech = 'SPIN_ACHIEVEMENT';
  const speechParams = {};

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
      speech += '_DAILY';
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
      speech += '_STREAK';
      speechParams.Times = hand.matches;
      speechParams.Points = (firstDailyHand) ? (10 + matchScore) : matchScore;
    }
  }

  if (speech !== 'SPIN_ACHIEVEMENT') {
    return handlerInput.jrm.render(ri(speech, speechParams));
  } else {
    return Promise.resolve('');
  }
}
