//
// Utility functions
//

'use strict';

module.exports = {
  slot: function(num, sayColor) {
    let result;
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

    result = (num === -1) ? 'double zero' : num.toString();
    if ((num > 0) && sayColor) {
      if (blackNumbers.indexOf(num) > -1) {
        result = 'black ' + result;
      } else {
        result = 'red ' + result;
      }
    }

    return result;
  },
  ordinal: function(num) {
    if (num === 1) {
      return 'first';
    } else if (num === 2) {
      return 'second';
    } else if (num === 3) {
      return 'third';
    } else {
      console.log('Bad value passed to Ordinal');
      return '';
    }
  },
  valueFromOrdinal: function(ord) {
    const ordinalMapping = {'first': 1, '1st': 1, 'second': 2, '2nd': 2, 'third': 3, '3rd': 3};
    const lowerOrd = ord.toLowerCase();

    if (ordinalMapping[lowerOrd]) {
      return ordinalMapping[lowerOrd];
    }

    // Not a valid value
    return 0;
  },
  number: function(value) {
    const result = parseInt(value);

    // First, is it an integer already?
    if (!isNaN(result)) {
      if ((result >= 0) && (result <= 36)) {
        // valid - return it
        return result;
      }
    } else {
      // Has to be "double zero" or "single zero"
      const zeroMapping = {'DOUBLE ZERO': -1, 'SINGLE ZERO': 0, 'DOUBLE 0': -1, 'SINGLE 0': 0};

      if (zeroMapping[value.toUpperCase()]) {
        return zeroMapping[value.toUpperCase()];
      }
    }

    // Nope, not a valid value
    return undefined;
  },
  betAmount: function(intent, session) {
    let amount = 1;

    if (intent.slots.Amount && intent.slots.Amount.value) {
      amount = intent.slots.Amount.value;
    } else {
      // Check if they have a previous bet amount and reuse that
      if (session.attributes.bets) {
        amount = session.attributes.bets[0].amount;
      } else if (session.attributes.lastbets) {
        amount = session.attributes.lastbets[0].amount;
      }
    }

    // Better make sure they have this much - if they don't return -1
    if (amount > session.attributes.bankroll) {
      amount = -1;
    } else {
      session.attributes.bankroll -= amount;
    }

    return amount;
  },
  speakBet: function(amount, betPlaced, reprompt) {
    let ssml;

    ssml = '<speak>' + amount + ' unit';
    if (amount > 1) {
      ssml += 's';
    }
    ssml += (' ' + betPlaced);
    ssml += ' <break time="200ms"/> ';
    ssml += reprompt;
    ssml += '</speak>';

    return ssml;
  },
};
