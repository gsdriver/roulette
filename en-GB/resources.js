//
// Localized resources
//

const utils = require('../utils');

const resources = {
  // From index.js
  'UNKNOWN_INTENT': 'Sorry, I didn\'t get that. Try saying Bet on red.',
  'UNKNOWN_INTENT_REPROMPT': 'Try saying Bet on red.',
  // Betting strings (Bet*.js)
  'BET_INVALID_AMOUNT': 'I\'m sorry, {0} is not a valid amount to bet.',
  'BET_INVALID_REPROMPT': 'What else can I help you with?',
  'BET_EXCEEDS_MAX': 'Sorry, this bet exceeds the maximum bet of £500.',
  'BET_EXCEEDS_BANKROLL': 'Sorry, this bet exceeds your bankroll of £{0}',
  'BET_PLACED_REPROMPT': 'Place another bet or say spin the wheel to spin.',
  // From BetBlack.js
  'BETBLACK_PLACED': '£{0} placed on black. <break time=\"200ms\"/> {1}',
  // From BetColumn.js
  'BETCOLUMN_INVALID_COLUMN': 'Sorry, you must specify the first, second, or third column',
  'BETCOLUMN_INVALID_COLUMN_VALUE': 'Sorry, {0} is not a valid column',
  'BETCOLUMN_PLACED': '£{0} placed on the <say-as interpret-as="ordinal">{1}</say-as> column. <break time=\"200ms\"/> {2}',
  // From BetDozen.js
  'BETDOZEN_INVALID_DOZEN': 'Sorry, you must specify the first, second, or third dozen',
  'BETDOZEN_INVALID_DOZEN_VALUE': 'Sorry, {0} is not a valid dozen',
  'BETDOZEN_PLACED': '£{0} placed on the <say-as interpret-as="ordinal">{1}</say-as> dozen. <break time=\"200ms\"/>{2}',
  // From BetEven.js
  'BETEVEN_PLACED': '£{0} placed on even numbers. <break time=\"200ms\"/> {1}',
  // From BetHigh.js
  'BETHIGH_PLACED': '£{0} placed on high numbers. <break time=\"200ms\"/> {1}',
  // From BetLow.js
  'BETLOW_PLACED': '£{0} placed on low numbers. <break time=\"200ms\"/> {1}',
  // From BetNumbers.js
  'BETNUMBERS_MISSING_NUMBERS': 'Sorry, you must say a number for this bet',
  'BETNUMBERS_INVALID_NUMBER': 'Sorry, {0} is not a valid number.',
  'BETNUMBERS_INVALID_FIRSTNUMBER': 'Sorry, {0} is not a valid roulette bet',
  'BETNUMBERS_INVALID_FIVENUMBERS': 'Sorry, you cannot place a bet on five numbers',
  'BETNUMBERS_INVALID_NONADJACENT': 'Sorry those numbers are not adjacent on a roulette wheel.',
  'BETNUMBERS_PLACED': '£{0} bet on {1}. {2}',
  // From BetOdd.js
  'BETODD_PLACED': '£{0} placed on odd numbers. <break time=\"200ms\"/> {1}',
  // From BetRed.js
  'BETRED_PLACED': '£{0} placed on red. <break time=\"200ms\"/> {1}',
  // From Cancel.js
  'CANCEL_REMOVE_BET': 'Removing your bet of £{0} on {1}. ',
  'EXIT_GAME': 'Thanks for playing! Goodbye.',
  'CANCEL_REPROMPT_NOBET': 'Place a bet.',
  'CANCEL_REPROMPT_WITHBET': 'Place a bet or say spin to spin the wheel.',
  // From Help.js
  'HELP_REPROMPT': 'You can place a bet by saying phrases like bet on red, bet on six, or bet on the first dozen.',
  'HELP_WHEEL_AMERICAN': 'Playing with a double zero American wheel. ',
  'HELP_WHEEL_EUROPEAN': 'Playing with a single zero European wheel. ',
  'READ_BANKROLL': 'You have £{0}. ',
  'HELP_SPIN_WITHBETS': 'Say spin the wheel to play your bets. ',
  'HELP_SPIN_WITHBETS_REPROMPT': 'You can place additional bets by saying phrases like bet on red, bet on six, or bet on the first dozen.',
  'HELP_SPIN_LASTBETS': 'Say spin the wheel to play the same bets from last time. ',
  'HELP_SPIN_LASTBETS_REPROMPT': 'You can place new bets by saying phrases like bet on red, bet on six, or bet on the first dozen.',
  // Launch.js
  'LAUNCH_REPROMPT': 'You can place a bet by saying bet on red, bet on six, or bet on the first dozen',
  'LAUNCH_WELCOME': 'Welcome to Roulette Wheel. ',
  // Rules.js
  'RULES_NO_WHEELTYPE': 'Sorry, you must specify the type of wheel you want such as double zero or single zero. ',
  'RULES_INVALID_VARIANT': 'Sorry, I don\'t recognize {0} as a rule variant. ',
  'RULES_ERROR_REPROMPT': 'What else can I help you with?',
  'RULES_SET_AMERICAN': 'Setting the game to a double zero American wheel. ',
  'RULES_SET_EUROPEAN': 'Setting the game to a single zero European wheel. ',
  'RULES_CLEAR_BETS': '<break time=\"200ms\"/> All previous bets have been cleared. ',
  'RULES_WHAT_NEXT': '<break time=\"200ms\"/>  You can place a bet on individual numbers, red or black, even or odd, and groups of numbers. <break time = "200ms"/> Place your bets!',
  'RULES_REPROMPT': 'Place your bets!',
  // Spin.js
  'SPIN_NOBETS': 'Sorry, you have to place a bet before you can spin the wheel.',
  'SPIN_INVALID_REPROMPT': 'Place a bet',
  'SPIN_CANTBET_LASTBETS': 'Sorry, your bankroll of £{0} can\'t support your last set of bets.',
  'SPIN_NO_MORE_BETS': 'No more bets! <audio src="https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3" />',
  'SPIN_RESULT': 'The ball landed on {0}. ',
  'SPIN_REPROMPT': 'Place new bets, or say spin to use the same set of bets again.',
  'SPIN_REMAINING_BANKROLL': ' You have £{0} left. ',
  'SPIN_BUSTED': 'You lost all your money. Resetting to £1000 and clearing your bets. ',
  'SPIN_BUSTED_REPROMPT': 'Place new bets.',
  'SPIN_BANKROLL_TOOSMALL_FORLASTBETS': 'Your bankroll isn\'t enough to place these bets again. Clearing your bets. ',
  'SPIN_NEW_HIGHBANKROLL': 'You have a new personal highest bankroll! ',
  'SPIN_WINNER_AND': ', and ',
  'SPIN_WINNER_BET': 'your bet on {0} won',
  'SPIN_LOST_BETS': 'Sorry, all of your bets lost.',
  'SPIN_SUMMARY_WIN': ' You won £{0}.',
  'SPIN_SUMMARY_LOSE': ' You lost £{0}.',
  'SPIN_SUMMARY_EVEN': ' You broke even.',
  // From utils.js
  'ERROR_REPROMPT': 'What else can I help with?',
  'DOUBLE_ZERO': 'double zero',
  'RED_NUMBER': 'red {0}',
  'BLACK_NUMBER': 'black {0}',
  'RANK_AMERICAN_VERBOSE': 'On a double zero American wheel, your high score of £{0} ranks <say-as interpret-as="ordinal">{1}</say-as> of {2} players. ',
  'RANK_AMERICAN_NUMPLAYERS': 'There are {0} players on a double zero American wheel. ',
  'RANK_EUROPEAN_VERBOSE': 'On a single zero European wheel, your high score of £{0} ranks <say-as interpret-as="ordinal">{1}</say-as> of {2} players. ',
  'RANK_EUROPEAN_NUMPLAYERS': 'There are {0} players on a single zero European wheel. ',
  'RANK_NONVERBOSE': 'You are ranked <say-as interpret-as="ordinal">{0}</say-as> of {1} players. ',
};

