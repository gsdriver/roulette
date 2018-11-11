//
// Handles outside bets - red, black, high, low, even, odd, column, and dozen
//

'use strict';

const utils = require('../utils');
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can't do while waiting to join a tournament
    return (!attributes.temp.joinTournament &&
      (request.type === 'IntentRequest') &&
      ((request.intent.name === 'BlackIntent') ||
      (request.intent.name === 'RedIntent') ||
      (request.intent.name === 'EvenIntent') ||
      (request.intent.name === 'OddIntent') ||
      (request.intent.name === 'HighIntent') ||
      (request.intent.name === 'LowIntent') ||
      (request.intent.name === 'ColumnIntent') ||
      (request.intent.name === 'DozenIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let reprompt;
    let ordinal;
    const bet = {};
    const hand = attributes[attributes.currentHand];
    let speech;
    const speechParams = {};

    if (hand.minBet && (hand.bankroll < hand.minBet)) {
      speech = 'BET_INVALID_NOBANKROLL';
      reprompt = 'BET_INVALID_REPROMPT';
    } else if ((event.request.intent.name === 'ColumnIntent') ||
            (event.request.intent.name === 'DozenIntent')) {
        // For column and dozen, there needs to be an ordinal
      if (!event.request.intent.slots.Ordinal
        || !event.request.intent.slots.Ordinal.value) {
        // Sorry - reject this
        speech = (event.request.intent.name === 'ColumnIntent')
          ? 'BETCOLUMN_INVALID_COLUMN' : 'BETDOZEN_INVALID_DOZEN';
        reprompt = 'BET_INVALID_REPROMPT';
      } else {
        ordinal = utils.valueFromOrdinal(handlerInput, event.request.intent.slots.Ordinal.value);
        if (!ordinal) {
          speech = (event.request.intent.name === 'ColumnIntent')
              ? 'BETCOLUMN_INVALID_COLUMN_VALUE' : 'BETDOZEN_INVALID_DOZEN_VALUE';
          speechParams.Ordinal = event.request.intent.slots.Ordinal.value;
          reprompt = 'BET_INVALID_REPROMPT';
        }
      }
    }

    // Keep validating input if we don't have an error yet
    if (!speech) {
      bet.amount = utils.betAmount(event.request.intent, hand);
      hand.bankroll -= bet.amount;

      // OK, we're good to bet - let's set up the numbers and type
      switch (event.request.intent.name) {
        case 'BlackIntent':
          bet.numbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
          bet.type = 'Black';
          speech = 'BETBLACK_PLACED';
          break;
        case 'RedIntent':
          bet.numbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
          bet.type = 'Red';
          speech = 'BETRED_PLACED';
          break;
        case 'EvenIntent':
          bet.numbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
          bet.type = 'Even';
          speech = 'BETEVEN_PLACED';
          break;
        case 'OddIntent':
          bet.numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
          bet.type = 'Odd';
          speech = 'BETODD_PLACED';
          break;
        case 'HighIntent':
          bet.numbers = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
          bet.type = 'High';
          speech = 'BETHIGH_PLACED';
          break;
        case 'LowIntent':
          bet.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
          bet.type = 'Low';
          speech = 'BETLOW_PLACED';
          break;
        case 'ColumnIntent':
          bet.numbers = [];
          for (let i = 0; i < 12; i++) {
            bet.numbers.push(3*i + ordinal);
          }
          bet.type = 'Column';
          speech = 'BETCOLUMN_PLACED';
          speechParams.Ordinal = ordinal;
          break;
        case 'DozenIntent':
          bet.numbers = [];
          for (let i = 0; i < 12; i++) {
            bet.numbers.push(12*(ordinal-1)+i+1);
          }
          bet.type = 'Dozen';
          speech = 'BETDOZEN_PLACED';
          speechParams.Ordinal = ordinal;
          break;
        default:
          // This shouldn't happen
          console.log('Invalid outside bet???');
          break;
      }

      // Check if they already have an identical bet and if so
      // we'll add to that bet (so long as it doesn't exceed the
      // hand maximum)
      let duplicateBet;
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

      reprompt = 'BET_PLACED_REPROMPT';
      speechParams.BetAmount = bet.amount;
    }

    return handlerInput.jrb
      .speak(ri(speech, speechParams))
      .reprompt(ri(reprompt))
      .getResponse();
  },
};
