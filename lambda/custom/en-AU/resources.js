//
// Localized resources
//

const utils = require('../utils');

const resources = {
  // From index.js
  'UNKNOWNINTENT_RESET': 'Sorry, I didn\'t get that. Try saying Yes or No.',
  'UNKNOWNINTENT_RESET_REPROMPT': 'Try saying Yes or No.',
  'UNKNOWN_INTENT': 'Sorry, I didn\'t get that. Try saying Bet on red.',
  'UNKNOWN_INTENT_REPROMPT': 'Try saying Bet on red.',
  // Betting strings (Bet*.js)
  'BET_INVALID_AMOUNT': 'I\'m sorry, {0} is not a valid amount to bet.',
  'BET_INVALID_REPROMPT': 'What else can I help you with?',
  'BET_EXCEEDS_MAX': 'Sorry, this bet exceeds the maximum bet of ${0}.',
  'BET_EXCEEDS_BANKROLL': 'Sorry, this bet exceeds your bankroll of ${0}',
  'BET_PLACED_REPROMPT': 'Place another bet or say spin the wheel to spin.',
  // From BetBlack.js
  'BETBLACK_PLACED': '${0} placed on black. <break time=\"200ms\"/> {1}',
  // From BetColumn.js
  'BETCOLUMN_INVALID_COLUMN': 'Sorry, you must specify the first, second, or third column',
  'BETCOLUMN_INVALID_COLUMN_VALUE': 'Sorry, {0} is not a valid column',
  'BETCOLUMN_PLACED': '${0} placed on the <say-as interpret-as="ordinal">{2}</say-as> column. <break time=\"200ms\"/> {1}',
  // From BetDozen.js
  'BETDOZEN_INVALID_DOZEN': 'Sorry, you must specify the first, second, or third dozen',
  'BETDOZEN_INVALID_DOZEN_VALUE': 'Sorry, {0} is not a valid dozen',
  'BETDOZEN_PLACED': '${0} placed on the <say-as interpret-as="ordinal">{2}</say-as> dozen. <break time=\"200ms\"/>{1}',
  // From BetEven.js
  'BETEVEN_PLACED': '${0} placed on even numbers. <break time=\"200ms\"/> {1}',
  // From BetHigh.js
  'BETHIGH_PLACED': '${0} placed on high numbers. <break time=\"200ms\"/> {1}',
  // From BetLow.js
  'BETLOW_PLACED': '${0} placed on low numbers. <break time=\"200ms\"/> {1}',
  // From BetNumbers.js
  'BETNUMBERS_MISSING_NUMBERS': 'Sorry, you must say a number for this bet',
  'BETNUMBERS_INVALID_NUMBER': 'Sorry, {0} is not a valid number.',
  'BETNUMBERS_INVALID_FIRSTNUMBER': 'Sorry, {0} is not a valid roulette bet',
  'BETNUMBERS_INVALID_FIVENUMBERS': 'Sorry, you cannot place a bet on five numbers',
  'BETNUMBERS_INVALID_NONADJACENT': 'Sorry those numbers are not adjacent on a roulette wheel.',
  'BETNUMBERS_PLACED': '${0} bet on {1}. {2}',
  // From BetOdd.js
  'BETODD_PLACED': '${0} placed on odd numbers. <break time=\"200ms\"/> {1}',
  // From BetRed.js
  'BETRED_PLACED': '${0} placed on red. <break time=\"200ms\"/> {1}',
  'BET_DUPLICATE_ADDED': 'Adding to your existing bet for a total of ',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed ${0} on this bet, and another ${1} would exceed the maximum bet of ${2}. ',
  // From Cancel.js
  'CANCEL_REMOVE_BET': 'Removing your bet of ${0} on {1}. ',
  'EXIT_GAME': '{0} Goodbye.',
  'CANCEL_REPROMPT_NOBET': 'Place a bet.',
  'CANCEL_REPROMPT_WITHBET': 'Place a bet or say spin to spin the wheel.',
  // From Help.js
  'HELP_REPROMPT': 'Check the Alexa companion app for a full set of bets you can place.',
  'HELP_WHEEL_AMERICAN': 'Playing with a double zero American wheel. ',
  'HELP_WHEEL_EUROPEAN': 'Playing with a single zero European wheel. ',
  'READ_BANKROLL': 'You have ${0}. ',
  'READ_BANKROLL_WITH_ACHIEVEMENT': 'You have ${0} and {1} achievement points. ',
  'HELP_SPIN_WITHBETS': 'Say spin the wheel to play your bets or read high scores to hear the leader board. ',
  'HELP_SPIN_WITHBETS_REPROMPT': 'Check the Alexa companion app for a full set of additional bets you can place.',
  'HELP_SPIN_LASTBETS': 'Say spin the wheel to play the same bets from last time or read high scores to hear the leader board. ',
  'HELP_SPIN_LASTBETS_REPROMPT': 'Check the Alexa companion app for a full set of new bets you can place.',
  'HELP_CARD_TITLE': 'Roulette Wheel',
  'HELP_CARD_TEXT': 'You can place outside or inside bets on a roulette wheel, and can place {0} on each bet. Say READ HIGH SCORES to hear the leader board.\nThe game is played with a wheel containing 18 black numbers, 18 red numbers, and either one or two zeroes (a zero and a double zero)\nOUTSIDE BETS:\nThe following bets pay even money: Red numbers, Black numbers, Even numbers (which exclude zeroes), Odd numbers, Low numbers (1-18), or High numbers (19-36).\nYou can also bet on dozens of numbers ("first dozen" 1-12, "second dozen" 13-24, "third dozen" 25-36) or columns of numbers ("first column" 1,4,7, etc) which pay 2 to 1.\nINSIDE BETS:You can place a bet on an individual number, including zero or double zero, which will pay 35 to 1. Or you can bet on groups of adjacent numbers such as 1 and 2; or 5, 6, 8, and 9. You can also place bets on a row or double row by calling out three or six numbers, such as "bet on 7, 8, and 9." Betting on two numbers pays 17 to 1, three numbers 11 to 1, four numbers 8 to 1, and six numbers 5 to 1.\nIf you wish to change between a single zero and double zero wheel, you can say "Change the wheel to an American wheel" or "Change the wheel to a European wheel." An American wheel has two zeroes, while a European wheel cuts the house advantage in half by only having a single wheel. Your high score and ranking are maintained separately between these two types of wheels.',
  'HELP_ACHIEVEMENT_POINTS': 'You earn 100 achievement points for every tournament win <break time=\'200ms\'/> 10 points each day you play <break time=\'200ms\'/> and an exponential 2 to the N points for each streak of the same number coming up N times in a row. ',
  'HELP_ACHIEVEMENT_CARD_TEXT': '\nYou earn achievement points as you play which is how the high score board is determined. You earn points as follows:\n - 100 achievement points each time you win the Thursday Tournament\n - 10 points each day you play\n - an exponential 2 to the N points for each streak of the same number coming up N times in a row.\n',
  // From HighScore.js
  'HIGHSCORE_REPROMPT': 'What else can I help you with?',
  // Launch.js
  'LAUNCH_REPROMPT': 'You can place a bet such as bet on red or bet on seventeen  <break time=\"200ms\"/> or say read high scores to hear the leader board.',
  'LAUNCH_WELCOME': 'Welcome to Roulette Wheel. ',
  // From Repeat.js
  'REPEAT_SAY_BET': '${0} on {1}',
  'REPEAT_BETS': 'You have bets of {0}. ',
  'REPEAT_LAST_BETS': 'Your last bets were {0}. <break time=\"200ms\"/> Say bet to replace these with a new set of bets or spin to reuse these bets.',
  'REPEAT_PLACE_BETS': 'You have no bets on the wheel.',
  'REPEAT_REPROMPT': 'What else can I help you with?',
  // From Repeat.js
  'REPEAT_SAY_BET': '${0} on {1}',
  'REPEAT_BETS': 'You have bets of {0}. ',
  'REPEAT_LAST_BETS': 'Your last bets were {0}. <break time=\"200ms\"/> Say bet to replace these with a new set of bets or spin to reuse these bets.',
  'REPEAT_PLACE_BETS': 'You have no bets on the wheel.',
  // From Reset.js
  'RESET_CONFIRM': 'Would you like to reset the game? This will reset your bankroll and clear all bets.',
  'RESET_COMPLETED': 'You have $1000. You can place a bet by saying bet on red, bet on six, or bet on the first dozen.',
  'RESET_REPROMPT': 'You can place a bet by saying bet on red, bet on six, or bet on the first dozen.',
  'RESET_ABORTED': 'Bankroll not reset.',
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
  'SPIN_CANTBET_LASTBETS': 'Sorry, your bankroll of ${0} can\'t support your last set of bets.',
  'SPIN_NO_MORE_BETS': 'No more bets! <audio src="https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3" />',
  'SPIN_RESULT': 'The ball landed on {0}. ',
  'SPIN_REPROMPT': 'Would you like to spin again?',
  'SPIN_REMAINING_BANKROLL': ' You have ${0} left. ',
  'SPIN_BUSTED': 'You lost all your money. Resetting to $1000 and clearing your bets. ',
  'SPIN_BUSTED_REPROMPT': 'Place new bets.',
  'SPIN_BANKROLL_TOOSMALL_FORLASTBETS': 'Your bankroll isn\'t enough to place these bets again. Clearing your bets. ',
  'SPIN_WINNER_AND': ', and ',
  'SPIN_WINNER_BET': 'your bet on {0} won',
  'SPIN_LOST_BETS': 'Sorry, all of your bets lost.',
  'SPIN_SUMMARY_WIN': ' You won ${0}.',
  'SPIN_SUMMARY_LOSE': ' You lost ${0}.',
  'SPIN_SUMMARY_EVEN': ' You broke even.',
  'SPIN_DAILY_EARN': 'You earned 10 achievement points for your first spin of the day. ',
  'SPIN_STREAK_EARN': 'You spun that number {0} times in a row and earned a streak bonus of {1} achievement points. ',
  // From utils.js
  'ERROR_REPROMPT': 'What else can I help with?',
  'DOUBLE_ZERO': 'double zero',
  'RED_NUMBER': 'red {0}',
  'BLACK_NUMBER': 'black {0}',
  'LEADER_RANKING': 'Your current achievement score of {0} ranks you as <say-as interpret-as="ordinal">{1}</say-as> of {2} players. ',
  'LEADER_TOURNAMENT_RANKING': 'Your bankroll of ${0} ranks you as <say-as interpret-as="ordinal">{1}</say-as> of {2} players in the tournament. ',
  'LEADER_NO_SCORES': 'Sorry, I\'m unable to read the current leader board',
  'LEADER_FORMAT': '${0}',
  'LEADER_TOP_SCORES': 'The top {0} achievement scores are ',
  'LEADER_TOP_BANKROLLS': 'The top {0} bankrolls are ',
  'LEADER_ACHIEVEMENT_HELP': ' <break time=\'300ms\'/> Ask for help to hear how you earn achievement points',
  'MORE_THAN_PLAYERS': 'over {0}',
  // Tournament strings
  'TOURNAMENT_NOCHANGERULES': 'Sorry, you can\'t change the wheel during tournament play. ',
  'TOURNAMENT_INVALIDACTION_REPROMPT': 'What else can I help you with?',
  'TOURNAMENT_NORESET': 'Sorry, you can\'t reset your bankroll during tournament play. What else can I help you with?',
  'TOURNAMENT_LAUNCH_WELCOMEBACK': 'Welcome to Roulette Wheel. You are currently playing in an active tournament. Would you like to continue? ',
  'TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT': 'Would you like to continue with the tournament? ',
  'TOURNAMENT_LAUNCH_INFORM': 'Welcome to Roulette Wheel. There is currently a tournament going on. Would you like to join?',
  'TOURNAMENT_LAUNCH_INFORM_REPROMPT': 'Would you like to join the tournament?',
  'TOURNAMENT_BANKROLL': 'You have ${0} and {1} spins remaining. ',
  'TOURNAMENT_SPINS_REMAINING': 'You have {0} spins remaining. ',
  'TOURNAMENT_STANDING_FIRST': 'You are currently in <say-as interpret-as="ordinal">1</say-as> place. ',
  'TOURNAMENT_STANDING_TOGO': '<say-as interpret-as="ordinal">1</say-as> place has ${0}. ',
  'TOURNAMENT_WELCOME_NEWPLAYER': 'Welcome to the Roulette Tournament! You start the tournament with ${0} and have {1} spins to earn as high a bankroll as possible. At the end of the tournament, the highest bankroll will receive 100 achievement points. Note that this tournament is separate from your normal bankroll. ',
  'TOURNAMENT_WELCOME_BACK': 'Welcome back to the Roulette Tournament! You have {0} spins remaining. ',
  'TOURNAMENT_WELCOME_REPROMPT': 'Place your bets!',
  'TOURNAMENT_BANKRUPT': 'You lost all your money and are out of the tournament. Thanks for playing! Check back tomorrow for the results. ',
  'TOURNAMENT_OUTOFSPINS': 'That was your last spin. Thanks for playing! Check back tomorrow for the results. ',
  'TOURNAMENT_WINNER': 'Congratulations, you won the tournament with ${0}! ',
  'TOURNAMENT_LOSER': 'Sorry, you didn\'t win the tournament. The high score was ${0} and you had ${1}. ',
  'TOURNAMENT_HELP': 'You are playing in the Roulette Wheel tournament. ',
  'TOURNAMENT_HELP_CARD_TEXT': 'You are playing in the Roulette Wheel tournament. You can spin up to {0} times on a double zero wheel. Whoever has the highest bankroll at the end of the tournament wins 100 achievement points.\nSay READ HIGH SCORES to hear the current leader board. You can place outside or inside bets on a roulette wheel, and can place {1} on each bet. The game is played with a wheel containing 18 black numbers, 18 red numbers, and two zeroes\nOUTSIDE BETS:\nThe following bets pay even money: Red numbers, Black numbers, Even numbers (which exclude zeroes), Odd numbers, Low numbers (1-18), or High numbers (19-36).\nYou can also bet on dozens of numbers ("first dozen" 1-12, "second dozen" 13-24, "third dozen" 25-36) or columns of numbers ("first column" 1,4,7, etc) which pay 2 to 1.\nINSIDE BETS:You can place a bet on an individual number, including zero or double zero, which will pay 35 to 1. Or you can bet on groups of adjacent numbers such as 1 and 2; or 5, 6, 8, and 9. You can also place bets on a row or double row by calling out three or six numbers, such as "bet on 7, 8, and 9." Betting on two numbers pays 17 to 1, three numbers 11 to 1, four numbers 8 to 1, and six numbers 5 to 1.',
  'TOURNAMENT_REMINDER': 'Come back Thursday for the weekly tournament. ',
  // Survey strings
  'SURVEY_OFFER': 'We are constantly working to improve Roulette Wheel, are you willing to take a three question survey to help us improve? ',
  'SURVEY_HELP_TEXT': 'We are constantly working to improve our game, please take a three question survey or leave us feedback on our Facebook account, Alexa Casino Games. ',
  'SURVEY_HELP_REPROMPT': 'Say yes to take our survey.',
  'SURVEY_QUESTION_TOURNAMENT': 'Have you played and do you enjoy our weekly tournament? ',
  'SURVEY_QUESTION_LEADERBOARD': 'Have you compared your bankroll to the list of high scores? ',
  'SURVEY_QUESTION_OTHERGAMES': 'Have you played any of our other Alexa skills such as Slot Machine <break time=\"200ms\"/> Blackjack Game <break time=\"200ms\"/> or Video Poker? ',
  'SURVEY_QUESTION_REPROMPT': 'Say yes or no. ',
  'SURVEY_ENDED': 'Thank you for taking our survey. If you would like to leave more feedback, visit us on Facebook at Alexa Casino Games. ',
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
      return 'the <say-as interpret-as="ordinal">{0}</say-as> column'.replace('{0}', numbers[0]);
    } else if (betType === 'Dozen') {
      return 'the <say-as interpret-as="ordinal">{0}</say-as> dozen'.replace('{0}', (numbers[11] / 12));
    } else if (betType === 'Numbers') {
      return utils.speakNumbers('en-US', numbers);
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
  betRange: function(hand) {
    let format;

    if (hand.minBet && hand.maxBet) {
      format = 'between ${0} and ${1}';
    } else if (hand.minBet) {
      format = '${0} or more';
    } else if (hand.maxBet) {
      format = '${1} or less';
    } else {
      format = 'any amount';
    }

    return (format.replace('{0}', hand.minBet).replace('{1}', hand.maxBet));
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