module.exports = {
  strings: resources,
  mapBetType: function(betType, numbers) {
    const betTypeMapping = {'Black': 'black',
                          'Red': 'red',
                          'Even': 'even numbers',
                          'Odd': 'odd numbers',
                          'High': 'high numbers',
                          'Low': 'low numbers'};
    if (betTypeMapping[betType]) {
      return betTypeMapping[betType];
    } else if (betType === 'Column') {
      return ('the <say-as interpret-as="ordinal">{0}</say-as> column').replace('{0]', numbers[0]);
    } else if (betType === 'Dozen') {
      return ('the <say-as interpret-as="ordinal">{0}</say-as> dozen').replace('{0]', (numbers[11] / 12));
    } else if (betType === 'Numbers') {
      return utils.speakNumbers('en-GB', numbers);
    }

    // No match
    return betType;
  },
  mapWheelType: function(wheel) {
    const wheelMapping = {'DOUBLE ZERO': 2, 'SINGLE ZERO': 1, 'DOUBLE 0': 2, 'SINGLE 0': 1,
      'AMERICAN': 2, 'AMERICAN WHEEL': 2, 'EUROPEAN': 1, 'EUROPEAN WHEEL': 1,
      'DOUBLE ZERO WHEEL': 2, 'SINGLE ZERO WHEEL': 1, 'DOUBLE 0 WHEEL': 2, 'SINGLE 0 WHEEL': 1,
      'ONE ZERO': 1, 'TWO ZERO': 2, 'TWO ZEROES': 2,
      'ONE ZERO WHEEL': 1, 'TWO ZERO WHEEL': 2, 'TWO ZEROES WHEEL': 2};

    return wheelMapping[wheel.toUpperCase()];
  },
  mapZero: function(value) {
    const zeroMapping = {'DOUBLE ZERO': -1, 'SINGLE ZERO': 0, 'DOUBLE 0': -1, 'SINGLE 0': 0};

    return zeroMapping[value.toUpperCase()];
  },
  valueFromOrdinal: function(ord) {
    const ordinalMapping = {'first': 1, '1st': 1, 'second': 2, '2nd': 2, 'third': 3, '3rd': 3};
    const lowerOrd = ord.toLowerCase();

    if (ordinalMapping[lowerOrd]) {
      return ordinalMapping[lowerOrd];
    } else if (parseInt(ord) && (parseInt(ord) < 4)) {
      return parseInt(ord);
    }

    // Not a valid value
    return 0;
  },
};