//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const leven = require('leven');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can't do while waiting to join a tournament
    return (!attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      (request.intent.name === 'NumbersIntent'));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech;
    let reprompt;
    const speechParams = {};
    const numbers = [];
    const hand = attributes[attributes.currentHand];
    let getNumbers;

    return handlerInput.jrm.renderObject(ri('NUMBER_MAPPING'))
    .then((numberMapping) => {
      // You need at least one number
      if (!event.request.intent.slots.FirstNumber
        || !event.request.intent.slots.FirstNumber.value) {
        // Sorry - reject this
        speech = 'BETNUMBERS_MISSING_NUMBERS';
        reprompt = 'BET_INVALID_REPROMPT';
      } else if (hand.minBet && (hand.bankroll < hand.minBet)) {
        speech = 'BET_INVALID_NOBANKROLL';
        reprompt = 'BET_INVALID_REPROMPT';
      } else {
        // Up to six numbers will be considered
        let count = 0;
        let i;
        let num;
        const numberSlots = [event.request.intent.slots.FirstNumber,
          event.request.intent.slots.SecondNumber,
          event.request.intent.slots.ThirdNumber,
          event.request.intent.slots.FourthNumber,
          event.request.intent.slots.FifthNumber,
          event.request.intent.slots.SixthNumber];

        for (i = 0; i < numberSlots.length; i++) {
          if (numberSlots[i] && numberSlots[i].value) {
            num = number(handlerInput,
              numberSlots[i].value, hand.doubleZeroWheel);
            if (num == undefined) {
              speech = 'BETNUMBERS_INVALID_NUMBER';
              speechParams.Number = numberSlots[i].value;
              reprompt = 'BET_INVALID_REPROMPT';
            } else {
              numbers.push(num);
              count++;
            }
          }
        }

        if (!speech) {
          // Now for the data validation - different based on the count of numbers
          numbers.sort((a, b) => (a - b));
          switch (count) {
            case 0:
              speechParams.Number = event.request.intent.slots.FirstNumber.value;
              speech = 'BETNUMBERS_INVALID_FIRSTNUMBER';
              reprompt = 'BET_INVALID_REPROMPT';
              break;
            case 5:
              speech = 'BETNUMBERS_INVALID_FIVENUMBERS';
              reprompt = 'BET_INVALID_REPROMPT';
              break;
            case 1:
              // Any number works
              break;
            case 2:
              if (!(((numbers[0] === -1) && (numbers[1] === 0))
                || (numbers[1] == (numbers[0] + 3))
                || ((numbers[1] == (numbers[0] + 1))
                && (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3))))) {
                // This is not a valid bet
                speech = 'BETNUMBERS_INVALID_NONADJACENT';
                reprompt = 'BET_INVALID_REPROMPT';
              }
              break;
            case 3:
              if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
                && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == numbers[0] + 1))) {
                // This is not a valid bet
                speech = 'BETNUMBERS_INVALID_NONADJACENT';
                reprompt = 'BET_INVALID_REPROMPT';
              }
              break;
            case 4:
              if (!((numbers[0] > 0) && (numbers[1] == (numbers[0] + 1))
                && (numbers[3] == (numbers[2] + 1)) && (numbers[2] == (numbers[0] + 3))
                && (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3)))) {
                // This is not a valid bet
                speech = 'BETNUMBERS_INVALID_NONADJACENT';
                reprompt = 'BET_INVALID_REPROMPT';
              }
              break;
            case 6:
              if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
                && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == (numbers[0] + 1))
                && (Math.ceil(numbers[3] / 3) == Math.ceil(numbers[5] / 3))
                && (numbers[5] == (numbers[4] + 1)) && (numbers[4] == (numbers[3] + 1)))) {
                // This is not a valid bet
                speech = 'BETNUMBERS_INVALID_NONADJACENT';
                reprompt = 'BET_INVALID_REPROMPT';
              }
          }
        }

        if (!speech) {
          const bet = {};
          bet.amount = utils.betAmount(event.request.intent, hand);
          hand.bankroll -= bet.amount;
          bet.numbers = numbers;
          bet.type = 'Numbers';

          // Check if they already have an identical bet and if so
          // we'll add to that bet (so long as it doesn't exceed the
          // hand maximum)
          let duplicateBet;
          let duplicateNotAdded;
          if (hand.bets) {
            let i;

            for (i = 0; i < hand.bets.length; i++) {
              if (utils.betsMatch(hand.bets[i], bet)) {
                // Yes, it's a match - note and exit
                duplicateBet = hand.bets[i];
                break;
              }
            }
          }

          speech = 'BETNUMBERS_PLACED';
          if (duplicateBet) {
            // Can I add this?
            if (hand.maxBet
              && ((bet.amount + duplicateBet.amount) > hand.maxBet)) {
              // No, you can't
              hand.bankroll += bet.amount;
              duplicateNotAdded = true;
              speechParams.DuplicateAmount = duplicateBet.amount;
              speechParams.Increase = bet.amount;
              speechParams.Maximum = hand.maxBet;
              speech = 'BET_DUPLICATE_NOT_ADDED';
            } else {
              speechParams.NewBetAmount = bet.amount;
              duplicateBet.amount += bet.amount;
              bet.amount = duplicateBet.amount;
              speech += '_DUPLICATE';
            }
          } else if (hand.bets) {
            hand.bets.unshift(bet);
          } else {
            hand.bets = [bet];
          }

          // OK, let's callback
          reprompt = 'BET_PLACED_REPROMPT';
          if (!duplicateNotAdded) {
            speechParams.BetAmount = bet.amount;
            getNumbers = true;
          }
        }
      }

      // OK, let's callback
      if (getNumbers) {
        return utils.speakNumbers(handlerInput, numbers)
        .then((text) => {
          speechParams.Numbers = text;
          return handlerInput.jrb
            .speak(ri(speech, speechParams))
            .reprompt(ri(reprompt))
            .getResponse();
        });
      } else {
        return handlerInput.jrb
          .speak(ri(speech, speechParams))
          .reprompt(ri(reprompt))
          .getResponse();
      }
    });
  },
};

function number(numberMapping, value, doubleZeroWheel) {
  let result = parseInt(value);

  // First, is it an integer already?
  if (!isNaN(result)) {
    if ((result >= 0) && (result <= 36)) {
      // valid - return it
      return result;
    }
  } else {
    result = getBestMatch(numberMapping, value.toLowerCase());
    if (result) {
      // Valid - return it
      return result;
    }
  }

  // Nope, not a valid value
  return undefined;
}

function getBestMatch(mapping, value) {
  const valueLen = value.length;
  let map;
  let ratio;
  let bestMapping;
  let bestRatio = 0;

  for (map in mapping) {
    if (map) {
      const lensum = map.length + valueLen;
      ratio = Math.round(100 * ((lensum - leven(value, map)) / lensum));
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestMapping = map;
      }
    }
  }

  if (bestRatio < 90) {
    console.log('Near match: ' + bestMapping + ', ' + bestRatio);
  }
  return ((bestMapping && (bestRatio > 80)) ? mapping[bestMapping] : undefined);
}
