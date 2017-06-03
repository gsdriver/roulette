//
// Handles setting the rules of the game (either a single or double zero board)
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // You can set either a single zero (European) or double zero (American) wheel
    let reprompt;
    let speechError;
    let ssml;
    let numZeroes;

    const wheelMapping = {'DOUBLE ZERO': 2, 'SINGLE ZERO': 1, 'DOUBLE 0': 2, 'SINGLE 0': 1,
      'AMERICAN': 2, 'AMERICAN WHEEL': 2, 'EUROPEAN': 1, 'EUROPEAN WHEEL': 1,
      'DOUBLE ZERO WHEEL': 2, 'SINGLE ZERO WHEEL': 1, 'DOUBLE 0 WHEEL': 2, 'SINGLE 0 WHEEL': 1,
      'ONE ZERO': 1, 'TWO ZERO': 2, 'TWO ZEROES': 2,
      'ONE ZERO WHEEL': 1, 'TWO ZERO WHEEL': 2, 'TWO ZEROES WHEEL': 2};

    if (!this.event.request.intent.slots.Rules || !this.event.request.intent.slots.Rules.value) {
      // Sorry - reject this
      speechError = 'Sorry, you must specify the type of wheel you want such as double zero or single zero. ';
      reprompt = 'What else can I help you with?';
      speechError += reprompt;
    } else {
      numZeroes = wheelMapping[this.event.request.intent.slots.Rules.value.toUpperCase()];
      if (!numZeroes) {
        speechError = 'Sorry, I don\'t recognize ' + intent.slots.Rules.value + ' as a rule variant. ';
        reprompt = 'What else can I help you with?';
        speechError += reprompt;
      } else {
        // OK, set the wheel and clear all bets
        this.attributes.doubleZeroWheel = (numZeroes == 2);
        this.attributes.bets = null;
        this.attributes.lastbets = null;

        ssml = 'Setting the game to a ';
        ssml += (numZeroes == 2) ? 'double zero American ' : 'single zero European ';
        ssml += 'wheel. <break time = "200ms"/> All previous bets have been cleared.';
        ssml += '<break time = "200ms"/>  You can place a bet on individual numbers, ';
        ssml += 'red or black, even or odd, and groups of numbers. ';
        ssml += '<break time = "200ms"/> Place your bets!';

        reprompt = 'Place your bets!';
      }
    }

    // OK, let's callback
    utils.emitResponse(this.emit, speechError, null, ssml, reprompt);
  },
};
