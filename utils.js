//
// Utility functions
//

'use strict';

module.exports = {
  Slot : function(num) {
    return (num === -1) ? 'double zero' : num.toString();
  },
  Ordinal : function(num) {
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
  Number : function(value) {
    let result = parseInt(value);

    // First, is it an integer already?
    if (!isNaN(result)) {
      if ((result >= 0) && (result <= 36)) {
        // valid - return it
        return result;
      }
    } else {
      // Has to be "double zero" or "single zero"
      let zeroMapping = {"DOUBLE ZERO": -1, "SINGLE ZERO": 0, "DOUBLE 0": -1, "SINGLE 0": 0};

      if (zeroMapping[value]) {
        return zeroMapping[value];
      }
    }

    // Nope, not a valid value
    return null;
  },
  BetAmount : function(intent, session) {
    let amount = 1;

    if (intent.slots.Amount && intent.slots.Amount.value) {
      amount = intent.slots.Amount.value;
    } else {
      // Check if they have a previous bet amount and reuse that
      if (session.attributes.bets) {
        amount = session.attributes.bets[0].amount;
      }
    }

    return amount;
  }
};
