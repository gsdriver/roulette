//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

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
    const res = require('../resources')(event.request.locale);
    let ssml;
    let speechError;
    let reprompt;
    const numbers = [];
    const hand = attributes[attributes.currentHand];

    // You need at least one number
    attributes.temp.resetting = undefined;
    if (!event.request.intent.slots.FirstNumber
      || !event.request.intent.slots.FirstNumber.value) {
      // Sorry - reject this
      speechError = res.strings.BETNUMBERS_MISSING_NUMBERS;
      reprompt = res.strings.BET_INVALID_REPROMPT;
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
          num = utils.number(event.request.locale,
            numberSlots[i].value, hand.doubleZeroWheel);
          if (num == undefined) {
            speechError = res.strings.BETNUMBERS_INVALID_NUMBER.replace('{0}', numberSlots[i].value);
            reprompt = res.strings.BET_INVALID_REPROMPT;
          } else {
            numbers.push(num);
            count++;
          }
        }
      }

      if (!speechError) {
        // Now for the data validation - different based on the count of numbers
        numbers.sort((a, b) => (a - b));
        switch (count) {
          case 0:
            speechError = res.strings.BETNUMBERS_INVALID_FIRSTNUMBER
              .replace('{0}', event.request.intent.slots.FirstNumber.value);
            reprompt = res.strings.BET_INVALID_REPROMPT;
            break;
          case 5:
            speechError = res.strings.BETNUMBERS_INVALID_FIVENUMBERS;
            reprompt = res.strings.BET_INVALID_REPROMPT;
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
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
            break;
          case 3:
            if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
              && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == numbers[0] + 1))) {
              // This is not a valid bet
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
            break;
          case 4:
            if (!((numbers[0] > 0) && (numbers[1] == (numbers[0] + 1))
              && (numbers[3] == (numbers[2] + 1)) && (numbers[2] == (numbers[0] + 3))
              && (Math.ceil(numbers[0] / 3) == Math.ceil(numbers[1] / 3)))) {
              // This is not a valid bet
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
            break;
          case 6:
            if (!((Math.ceil(numbers[0] / 3) == Math.ceil(numbers[2] / 3))
              && (numbers[2] == (numbers[1] + 1)) && (numbers[1] == (numbers[0] + 1))
              && (Math.ceil(numbers[3] / 3) == Math.ceil(numbers[5] / 3))
              && (numbers[5] == (numbers[4] + 1)) && (numbers[4] == (numbers[3] + 1)))) {
              // This is not a valid bet
              speechError = res.strings.BETNUMBERS_INVALID_NONADJACENT;
              reprompt = res.strings.BET_INVALID_REPROMPT;
            }
        }
      }

      if (!speechError) {
        const bet = {};
        bet.amount = utils.betAmount(event.request.intent, hand);
        if (isNaN(bet.amount) || (bet.amount < hand.minBet)) {
          speechError = res.strings.BET_INVALID_AMOUNT.replace('{0}', bet.amount);
          reprompt = res.strings.BET_INVALID_REPROMPT;
        } else if (hand.maxBet && (bet.amount > hand.maxBet)) {
          speechError = res.strings.BET_EXCEEDS_MAX.replace('{0}', hand.maxBet);
          reprompt = res.strings.BET_INVALID_REPROMPT;
        } else if (bet.amount > hand.bankroll) {
          // Oops, you can't bet this much
          speechError = res.strings.BET_EXCEEDS_BANKROLL.replace('{0}', hand.bankroll);
          reprompt = res.strings.BET_INVALID_REPROMPT;
        } else {
          hand.bankroll -= bet.amount;
          bet.numbers = numbers;
          bet.type = 'Numbers';

          // Check if they already have an identical bet and if so
          // we'll add to that bet (so long as it doesn't exceed the
          // hand maximum)
          let duplicateBet;
          let duplicateText;
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

          if (duplicateBet) {
            // Can I add this?
            if (hand.maxBet
              && ((bet.amount + duplicateBet.amount) > hand.maxBet)) {
              // No, you can't
              hand.bankroll += bet.amount;
              duplicateNotAdded = true;
              duplicateText = res.strings.BET_DUPLICATE_NOT_ADDED
                  .replace('{0}', duplicateBet.amount)
                  .replace('{1}', bet.amount)
                  .replace('{2}', hand.maxBet);
            } else {
              duplicateBet.amount += bet.amount;
              bet.amount = duplicateBet.amount;
              duplicateText = res.strings.BET_DUPLICATE_ADDED;
            }
          } else if (hand.bets) {
            hand.bets.unshift(bet);
          } else {
            hand.bets = [bet];
          }

          // OK, let's callback
          reprompt = res.strings.BET_PLACED_REPROMPT;
          if (duplicateNotAdded) {
            ssml = reprompt;
          } else {
            ssml = res.strings.BETNUMBERS_PLACED
              .replace('{0}', bet.amount)
              .replace('{1}', utils.speakNumbers(event.request.locale, numbers)).replace('{2}', reprompt);
          }

          if (duplicateText) {
            ssml = duplicateText + ssml;
          }
        }
      }
    }

    // OK, let's callback
    return handlerInput.responseBuilder
      .speak((speechError) ? speechError : ssml)
      .reprompt(reprompt)
      .getResponse();
  },
};
