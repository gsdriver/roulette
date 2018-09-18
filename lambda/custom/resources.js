//
// Localized resources
//

const leven = require('leven');
const seedrandom = require('seedrandom');

const common = {
  // From Unknown.js
  'UNKNOWNINTENT_TOURNAMENT': 'Sorry, I didn\'t get that. There is a tournament game underway <break time=\'200ms\'/> Say yes to join the tournament or no to continue the normal game.',
  'UNKNOWNINTENT_TOURNAMENTT_REPROMPT': 'Try saying Yes or No.',
  'UNKNOWN_INTENT': 'Sorry, I didn\'t get that. Try saying {0}.',
  'UNKNOWN_INTENT_REPROMPT': 'Try saying {0}.',
  // Betting strings (Bet*.js)
  'BET_INVALID_AMOUNT': 'I\'m sorry, {0} is not a valid amount to bet.',
  'BET_INVALID_REPROMPT': 'What else can I help you with?',
  'BET_PLACED_REPROMPT': 'Place another bet or say spin the wheel to spin.',
  'BET_SUGGESTION': 'bet on red|bet on black|bet on {0}|bet on {0}|bet on {0}|bet on the <say-as interpret-as="ordinal">{1}</say-as> dozen| bet on the <say-as interpret-as="ordinal">{1}</say-as> column|bet on high numbers|bet on odd numbers|bet on even numbers',
  // From BetColumn.js
  'BETCOLUMN_INVALID_COLUMN': 'Sorry, you must specify the first, second, or third column',
  'BETCOLUMN_INVALID_COLUMN_VALUE': 'Sorry, {0} is not a valid column',
  // From BetDozen.js
  'BETDOZEN_INVALID_DOZEN': 'Sorry, you must specify the first, second, or third dozen',
  'BETDOZEN_INVALID_DOZEN_VALUE': 'Sorry, {0} is not a valid dozen',
  // From BetNumbers.js
  'BETNUMBERS_MISSING_NUMBERS': 'Sorry, you must say a number for this bet',
  'BETNUMBERS_INVALID_NUMBER': 'Sorry, {0} is not a valid number.',
  'BETNUMBERS_INVALID_FIRSTNUMBER': 'Sorry, {0} is not a valid roulette bet',
  'BETNUMBERS_INVALID_FIVENUMBERS': 'Sorry, you cannot place a bet on five numbers',
  'BETNUMBERS_INVALID_NONADJACENT': 'Sorry those numbers are not adjacent on a roulette wheel.',
  // From BetRed.js
  'BET_DUPLICATE_ADDED': 'Adding to your existing bet for a total of ',
  // From Cancel.js
  'EXIT_GAME': '{0} Goodbye.',
  'CANCEL_REPROMPT_NOBET': 'Place a bet.',
  'CANCEL_REPROMPT_WITHBET': 'Place a bet or say spin to spin the wheel.',
  // From Help.js
  'HELP_REPROMPT': 'Check the Alexa companion app for a full set of bets you can place.',
  'HELP_WHEEL_AMERICAN': 'Playing with a double zero American wheel. ',
  'HELP_WHEEL_EUROPEAN': 'Playing with a single zero European wheel. ',
  'HELP_SPIN_WITHBETS': 'Say spin the wheel to play your bets or read high scores to hear the leader board. ',
  'HELP_SPIN_WITHBETS_REPROMPT': 'Check the Alexa companion app for a full set of additional bets you can place.',
  'HELP_SPIN_LASTBETS': 'Say spin the wheel to play the same bets from last time or read high scores to hear the leader board. ',
  'HELP_SPIN_LASTBETS_REPROMPT': 'Check the Alexa companion app for a full set of new bets you can place.',
  'HELP_JOIN_TOURNAMENT': 'The weekly tournament is a chance for you to play against other players to try to get the highest bankroll in 100 spins. Say yes to join the tournament or no to play the normal game.',
  'HELP_JOIN_TOURNAMENT_REPROMPT': 'Say yes to join the tournament or no to play the normal game.',
  'HELP_CARD_TITLE': 'Roulette Wheel',
  'HELP_CARD_TEXT': 'You can place outside or inside bets on a roulette wheel, and can place {0} on each bet. Say READ HIGH SCORES to hear the leader board.\nThe game is played with a wheel containing 18 black numbers, 18 red numbers, and either one or two zeroes (a zero and a double zero)\nOUTSIDE BETS:\nThe following bets pay even money: Red numbers, Black numbers, Even numbers (which exclude zeroes), Odd numbers, Low numbers (1-18), or High numbers (19-36).\nYou can also bet on dozens of numbers ("first dozen" 1-12, "second dozen" 13-24, "third dozen" 25-36) or columns of numbers ("first column" 1,4,7, etc) which pay 2 to 1.\nINSIDE BETS:You can place a bet on an individual number, including zero or double zero, which will pay 35 to 1. Or you can bet on groups of adjacent numbers such as 1 and 2; or 5, 6, 8, and 9. You can also place bets on a row or double row by calling out three or six numbers, such as "bet on 7, 8, and 9." Betting on two numbers pays 17 to 1, three numbers 11 to 1, four numbers 8 to 1, and six numbers 5 to 1.\nIf you wish to change between a single zero and double zero wheel, you can say "Change the wheel to an American wheel" or "Change the wheel to a European wheel." An American wheel has two zeroes, while a European wheel cuts the house advantage in half by only having a single wheel. Your high score and ranking are maintained separately between these two types of wheels.',
  'HELP_ACHIEVEMENT_POINTS': 'You earn 100 achievement points for every tournament win <break time=\'200ms\'/> 10 points each day you play <break time=\'200ms\'/> and an exponential 2 to the N points for each streak of the same number coming up N times in a row. ',
  'HELP_ACHIEVEMENT_CARD_TEXT': '\nYou earn achievement points as you play which is how the high score board is determined. You earn points as follows:\n - 100 achievement points each time you win the Thursday Tournament\n - 10 points each day you play\n - an exponential 2 to the N points for each streak of the same number coming up N times in a row.\n',
  // From HighScore.js
  'HIGHSCORE_REPROMPT': 'What else can I help you with?',
  // Launch.js
  'LAUNCH_REPROMPT': 'You can place a bet such as {0}.',
  'LAUNCH_WELCOME': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> Welcome to Roulette Wheel. ',
  'LAUNCH_WELCOME_BUTTON': 'If you have an Echo Button you can press it to spin the wheel <break time=\"200ms\"/> or ',
  // From Repeat.js
  'REPEAT_BETS': 'You have bets of {0}. ',
  'REPEAT_LAST_BETS': 'Your last bets were {0}. <break time=\"200ms\"/> Say bet to replace these with a new set of bets or spin to reuse these bets.',
  'REPEAT_PLACE_BETS': 'You have no bets on the wheel.',
  'REPEAT_REPROMPT': 'What else can I help you with?',
  // Rules.js
  'RULES_NO_WHEELTYPE': 'Sorry, you must specify the type of wheel you want such as double zero or single zero. ',
  'RULES_INVALID_VARIANT': 'Sorry, I don\'t recognize {0} as a rule variant. ',
  'RULES_NO_TOURNAMENT': 'Sorry, you can\'t join the tournament - come back next Thursday to play the tournament! ',
  'RULES_ERROR_REPROMPT': 'What else can I help you with?',
  'RULES_SET_AMERICAN': 'Setting the game to a double zero American wheel. ',
  'RULES_SET_EUROPEAN': 'Setting the game to a single zero European wheel. ',
  'RULES_CLEAR_BETS': '<break time=\"200ms\"/> All previous bets have been cleared. ',
  'RULES_WHAT_NEXT': '<break time=\"200ms\"/>  You can place a bet on individual numbers, red or black, even or odd, and groups of numbers. <break time = "200ms"/> Place your bets!',
  'RULES_REPROMPT': 'Place your bets!',
  // Spin.js
  'SPIN_NOBETS': 'Sorry, you have to place a bet before you can spin the wheel. Try saying {0}.',
  'SPIN_INVALID_REPROMPT': 'Place a bet',
  'SPIN_NO_MORE_BETS': 'No more bets! <audio src="https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3" />',
  'SPIN_RESULT': 'The ball landed on {0}. ',
  'SPIN_REPROMPT': 'Would you like to spin again?',
  'SPIN_BUSTED_REPROMPT': 'Place new bets.',
  'SPIN_BANKROLL_TOOSMALL_FORLASTBETS': 'Your bankroll isn\'t enough to place these bets again. Clearing your bets. ',
  'SPIN_WINNER_BET': 'your bet on {0} won',
  'SPIN_LOST_BETS': 'Sorry, all of your bets lost',
  'SPIN_SUMMARY_EVEN': ' You broke even.',
  'SPIN_DAILY_EARN': 'You earned 10 achievement points for your first spin of the day. ',
  'SPIN_STREAK_EARN': 'You spun that number {0} times in a row and earned a streak bonus of {1} achievement points. ',
  // From utils.js
  'ERROR_REPROMPT': 'What else can I help with?',
  'DOUBLE_ZERO': 'double zero',
  'RED_NUMBER': 'red {0}',
  'BLACK_NUMBER': 'black {0}',
  'LEADER_RANKING': 'Your current achievement score of {0} ranks you as <say-as interpret-as="ordinal">{1}</say-as> of {2} players. ',
  'LEADER_NO_SCORES': 'Sorry, I\'m unable to read the current leader board',
  'LEADER_TOP_SCORES': 'The top {0} achievement scores are ',
  'LEADER_TOP_BANKROLLS': 'The top {0} bankrolls are ',
  'LEADER_ACHIEVEMENT_HELP': ' <break time=\'300ms\'/> Ask for help to hear how you earn achievement points',
  'MORE_THAN_PLAYERS': 'over {0}',
  'DISPLAY_TITLE': 'Roulette Wheel',
  // Tournament strings
  'TOURNAMENT_INVALIDACTION_REPROMPT': 'What else can I help you with?',
  'TOURNAMENT_LAUNCH_WELCOMEBACK': 'Welcome to Roulette Wheel. You are currently playing in an active tournament. Would you like to continue? ',
  'TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT': 'Would you like to continue with the tournament? ',
  'TOURNAMENT_LAUNCH_INFORM': 'Welcome to Roulette Wheel. There is currently a tournament going on. Would you like to join?',
  'TOURNAMENT_LAUNCH_INFORM_REPROMPT': 'Would you like to join the tournament?',
  'TOURNAMENT_SPINS_REMAINING': 'You have {0} spins remaining. ',
  'TOURNAMENT_STANDING_FIRST': 'You are currently in <say-as interpret-as="ordinal">1</say-as> place. ',
  'TOURNAMENT_WELCOME_BACK': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> Welcome back to the Roulette Tournament! You have {0} spins remaining. ',
  'TOURNAMENT_WELCOME_BUTTON': 'If you have an Echo Button you can press it to spin the wheel. ',
  'TOURNAMENT_WELCOME_REPROMPT': 'Place your bets!',
  'TOURNAMENT_BANKRUPT': 'You lost all your money and are out of the tournament. Thanks for playing! Check back tomorrow for the results. ',
  'TOURNAMENT_OUTOFSPINS': 'That was your last spin. Thanks for playing! Check back tomorrow for the results. ',
  'TOURNAMENT_HELP': 'You are playing in the Roulette Wheel tournament. ',
  'TOURNAMENT_HELP_CARD_TEXT': 'You are playing in the Roulette Wheel tournament. You can spin up to {0} times on a double zero wheel. Whoever has the highest bankroll at the end of the tournament wins 100 achievement points.\nSay READ HIGH SCORES to hear the current leader board. You can place outside or inside bets on a roulette wheel, and can place {1} on each bet. The game is played with a wheel containing 18 black numbers, 18 red numbers, and two zeroes\nOUTSIDE BETS:\nThe following bets pay even money: Red numbers, Black numbers, Even numbers (which exclude zeroes), Odd numbers, Low numbers (1-18), or High numbers (19-36).\nYou can also bet on dozens of numbers ("first dozen" 1-12, "second dozen" 13-24, "third dozen" 25-36) or columns of numbers ("first column" 1,4,7, etc) which pay 2 to 1.\nINSIDE BETS:You can place a bet on an individual number, including zero or double zero, which will pay 35 to 1. Or you can bet on groups of adjacent numbers such as 1 and 2; or 5, 6, 8, and 9. You can also place bets on a row or double row by calling out three or six numbers, such as "bet on 7, 8, and 9." Betting on two numbers pays 17 to 1, three numbers 11 to 1, four numbers 8 to 1, and six numbers 5 to 1.',
  'TOURNAMENT_REMINDER': 'Come back Thursday for the weekly tournament. ',
};

const dollar = {
  // Betting strings (Bet*.js)
  'BET_EXCEEDS_MAX': 'Sorry, this bet exceeds the maximum bet of ${0}.',
  'BET_EXCEEDS_BANKROLL': 'Sorry, this bet exceeds your bankroll of ${0}',
  // From BetBlack.js
  'BETBLACK_PLACED': '${0} placed on black. <break time=\"200ms\"/> {1}',
  // From BetColumn.js
  'BETCOLUMN_PLACED': '${0} placed on the <say-as interpret-as="ordinal">{2}</say-as> column. <break time=\"200ms\"/> {1}',
  // From BetDozen.js
  'BETDOZEN_PLACED': '${0} placed on the <say-as interpret-as="ordinal">{2}</say-as> dozen. <break time=\"200ms\"/>{1}',
  // From BetEven.js
  'BETEVEN_PLACED': '${0} placed on even numbers. <break time=\"200ms\"/> {1}',
  // From BetHigh.js
  'BETHIGH_PLACED': '${0} placed on high numbers. <break time=\"200ms\"/> {1}',
  // From BetLow.js
  'BETLOW_PLACED': '${0} placed on low numbers. <break time=\"200ms\"/> {1}',
  // From BetNumbers.js
  'BETNUMBERS_PLACED': '${0} bet on {1}. {2}',
  // From BetOdd.js
  'BETODD_PLACED': '${0} placed on odd numbers. <break time=\"200ms\"/> {1}',
  // From BetRed.js
  'BETRED_PLACED': '${0} placed on red. <break time=\"200ms\"/> {1}',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed ${0} on this bet, and another ${1} would exceed the maximum bet of ${2}. ',
  // From Cancel.js
  'CANCEL_REMOVE_BET': 'Removing your bet of ${0} on {1}. ',
  // From Help.js
  'READ_BANKROLL': 'You have ${0}. ',
  'READ_BANKROLL_WITH_ACHIEVEMENT': 'You have ${0} and {1} achievement points. ',
  // From Repeat.js
  'REPEAT_SAY_BET': '${0} on {1}',
  // Spin.js
  'SPIN_CANTBET_LASTBETS': 'Sorry, your bankroll of ${0} can\'t support your last set of bets.',
  'SPIN_BUSTED': 'You lost all your money. Resetting to $1000 and clearing your bets. ',
  'SPIN_SUMMARY_RESULT': '{0} leaving you with ${1}. ',
  // From utils.js
  'LEADER_TOURNAMENT_RANKING': 'Your bankroll of ${0} ranks you as <say-as interpret-as="ordinal">{1}</say-as> of {2} players in the tournament. ',
  'LEADER_FORMAT': '${0}',
  // Tournament strings
  'TOURNAMENT_BANKROLL': 'You have ${0} and {1} spins remaining. ',
  'TOURNAMENT_STANDING_TOGO': '<say-as interpret-as="ordinal">1</say-as> place has ${0}. ',
  'TOURNAMENT_WELCOME_NEWPLAYER': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/>  Welcome to the Roulette Tournament! You start the tournament with ${0} and have {1} spins to earn as high a bankroll as possible. At the end of the tournament, the highest bankroll will receive 100 achievement points. Note that this tournament is separate from your normal bankroll. ',
  'TOURNAMENT_WINNER': 'Congratulations, you won the tournament with ${0}! ',
  'TOURNAMENT_LOSER': 'Sorry, you didn\'t win the tournament. The high score was ${0} and you had ${1}. ',
  // From this file
  'BETRANGE_BETWEEN': 'between ${0} and ${1}',
  'BETRANGE_MORE': '${0} or more',
  'BETRANGE_LESS': '${1} or less',
};

const pound = {
  // Betting strings (Bet*.js)
  'BET_EXCEEDS_MAX': 'Sorry, this bet exceeds the maximum bet of £{0}.',
  'BET_EXCEEDS_BANKROLL': 'Sorry, this bet exceeds your bankroll of £{0}',
  // From BetBlack.js
  'BETBLACK_PLACED': '£{0} placed on black. <break time=\"200ms\"/> {1}',
  // From BetColumn.js
  'BETCOLUMN_PLACED': '£{0} placed on the <say-as interpret-as="ordinal">{2}</say-as> column. <break time=\"200ms\"/> {1}',
  // From BetDozen.js
  'BETDOZEN_PLACED': '£{0} placed on the <say-as interpret-as="ordinal">{2}</say-as> dozen. <break time=\"200ms\"/>{1}',
  // From BetEven.js
  'BETEVEN_PLACED': '£{0} placed on even numbers. <break time=\"200ms\"/> {1}',
  // From BetHigh.js
  'BETHIGH_PLACED': '£{0} placed on high numbers. <break time=\"200ms\"/> {1}',
  // From BetLow.js
  'BETLOW_PLACED': '£{0} placed on low numbers. <break time=\"200ms\"/> {1}',
  // From BetNumbers.js
  'BETNUMBERS_PLACED': '£{0} bet on {1}. {2}',
  // From BetOdd.js
  'BETODD_PLACED': '£{0} placed on odd numbers. <break time=\"200ms\"/> {1}',
  // From BetRed.js
  'BETRED_PLACED': '£{0} placed on red. <break time=\"200ms\"/> {1}',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed £{0} on this bet, and another £{1} would exceed the maximum bet of £{2}. ',
  // From Cancel.js
  'CANCEL_REMOVE_BET': 'Removing your bet of £{0} on {1}. ',
  // From Help.js
  'READ_BANKROLL': 'You have £{0}. ',
  'READ_BANKROLL_WITH_ACHIEVEMENT': 'You have £{0} and {1} achievement points. ',
  // From Repeat.js
  'REPEAT_SAY_BET': '£{0} on {1}',
  // Spin.js
  'SPIN_CANTBET_LASTBETS': 'Sorry, your bankroll of £{0} can\'t support your last set of bets.',
  'SPIN_BUSTED': 'You lost all your money. Resetting to £1000 and clearing your bets. ',
  'SPIN_SUMMARY_RESULT': '{0} leaving you with £{1}. ',
  // From utils.js
  'LEADER_TOURNAMENT_RANKING': 'Your bankroll of £{0} ranks you as <say-as interpret-as="ordinal">{1}</say-as> of {2} players in the tournament. ',
  'LEADER_FORMAT': '£{0}',
  // Tournament strings
  'TOURNAMENT_BANKROLL': 'You have £{0} and {1} spins remaining. ',
  'TOURNAMENT_STANDING_TOGO': '<say-as interpret-as="ordinal">1</say-as> place has £{0}. ',
  'TOURNAMENT_WELCOME_NEWPLAYER': 'Welcome to the Roulette Tournament! You start the tournament with £{0} and have {1} spins to earn as high a bankroll as possible. At the end of the tournament, the highest bankroll will receive 100 achievement points. Note that this tournament is separate from your normal bankroll. ',
  'TOURNAMENT_WINNER': 'Congratulations, you won the tournament with £{0}! ',
  'TOURNAMENT_LOSER': 'Sorry, you didn\'t win the tournament. The high score was £{0} and you had £{1}. ',
  // From this file
  'BETRANGE_BETWEEN': 'between £{0} and £{1}',
  'BETRANGE_MORE': '£{0} or more',
  'BETRANGE_LESS': '£{1} or less',
};

const german = {
  // From Unknown.js
  'UNKNOWNINTENT_TOURNAMENT': 'Das habe ich leider nicht verstanden.Es läuft gerade ein Turnier <break time=\'200ms\'/> Sag Ja, um am Turnier teilzunehmen, oder Nein, um mit dem normalen Spiel weiterzumachen.',
  'UNKNOWNINTENT_TOURNAMENTT_REPROMPT': 'Versuche es mit Ja oder Nein.',
  'UNKNOWN_INTENT': 'Das habe ich leider nicht verstanden. Sag zum Beispiel {0}.',
  'UNKNOWN_INTENT_REPROMPT': 'Sag zum Beispiel {0}.',
  // Betting strings (Bet*.js)
  'BET_INVALID_AMOUNT': '{0} ist leider kein gültiger Wettbetrag.',
  'BET_INVALID_REPROMPT': 'Womit kann ich dir noch helfen?',
  'BET_PLACED_REPROMPT': 'Platziere eine neue Wette oder sag Dreh das Rad um zu drehen.',
  'BET_SUGGESTION': 'Setze auf Rot|Setze auf Schwarz|Setze auf {0}|Setze auf {0}|Setze auf {0}|Setze auf das <say-as interpret-as="ordinal">{1}</say-as> Dutzend|Setze auf die <say-as interpret-as="ordinal">{1}</say-as> Spalte|Setze auf hohe Zahlen|Setze auf ungerade Zahlen|Setze auf gerade Zahlen',
  // From BetColumn.js
  'BETCOLUMN_INVALID_COLUMN': 'Tut mir Leid, du musst die erste, zweite oder dritte Spalte angeben',
  'BETCOLUMN_INVALID_COLUMN_VALUE': 'Tut mir Leid, {0} ist keine gültige Spalte',
  // From BetDozen.js
  'BETDOZEN_INVALID_DOZEN': 'Tut mir Leid, du musst das erste, zweite oder dritte Dutzend angeben',
  'BETDOZEN_INVALID_DOZEN_VALUE': 'Tut mir Leid, {0} ist kein gültiges Dutzend',
  // From BetNumbers.js
  'BETNUMBERS_MISSING_NUMBERS': 'Tut mir Leid, du musst für diese Wette eine Zahl angeben',
  'BETNUMBERS_INVALID_NUMBER': 'Tut mir Leid, {0} ist keine gültige Zahl',
  'BETNUMBERS_INVALID_FIRSTNUMBER': 'Tut mir Leid, {0} ist keine gültige Roulette-Wette',
  'BETNUMBERS_INVALID_FIVENUMBERS': 'Tut mir Leid, du kannst nicht auf fünf Zahlen setzen',
  'BETNUMBERS_INVALID_NONADJACENT': 'Tut mir Leid, diese Zahlen liegen auf einem Rouletterad nicht nebeneinander.',
  // From BetRed.js
  'BET_DUPLICATE_ADDED': 'Wird zu deiner bestehenden Wette hinzugefügt und ergibt dann insgesamt ',
  // From Cancel.js
  'EXIT_GAME': '{0} Tschüss.',
  'CANCEL_REPROMPT_NOBET': 'Platziere eine Wette.',
  'CANCEL_REPROMPT_WITHBET': 'Platziere eine Wette oder sag Dreh, um das Rad zu drehen.',
  // From Launch.js
  'LAUNCH_REPROMPT': 'Du kannst zum Wetten zum Beispiel sagen {0}',
  'LAUNCH_WELCOME': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> Willkommen bei Roulettescheibe. ',
  'LAUNCH_WELCOME_BUTTON': 'Wenn du einen Echo Button hast, kannst du das Rad drehen, indem du auf den Button drückst <break time=\"200ms\"/> oder ',
  // From Help.js
  'HELP_REPROMPT': 'Über die Alexa Companion App kannst du erfahren, welche Wetten du platzieren kannst.',
  'HELP_WHEEL_AMERICAN': 'Wir spielen mit einem amerikanischen Rad mit Doppel-Null. ',
  'HELP_WHEEL_EUROPEAN': 'Wir spielen mit einem europäischen Rad mit einfacher Null. ',
  'HELP_SPIN_WITHBETS': 'Sag Dreh das Rad, um zu spielen oder Lies die hohen Punktzahlen vor, um die Rangliste zu hören. ',
  'HELP_SPIN_WITHBETS_REPROMPT': 'Über die Alexa Companion App kannst du erfahren, welche weiteren Wetten du platzieren kannst.',
  'HELP_SPIN_LASTBETS': 'Sag Dreh das Rad, um die gleichen Wetten wie beim letzten Mal zu spielen oder Lies die hohen Punktzahlen vor, um die Rangliste zu hören. ',
  'HELP_SPIN_LASTBETS_REPROMPT': 'Über die Alexa Companion App kannst du erfahren, welche neuen Wetten du platzieren kannst.',
  'HELP_JOIN_TOURNAMENT': 'Beim wöchentlicher Turnier kannst du gegen andere Spieler antreten, um in 100 Drehungen das höchste Guthaben zu erzielen. Sag Ja, um am Turnier teilzunehmen, oder Nein, um das normale Spiel zu spielen.',
  'HELP_JOIN_TOURNAMENT_REPROMPT': 'Sag Ja, um am Turnier teilzunehmen, oder Nein, um das normale Spiel zu spielen.',
  'HELP_CARD_TITLE': 'Roulettescheibe',
  'HELP_CARD_TEXT': 'Du kannst auf einem Rouletterad im Innenbereich oder im Außenbereich wetten und bei jeder Wette {0} setzen. Sag LIES DIE HOHEN PUNKTZAHLEN VOR, um die Rangliste zu hören.\nDas Spiel wird mit einem Rad gespielt, das 18 schwarze Zahlen, 18 rote Zahlen und entweder eine oder zwei Nullen enthält (eine Null und eine Doppel-Null)\nAUSSENWETTEN:\nDie Auszahlungsquote für die folgenden Wetten ist 1 zu 1: Rote Zahlen, schwarze Zahlen, gerade Zahlen (ohne die Nullen), ungerade Zahlen, niedrige Zahlen (1-18) oder hohe Zahlen (19-36).\nDu kannst auch auf Dutzende von Zahlen wetten ("erstes Dutzend" 1-12, "zweites Dutzend" 13-24, "drittes Dutzend" 25-36) oder auf Spalten von Zahlen ("erste Spalte" 1,4,7 usw.), die 2 zu 1 auszahlen.\nINNENWETTEN:Du kannst auf eine einzelne Zahl setzen wetten, einschließlich Null und Doppel-Null, und die Auszahlungsquote ist 35 zu 1. Du kannst auch auf Gruppen von nebeneinander liegenden Zahlen wetten, zum Beispiel 1 und 2 oder 5, 6, 8 und 9. Du kannst auch auf Reihen oder Doppelreihen wetten, indem du drei oder sechs Zahlen nennst, zum Beispiel "wette auf 7, 8 und 9". Die Auszahlungsquote für zwei Zahlen ist 17 zu 1, für drei Zahlen 11 zu 1, für vier Zahlen 8 zu 1 und für sechs Zahlen 5 zu 1.\nWenn du zwischen einer einzigen Null und einer Doppel-Null wechseln möchtest, kannst du "Wechsle das Rad zu einem amerikanischen Rad" oder "Wechsle das Rad zu einem europäischen Rad" sagen. Ein amerikanisches Rad hat zwei Nullen, während ein europäisches Rad den Hausvorteil halbiert, da es nur eine einzige Null gibt. Die höchsten Punktzahlen und die Rangliste werden für jede Art von Rad separat geführt.',
  'HELP_ACHIEVEMENT_POINTS': 'Für jeden Turniergewinn erhältst du 100 Erfolgspunkte <break time=\'200ms\'/> 10 Punkte für jeden Tag, an dem du spielst <break time=\'200ms\'/> und 2 hoch N Punkte für jede Serie, in der die Kugel N-mal hintereinander auf die gleiche Zahl fällt. ',
  'HELP_ACHIEVEMENT_CARD_TEXT': '\nDu verdienst Erfolgspunkte beim Spielen, und damit wird die Punktetabelle festgelegt. Du verdienst Punkte wie folgt:\n - 100 Erfolgspunkte jedes Mal, wenn du das Donnerstagsturnier gewinnst\n - 10 Punkte für jedem Tag, an dem du spielst\n - 2 hoch N Punkte für jede Serie, in der die Kugel N-mal hintereinander auf die gleiche Zahl fällt.\n',
  // From HighScore.js
  'HIGHSCORE_REPROMPT': 'Womit kann ich dir noch helfen?',
  // From Repeat.js
  'REPEAT_BETS': 'Deine Wetten sind bisher {0}.',
  'REPEAT_LAST_BETS': 'Deine letzten Wetten waren {0}. (pause) Sag Wetten, um diese durch eine neue Gruppe von Wetten zu ersetzen, oder Drehen, um diese Wetten wiederzuverwenden.',
  'REPEAT_PLACE_BETS': 'Du hast keine Wetten auf dem Rad.',
  'REPEAT_REPROMPT': 'Womit kann ich dir noch helfen?',
  // From Rules.js
  'RULES_NO_WHEELTYPE': 'Tut mir Leid, du musst angeben, welches Rad du verwenden möchtest, also Doppel-Null oder einfache Null. ',
  'RULES_INVALID_VARIANT': 'Tut mir Leid, ich kann {0} nicht als Regelvariante erkennen. ',
  'RULES_NO_TOURNAMENT': 'Tut mir Leid, du kannst nicht am Turnier teilnehmen – komm doch nächsten Donnerstag vorbei, um mitzumachen! ',
  'RULES_ERROR_REPROMPT': 'Womit kann ich dir noch helfen?',
  'RULES_SET_AMERICAN': 'Stelle das Spiel auf ein amerikanisches Rad mit Doppel-Null ein. ',
  'RULES_SET_EUROPEAN': 'Stelle das Spiel auf ein europäisches Rad mit einfacher Null ein. ',
  'RULES_CLEAR_BETS': '<break time=\"200ms\"/> Alle bisherigen Wetten wurden gelöscht. ',
  'RULES_WHAT_NEXT': '<break time=\"200ms\"/> Du kannst auf einzelne Zahlen, Rot oder Schwarz, Gerade oder Ungerade und auf Zahlengruppen setzen. <break time = "200ms"/> Machen Sie Ihr Spiel!',
  'RULES_REPROMPT': 'Machen Sie Ihr Spiel!',
  // From Spin.js
  'SPIN_NOBETS': 'Tut mir Leid, du musst eine Wette platzieren, bevor du das Rad drehen kannst. Sag zum Beispiel {0}.',
  'SPIN_INVALID_REPROMPT': 'Platziere eine Wette',
  'SPIN_NO_MORE_BETS': 'Nichts geht mehr! <audio src="https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3" />',
  'SPIN_RESULT': 'Die Kugel ist auf {0} gelandet. ',
  'SPIN_REPROMPT': 'Möchtest du noch einmal drehen?',
  'SPIN_BUSTED_REPROMPT': 'Platziere neue Wetten.',
  'SPIN_BANKROLL_TOOSMALL_FORLASTBETS': 'Du hast nicht genug Guthaben, um diese Wetten noch einmal zu platzieren. Deine Wetteinsätze werden gelöscht. ',
  'SPIN_WINNER_BET': 'du hast mit deiner Wette auf {0} gewonnen',
  'SPIN_LOST_BETS': 'Tut mir Leid, deine Wetten haben alle verloren',
  'SPIN_SUMMARY_EVEN': 'Du hast zu gleichen Teilen gewonnen und verloren.',
  'SPIN_DAILY_EARN': 'Du hast zehn Erfolgspunkte für deine erste Drehung des Tages verdient. ',
  'SPIN_STREAK_EARN': 'Du hast diese Zahl {0} Mal hintereinander gedreht und einen Serienbonus von {1} Erfolgspunkten verdient. ',
  // From utils.js
  'ERROR_REPROMPT': 'Womit kann ich dir helfen?',
  'DOUBLE_ZERO': 'Doppel-Null',
  'RED_NUMBER': 'Rot {0}',
  'BLACK_NUMBER': 'Schwarz {0}',
  'LEADER_RANKING': 'Mit deinem aktuellen Erfolgs-Punktestand von {0} bist du <say-as interpret-as="ordinal">{1}</say-as> von {2} Spielern. ',
  'LEADER_NO_SCORES': 'Tut mir Leid, ich kann die aktuelle Rangliste nicht vorlesen',
  'LEADER_TOP_SCORES': 'Die {0} Top-Punktzahlen sind ',
  'LEADER_TOP_BANKROLLS': 'Die {0} Top-Guthaben sind ',
  'LEADER_ACHIEVEMENT_HELP': '<break time=\'300ms\'/> Frage Hilfe an, um zu hören, wie du Erfolgspunkte verdienen kannst',
  'MORE_THAN_PLAYERS': 'über {0}',
  'DISPLAY_TITLE': 'Roulettescheibe',
  // Tournament strings
  'TOURNAMENT_INVALIDACTION_REPROMPT': 'Womit kann ich dir noch helfen?',
  'TOURNAMENT_LAUNCH_WELCOMEBACK': 'Willkommen bei Roulettescheibe. Du spielst gerade in einem aktiven Turnier. Möchtest du fortfahren? ',
  'TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT': 'Möchtest du mit dem Turnier fortfahren?',
  'TOURNAMENT_LAUNCH_INFORM': 'Willkommen bei Roulettescheibe. Es läuft gerade ein Turnier. Möchtest du mitmachen?',
  'TOURNAMENT_LAUNCH_INFORM_REPROMPT': 'Möchtest du beim Turnier mitmachen?',
  'TOURNAMENT_SPINS_REMAINING': 'Du hast noch {0} Drehungen übrig. ',
  'TOURNAMENT_STANDING_FIRST': 'Du bist momentan auf dem <say-as interpret-as="ordinal">1</say-as> Platz. ',
  'TOURNAMENT_WELCOME_BACK': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> Schön, dass du wieder beim Roulette-Turnier dabei bist! Du hast noch {0} Drehungen übrig. ',
  'TOURNAMENT_WELCOME_BUTTON': 'Wenn du einen Echo Button hast, kannst du das Rad drehen, indem du auf den Button drückst. ',
  'TOURNAMENT_WELCOME_REPROMPT': 'Machen Sie Ihr Spiel!',
  'TOURNAMENT_BANKRUPT': 'Du hast dein ganzes Geld verloren und nimmst nicht mehr am Turnier teil. Schön, dass du mitgespielt hast! Schau morgen noch einmal vorbei, um dir die Ergebnisse anzusehen. ',
  'TOURNAMENT_OUTOFSPINS': 'Das war deine letzte Drehung. Schön, dass du mitgespielt hast! Schau morgen noch einmal vorbei, um dir die Ergebnisse anzusehen. ',
  'TOURNAMENT_HELP': 'Du spielst beim Roulettescheibel Turnier mit. ',
  'TOURNAMENT_HELP_CARD_TEXT': 'Du spielst beim Roulettescheibe Turnier mit. Du kannst ein Rad mit Doppel-Null {0} Mal drehen. Derjenige, der am Ende des Turniers das höchste Guthaben hat, gewinnt 100 Erfolgspunkte.\nSag LIES DIE HOHEN PUNKTZAHLEN VOR, um die aktuelle Rangfolge zu hören. Du kannst auf einem Rouletterad im Innenbereich oder im Außenbereich wetten und bei jeder Wette {1} setzen. Das Spiel wird mit einem Rad gespielt, das 18 schwarze Zahlen, 18 rote Zahlen und zwei Nullen enthält\nOUTSIDE BETS:\nDie Auszahlungsquote für die folgenden Wetten ist 1 zu 1: Rote Zahlen, schwarze Zahlen, gerade Zahlen (ohne die Nullen), ungerade Zahlen, niedrige Zahlen (1-18) oder hohe Zahlen (19-36).\nDu kannst auch auf Dutzende von Zahlen wetten ("erstes Dutzend" 1-12, "zweites Dutzend" 13-24, "drittes Dutzend" 25-36) oder auf Spalten von Zahlen ("erste Spalte" 1,4,7 usw.), die 2 zu 1 auszahlen.\nINNENWETTEN:Du kannst auf eine einzelne Zahl setzen wetten, einschließlich Null und Doppel-Null, und die Auszahlungsquote ist 35 zu 1. Du kannst auch auf Gruppen von nebeneinander liegenden Zahlen wetten, zum Beispiel 1 und 2 oder 5, 6, 8 und 9. Du kannst auch auf Reihen oder Doppelreihen wetten, indem du drei oder sechs Zahlen nennst, zum Beispiel "wette auf 7, 8 und 9". Die Auszahlungsquote für zwei Zahlen ist 17 zu 1, für drei Zahlen 11 zu 1, für vier Zahlen 8 zu 1 und für sechs Zahlen 5 zu 1.',
  'TOURNAMENT_REMINDER': 'Schau doch am Donnerstag noch einmal vorbei. Dann findet das wöchentliche Turnier statt. ',
  // Monetary strings
  // Betting
  'BET_EXCEEDS_MAX': 'Tut mir Leid, diese Wette überschreitet den maximalen Wetteinsatz von €{0}.',
  'BET_EXCEEDS_BANKROLL': 'Tut mir Leid, diese Wette überschreitet dein Guthaben von €{0}',
  'BETBLACK_PLACED': '€{0} auf Schwarz gesetzt. <break time=\"200ms\"/> {1}',
  'BETCOLUMN_PLACED': '€{0} auf die <say-as interpret-as="ordinal">{2}</say-as> Spalte gesetzt. <break time=\"200ms\"/> {1}',
  'BETDOZEN_PLACED': '€{0} auf das <say-as interpret-as="ordinal">{2}</say-as> Dutzend gesetzt. <break time=\"200ms\"/>{1}',
  'BETEVEN_PLACED': '€{0} auf gerade Zahlen gesetzt. <break time=\"200ms\"/> {1}',
  'BETHIGH_PLACED': '€{0} auf hohe Zahlen gesetzt. <break time=\"200ms\"/> {1}',
  'BETLOW_PLACED': '€{0} auf niedrige Zahlen gesetzt. <break time=\"200ms\"/> {1}',
  'BETNUMBERS_PLACED': '€{0} auf {1} gesetzt. {2}',
  'BETODD_PLACED': '€{0} auf ungerade Zahlen gesetzt. <break time=\"200ms\"/> {1}',
  'BETRED_PLACED': '€{0} auf Rot gesetzt. <break time=\"200ms\"/> {1}',
  'BET_DUPLICATE_NOT_ADDED': 'Du hast auf diese Wette schon €{0} gesetzt und weitere €{1} würden den maximalen Wetteinsatz von €{2} überschreiten. ',
  // Other
  'CANCEL_REMOVE_BET': 'Dein Wetteinsatz von €{0} auf {1} wird entfernt. ',
  'READ_BANKROLL': 'Du hast €{0}. ',
  'READ_BANKROLL_WITH_ACHIEVEMENT': 'Du hast €{0} und {1} Erfolgspunkte. ',
  'REPEAT_SAY_BET': '€{0} auf {1}',
  'LEADER_TOURNAMENT_RANKING': 'Mit deinem Guthaben von €{0} bist du an <say-as interpret-as="ordinal">{1}</say-as> Stelle unter {2} Spielern im Turnier. ',
  'LEADER_FORMAT': '€{0}',
  'BETRANGE_BETWEEN': 'zwischen €{0} und €{1}',
  'BETRANGE_MORE': '€{0} oder mehr',
  'BETRANGE_LESS': '€{1} oder weniger',
  // Spin.js
  'SPIN_CANTBET_LASTBETS': 'Tut mir Leid, dein Guthaben von €{0} ist nicht ausreichend für die letzte Gruppe von Wetteinsätzen.',
  'SPIN_BUSTED': 'Du hast dein ganzes Geld verloren. Setze auf €1000 und lösche deine Wetteinsätze. ',
  'SPIN_SUMMARY_RESULT': 'Mit {0} hast du noch €{1}. ',
  // Tournament.js
  'TOURNAMENT_BANKROLL': 'Du hast noch €{0} und {1} Drehungen übrig. ',
  'TOURNAMENT_STANDING_TOGO': '<say-as interpret-as="ordinal">1</say-as> Platz hat €{0}. ',
  'TOURNAMENT_WELCOME_NEWPLAYER': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> Willkommen beim Roulette-Turnier! Du startest beim Turnier mit €{0} und hast {1} Drehungen, um so viel Guthaben wie möglich zu verdienen. Am Ende des Turniers erhält das höchste Guthaben 100 Erfolgspunkte. Beachte bitte, dass dieses Turnier nicht dein normales Guthaben verwendet wird, sondern ein separates. ',
  'TOURNAMENT_WINNER': 'Herzlichen Glückwunsch! Du hast mit €{0} das Turnier gewonnen! ',
  'TOURNAMENT_LOSER': 'Leider hast du das Turnier nicht gewonnen. Die höchste Punktzahl war €{0} und du hattest €{1}. ',
};

const spanish = {
  // From Unknown.js
  'UNKNOWNINTENT_TOURNAMENT': 'Lo siento. No entendí. Se realiza un juego de torneo. <break time=\'200ms\'/> Di que sí para participar en el torneo o que no para continuar con el juego normal.',
  'UNKNOWNINTENT_TOURNAMENTT_REPROMPT': 'Trata de decir que sí o que no.',
  'UNKNOWN_INTENT': 'Lo siento. No entendí. Trata de decir {0}.',
  'UNKNOWN_INTENT_REPROMPT': 'Trata de decir {0}.',
  // Betting strings (Bet*.js)
  'BET_INVALID_AMOUNT': 'Lo siento. {0} no es una cantidad que puedas apostar.',
  'BET_INVALID_REPROMPT': '¿Qué más se te ofrece?',
  'BET_PLACED_REPROMPT': 'Haz otra apuesta o di "gira la ruleta" para girarla.',
  'BET_SUGGESTION': 'apuesta al rojo|apuesta al negro|apuesta al {0}|apuesta al {0}|apuesta al {0}|apuesta a la <say-as interpret-as="ordinal">{1}</say-as> docena|apuesta a la <say-as interpret-as="ordinal">{1}</say-as> columna|apuesta a números altos| apuesta a números impares|apuesta a números pares',
  // From BetColumn.js
  'BETCOLUMN_INVALID_COLUMN': 'Lo siento. Especifica si es la primera, la segunda o la tercera columna.',
  'BETCOLUMN_INVALID_COLUMN_VALUE': 'Lo siento. {0} no es una columna válida.',
  // From BetDozen.js
  'BETDOZEN_INVALID_DOZEN': 'Lo siento. Especifica si es la primera, la segunda o la tercera docena.',
  'BETDOZEN_INVALID_DOZEN_VALUE': 'Lo siento. {0} no es una docena válida.',
  // From BetNumbers.js
  'BETNUMBERS_MISSING_NUMBERS': 'Lo siento. Debes decir un número para esta apuesta.',
  'BETNUMBERS_INVALID_NUMBER': 'Lo siento. {0} no es un número válido.',
  'BETNUMBERS_INVALID_FIRSTNUMBER': 'Lo siento. {0} no es una apuesta de ruleta válida.',
  'BETNUMBERS_INVALID_FIVENUMBERS': 'Lo siento. No puedes apostarles a cinco números.',
  'BETNUMBERS_INVALID_NONADJACENT': 'Lo siento. Esos números no son adyacentes en la ruleta.',
  // From BetRed.js
  'BET_DUPLICATE_ADDED': 'Se agrega a tu apuesta existente para un total de ',
  // From Cancel.js
  'EXIT_GAME': '{0} Adiós.',
  'CANCEL_REPROMPT_NOBET': 'Haz una apuesta.',
  'CANCEL_REPROMPT_WITHBET': 'Haz una apuesta o di "gira" para girar la ruleta.',
  // From Help.js
  'HELP_REPROMPT': 'Usa la aplicación de Alexa, la asistente de voz, para conseguir la lista completa de las apuestas que puedes hacer.',
  'HELP_WHEEL_AMERICAN': 'Juegas con una ruleta americana de doble cero. ',
  'HELP_WHEEL_EUROPEAN': 'Juegas con una ruleta europea de un solo cero. ',
  'HELP_SPIN_WITHBETS': 'Di "gira la ruleta" para jugar o di "puntajes altos" para oír el marcador. ',
  'HELP_SPIN_WITHBETS_REPROMPT': 'Usa la aplicación de Alexa, la asistente de voz, para conseguir la lista completa de las apuestas que puedes hacer.',
  'HELP_SPIN_LASTBETS': 'Di "gira la ruleta" para jugar con las mismas apuestas de la última vez o di "puntajes altos" para oír el marcador. ',
  'HELP_SPIN_LASTBETS_REPROMPT': 'Usa la aplicación de Alexa, la asistente de voz, para conseguir la lista completa de las apuestas que puedes hacer.',
  'HELP_JOIN_TOURNAMENT': 'El torneo semanal es una oportunidad para que juegues contra otros jugadores para tratar de conseguir el fondo más grande en 100 giros.',
  'HELP_JOIN_TOURNAMENT_REPROMPT': 'Di que sí para participar en el torneo o que no para jugar de manera normal.',
  'HELP_CARD_TITLE': 'Ruleta',
  'HELP_CARD_TEXT': 'Puedes hacer apuestas exteriores o interiores en la ruleta y poner {0} en cada apuesta. Di "LEE LOS PUNTAJES ALTOS" para oír el marcador. \nSe juega con una ruleta que tiene 18 números negros, 18 números rojos y ya sea uno o dos ceros (un cero y un doble cero). \nAPUESTAS EXTERNAS: \nLas siguientes apuestas pagan 1 a 1: números rojos, números negros, números pares (que excluyen los ceros), números impares, números bajos (1-18) y números altos (19-36). \nTambién puedes apostarles a docenas de números ("primera docena" 1-12, "segunda docena" 13-24, "tercera docena" 25-36) o a columnas de números ("primera columna" 1, 4, 7, etc.) que pagan 2 a 1. \nAPUESTAS INTERNAS: \nPuedes apostarle a un número individual (pleno), al cero o doble cero inclusive, que pagan 35 a 1. O puedes apostarles a grupos de números adyacentes como 1 y 2; o 5, 6, 8 y 9. También puedes apostar en una fila o en una fila doble al mencionar tres o seis números, como "les apuesto al 7, 8 y 9". Apostarles a dos números paga 17 a 1; a tres números, 11 a 1; a cuatro números, 8 a 1; y a seis números, 5 a 1. \nSi quieres cambiar entre una ruleta de un cero y una de doble cero, puedes decir: "Cambia la ruleta a ruleta americana" o: "Cambia la ruleta a europea". Una ruleta americana tiene dos ceros, mientras que la ruleta europea le quita la mitad de la ventaja a la casa al tener un solo cero. Tu puntaje más alto y tu clasificación se mantienen separados entre los dos tipos de ruleta.',
  'HELP_ACHIEVEMENT_POINTS': 'Recibes 100 puntos de logros por cada torneo que ganes, <break time=\'200ms\'/> 10 puntos por cada día que juegues <break time=\'200ms\'/> y 2 a la N potencia por cada racha del mismo número que aparezca N veces seguidas. ',
  'HELP_ACHIEVEMENT_CARD_TEXT': '\nGanas puntos de logros al jugar, que es como se determinan los puntajes más altos en el marcador. Ganas puntos de la siguiente manera: \n100 puntos de logros cada vez que ganas el torneo de los jueves, \n10 puntos por cada día que juegues \ny 2 a la N potencia por cada racha del mismo número que aparezca N veces seguidas.\n',
  // From HighScore.js
  'HIGHSCORE_REPROMPT': '¿Qué más se te ofrece?',
  // Launch.js
  'LAUNCH_REPROMPT': 'Puedes hacer una apuesta como {0}.',
  'LAUNCH_WELCOME': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> Te damos la bienvenida a la Ruleta. ',
  // NOTE: Mexico doesn't support Buttons so OK to not localize this one
  'LAUNCH_WELCOME_BUTTON': 'If you have an Echo Button you can press it to spin the wheel <break time=\"200ms\"/> or ',
  // From Repeat.js
  'REPEAT_BETS': 'Tus apuestas son {0}. ',
  'REPEAT_LAST_BETS': 'Tus últimas apuestas fueron {0}. (pausa) Di "le apuesto a" para reemplazarlas con apuestas nuevas o di "gira" para volver a usarlas.',
  'REPEAT_PLACE_BETS': 'No tienes apuestas en la ruleta.',
  'REPEAT_REPROMPT': '¿Qué más se te ofrece?',
  // Rules.js
  'RULES_NO_WHEELTYPE': 'Lo siento. Tienes que especificar qué tipo de ruleta quieres, como la de doble cero o la de un cero. ',
  'RULES_INVALID_VARIANT': 'Lo siento. No reconozco {0} como una variante de las reglas. ',
  'RULES_NO_TOURNAMENT': 'Lo siento. No puedes participar en el torneo. Vuelve el próximo jueves para jugar en el torneo. ',
  'RULES_ERROR_REPROMPT': '¿Qué más se te ofrece?',
  'RULES_SET_AMERICAN': 'Voy a asignarle al juego una ruleta americana de doble cero. ',
  'RULES_SET_EUROPEAN': 'Voy a asignarle al juego una ruleta europea de un cero. ',
  'RULES_CLEAR_BETS': '<break time=\"200ms\"/> Se borraron todas las apuestas previas. ',
  'RULES_WHAT_NEXT': '<break time=\"200ms\"/> Puedes apostarles a números individuales, a rojo o negro, a par o impar, y a grupos de números. <break time = "200ms"/> ¡Haz tus apuestas!',
  'RULES_REPROMPT': '¡Haz tus apuestas!',
  // Spin.js
  'SPIN_NOBETS': 'Lo siento. Tienes que apostar antes de girar la ruleta.',
  'SPIN_INVALID_REPROMPT': 'Haz una apuesta.',
  'SPIN_NO_MORE_BETS': '¡Se cerraron las apuestas! <audio src="https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3" />',
  'SPIN_RESULT': 'La bola cayó en el {0}. ',
  'SPIN_REPROMPT': '¿Quieres volver a girarla?',
  'SPIN_BUSTED_REPROMPT': 'Haz apuestas nuevas.',
  'SPIN_BANKROLL_TOOSMALL_FORLASTBETS': 'Tu fondo no es suficiente para volver a hacer esas apuestas. Voy a borrar tus apuestas. ',
  'SPIN_WINNER_BET': 'Esta apuesta ganó: {0}.',
  'SPIN_LOST_BETS': 'Lo siento. Todas tus apuestas perdieron.',
  'SPIN_SUMMARY_EVEN': ' Ni ganaste ni perdiste.',
  'SPIN_DAILY_EARN': 'Ganaste 10 puntos de logros por tu primer giro del día. ',
  'SPIN_STREAK_EARN': 'Sacaste ese número {0} veces seguidas y ganaste un bono de racha de {1} puntos de logros. ',
  // From utils.js
  'ERROR_REPROMPT': '¿Qué más se te ofrece?',
  'DOUBLE_ZERO': 'doble cero',
  'RED_NUMBER': '{0} rojo',
  'BLACK_NUMBER': '{0} negro',
  'LEADER_RANKING': 'Tu puntaje de logros de {0} te clasifica como el <say-as interpret-as="ordinal">{1}</say-as> de {2} jugadores. ',
  'LEADER_NO_SCORES': 'Lo siento. No puedo leer el marcador actual.',
  'LEADER_TOP_SCORES': 'Los primeros {0} puntajes de logros son ',
  'LEADER_TOP_BANKROLLS': 'Los primeros {0} fondos son ',
  'LEADER_ACHIEVEMENT_HELP': ' <break time=\'300ms\'/> Pide ayuda para enterarte de cómo se ganan los puntos de logros.',
  'MORE_THAN_PLAYERS': 'más de {0}',
  'DISPLAY_TITLE': 'Ruleta',
  // Tournament strings
  'TOURNAMENT_INVALIDACTION_REPROMPT': '¿Qué más se te ofrece?',
  'TOURNAMENT_LAUNCH_WELCOMEBACK': 'Te damos la bienvenida a la Ruleta. Estás participando en un torneo activo. ¿Quieres continuar? ',
  'TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT': '¿Quieres continuar con el torneo? ',
  'TOURNAMENT_LAUNCH_INFORM': 'Te damos la bienvenida a la Ruleta. Hay un torneo ahora. ¿Quieres participar?',
  'TOURNAMENT_LAUNCH_INFORM_REPROMPT': '¿Quieres participar en el torneo?',
  'TOURNAMENT_SPINS_REMAINING': 'Te quedan {0} giros. ',
  'TOURNAMENT_STANDING_FIRST': 'Estás en el <say-as interpret-as="ordinal">1</say-as> lugar. ',
  'TOURNAMENT_WELCOME_BACK': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> ¡Te damos la bienvenida al torneo de la Ruleta! Te quedan {0} giros.',
  // NOTE: Mexico doesn't support Buttons so OK to not localize this one
  'TOURNAMENT_WELCOME_BUTTON': 'If you have an Echo Button you can press it to spin the wheel. ',
  'TOURNAMENT_WELCOME_REPROMPT': '¡Haz tus apuestas!',
  'TOURNAMENT_BANKRUPT': 'Perdiste todo tu dinero y quedaste fuera del torneo. ¡Gracias por jugar! Vuelve mañana para ver los resultados. ',
  'TOURNAMENT_OUTOFSPINS': 'Ese fue tu último giro. ¡Gracias por jugar! Vuelve mañana para ver los resultados. ',
  'TOURNAMENT_HELP': 'Estás participando en el torneo de la Ruleta. ',
  'TOURNAMENT_HELP_CARD_TEXT': 'Estás participando en el torneo de la Ruleta. Puedes girar hasta {0} veces la ruleta de doble cero. El que tenga el fondo más grande al final del torneo gana 100 puntos de logros. \nDi “LEE LOS PUNTAJES ALTOS” para oír el marcador. Puedes hacer apuestas externas o internas en la ruleta y puedes poner {1} en cada apuesta. \nSe juega con una ruleta que tiene 18 números negros, 18 números rojos y dos ceros. \nAPUESTAS EXTERNAS: \nLas siguientes apuestas pagan 1 a 1: números rojos, números negros, números pares (que excluyen los ceros), números impares, números bajos (1-18) y números altos (19-36). \nTambién puedes apostarles a docenas de números ("primera docena" 1-12, "segunda docena" 13-24, "tercera docena" 25-36) o a columnas de números ("primera columna" 1, 4, 7, etc.) que pagan 2 a 1. \nAPUESTAS INTERNAS: \nPuedes apostarle a un número individual (pleno), al cero o doble cero inclusive, que pagan 35 a 1. O puedes apostarles a grupos de números adyacentes como 1 y 2; o 5, 6, 8 y 9 (cuadro). También puedes apostarle a una fila (calle) o a una fila doble (seisena) al mencionar tres o seis números, como "les apuesto al 7, 8 y 9". Apostarles a dos números paga 17 a 1; a tres números, 11 a 1; a cuatro números, 8 a 1; y a seis números, 5 a 1.',
  'TOURNAMENT_REMINDER': 'Vuelve el jueves al torneo semanal. ',
  // Monetary strings
  // Betting strings
  'BET_EXCEEDS_MAX': 'Lo siento. Esta apuesta excede el máximo de ${0}.',
  'BET_EXCEEDS_BANKROLL': 'Lo siento. Esta apuesta excede tu fondo de ${0}.',
  'BETBLACK_PLACED': '${0} al negro. <break time=\"200ms\"/> {1}',
  'BETCOLUMN_PLACED': '${0} a la <say-as interpret-as="ordinal">{2}</say-as> columna. <break time=\"200ms\"/> {1}',
  'BETDOZEN_PLACED': '${0} a la <say-as interpret-as="ordinal">{2}</say-as> docena. <break time=\"200ms\"/>{1}',
  'BETEVEN_PLACED': '${0} a par. <break time=\"200ms\"/> {1}',
  'BETHIGH_PLACED': '${0} a altos. <break time=\"200ms\"/> {1}',
  'BETLOW_PLACED': '${0} a bajos. <break time=\"200ms\"/> {1}',
  'BETNUMBERS_PLACED': 'Apuesta de ${0} a {1}. {2}',
  'BETODD_PLACED': '${0} a impar. <break time=\"200ms\"/> {1}',
  'BETRED_PLACED': '${0} al rojo. <break time=\"200ms\"/> {1}',
  'BET_DUPLICATE_NOT_ADDED': 'Ya le apostaste ${0} y apostarle ${1} más excedería la apuesta máxima de ${2}. ',
  // Other strings
  'CANCEL_REMOVE_BET': 'Voy a quitar tu apuesta de ${0} a {1}. ',
  'READ_BANKROLL': 'Tienes ${0}. ',
  'READ_BANKROLL_WITH_ACHIEVEMENT': 'Tienes ${0} y {1} puntos de logros. ',
  'REPEAT_SAY_BET': '${0} a {1}',
  'LEADER_TOURNAMENT_RANKING': 'Tu fondo de ${0} te clasifica como el <say-as interpret-as="ordinal">{1}</say-as> de {2} jugadores en el torneo. ',
  'LEADER_FORMAT': '${0}',
  // Spin.js
  'SPIN_CANTBET_LASTBETS': 'Lo siento. Tu fondo de ${0} no puede cubrir tu última serie de apuestas.',
  'SPIN_BUSTED': 'Perdiste todo tu dinero. Pondré $1000 en tu fondo y borraré tus apuestas. ',
  'SPIN_SUMMARY_RESULT': '{0}. Eso te deja con ${1}. ',
  // Tournament strings
  'TOURNAMENT_BANKROLL': 'Tienes ${0} y te quedan {1} giros. ',
  'TOURNAMENT_STANDING_TOGO': 'El <say-as interpret-as="ordinal">1</say-as> lugar tiene ${0}. ',
  'TOURNAMENT_WELCOME_NEWPLAYER': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> ¡Te damos la bienvenida al torneo de la Ruleta! Comienzas el torneo con ${0} y podrás girar la ruleta {1} veces para conseguir el fondo más grande que puedas. Al final del torneo, el fondo más grande recibirá 100 puntos de logros. Ten en cuenta que este torneo es independiente de tu fondo normal. ',
  'TOURNAMENT_WINNER': '¡Felicitaciones, ganaste el torneo con ${0}! ',
  'TOURNAMENT_LOSER': 'Lo siento. No ganaste el torneo. El puntaje más alto fue de ${0} y el tuyo fue de ${0}. ',
  // From this file
  'BETRANGE_BETWEEN': 'entre ${0} y ${1}',
  'BETRANGE_MORE': '${0} o más',
  'BETRANGE_LESS': '${1} o menos',
};

const resources = {
  'en-US': {
    'translation': Object.assign({}, common, dollar),
  },
  'en-GB': {
    'translation': Object.assign({}, common, pound),
  },
  'de-DE': {
    'translation': Object.assign({}, german),
  },
  'es-MX': {
    'translation': Object.assign({}, spanish),
  },
};

const utils = (locale) => {
  let translation;
  if (resources[locale]) {
    translation = resources[locale].translation;
  } else {
    translation = resources['en-US'].translation;
  }

  return {
    strings: translation,
    mapBetType: function(betType, numbers) {
      if (locale === 'de-DE') {
        const betTypeMapping = {'Black': 'Schwarz',
                              'Red': 'Rot',
                              'Even': 'gerade Zahlen',
                              'Odd': 'ungerade Zahlen',
                              'High': 'hohe Zahlen',
                              'Low': 'niedrige Zahlen'};
        if (betTypeMapping[betType]) {
          return betTypeMapping[betType];
        } else if (betType === 'Column') {
          return 'die <say-as interpret-as="ordinal">{0}</say-as> Spalte'.replace('{0}', numbers[0]);
        } else if (betType === 'Dozen') {
          return 'das <say-as interpret-as="ordinal">{0}</say-as> Dutzend'.replace('{0}', (numbers[11] / 12));
        } else if (betType === 'Numbers') {
          return require('./utils').speakNumbers(locale, numbers);
        }
      } else if (locale === 'es-MX') {
        const betTypeMapping = {'Black': 'negro',
                              'Red': 'rojo',
                              'Even': 'números pares',
                              'Odd': 'números impares',
                              'High': 'números altos',
                              'Low': 'números bajos'};
        if (betTypeMapping[betType]) {
          return betTypeMapping[betType];
        } else if (betType === 'Column') {
          return 'en la <say-as interpret-as="ordinal">{0}</say-as> columna'.replace('{0}', numbers[0]);
        } else if (betType === 'Dozen') {
          return 'en la <say-as interpret-as="ordinal">{0}</say-as> docena'.replace('{0}', (numbers[11] / 12));
        } else if (betType === 'Numbers') {
          return require('./utils').speakNumbers(locale, numbers);
        }
      } else {
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
          return require('./utils').speakNumbers(locale, numbers);
        }
      }
      // No match
      return betType;
    },
    mapWheelType: function(wheel) {
      const wheelMapping = {'DOUBLE ZERO': 'american', 'SINGLE ZERO': 'european', 'DOUBLE 0': 'american',
        'SINGLE 0': 'european', 'AMERICAN': 'american', 'AMERICAN WHEEL': 'american', 'EUROPEAN': 'european',
        'EUROPEAN WHEEL': 'european', 'DOUBLE ZERO WHEEL': 'american', 'SINGLE ZERO WHEEL': 'european',
        'DOUBLE 0 WHEEL': 'american', 'SINGLE 0 WHEEL': 'european', 'ONE ZERO': 'european',
        'TWO ZERO': 'american', 'TWO ZEROES': 'american', 'ONE ZERO WHEEL': 'european',
        'TWO ZERO WHEEL': 'american', 'TWO ZEROES WHEEL': 'american', 'TOURNAMENT GAME': 'tournament',
        'TOURNAMENT': 'tournament', 'TOURNAMENT WHEEL': 'tournament',
      };
      const germanWheelMapping = {
        'DOPPEL-NULL': 'american', 'EINFACHE NULL': 'european', 'AMERIKANISCH': 'american', 'EUROPÄISCH': 'european',
        'TURNIER': 'tournament', 'TURNIERRAD': 'tournament', 'TURNIERSPIEL': 'tournament', 'AMERIKANISCHES RAD': 'american',
        'EUROPÄISCHES RAD': 'european', 'DOPPEL-NULL-RAD': 'american', 'RAD MIT EINFACHER NULL': 'european', 'EINE NULL': 'european',
        'RAD MIT EINER NULL': 'european', 'ZWEI NULLEN': 'american', 'RAD MIT ZWEI NULLEN': 'american',
        'DOPPELTE NULL': 'american', 'EINZELNE NULL': 'european', 'TURNIERKESSEL': 'tournament', 'AMERIKANISCHER KESSEL': 'american',
        'EUROPÄISCHER KESSEL': 'european', 'KESSEL MIT DOPPELTER NULL': 'american', 'KESSEL MIT EINZELNER NULL': 'european', 'KESSEL MIT EINER NULL': 'european',
        'ZWEIMAL NULL': 'american', 'KESSEL MIT ZWEI NULLEN': 'american', 'ZWEI-NULLEN-KESSEL': 'american',
      };
      const spanishWheelMapping = {
        'DOBLE CERO': 'american', 'UN CERO': 'european', 'UN SOLO CERO': 'european', 'AMERICANA': 'american',
        'EUROPEA': 'european', 'TORNEO': 'tournament', 'RUEDA DE TORNEO': 'tournament', 'JUEGO DE TORNEO': 'tournament',
        'RUEDA AMERICANA': 'american', 'RULETA AMERICANA': 'american', 'RUEDA EUROPEA': 'european', 'RULETA EUROPEA': 'european',
        'RUEDA CON DOBLE CERO': 'american', 'RULETA DE DOBLE CERO': 'american', 'RUEDA CON UN SOLO CERO': 'european', 'RULETA DE UN CERO': 'european',
        'RUEDA CON UN SOLO CERO': 'european', 'DOS CEROS': 'american', 'RUEDA CON DOS CEROS': 'american', 'RULETA DE DOS CEROS': 'american',
      };

      if (locale === 'de-DE') {
        return getBestMatch(germanWheelMapping, wheel.toUpperCase());
      } else if (locale === 'es-MX') {
        return getBestMatch(spanishWheelMapping, wheel.toUpperCase());
      } else {
        return getBestMatch(wheelMapping, wheel.toUpperCase());
      }
    },
    mapNumber: function(value) {
      const numberMapping = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8,
        'nine': 9, 'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
        'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'twenty one': 21, 'twenty two': 22, 'twenty three': 23, 'twenty four': 24,
        'twenty five': 25, 'twenty six': 26, 'twenty seven': 27, 'twenty eight': 28, 'twenty nine': 29, 'thirty': 30,
        'thrity one': 31, 'thirty two': 32, 'thirty three': 33, 'thirty four': 34, 'thirty five': 35, 'thirty six': 36,
      };

      const germanNumberMapping = {
        'eins': 1, 'zwei': 2, 'drei': 3, 'vier': 4, 'fünf': 5, 'sechs': 6, 'sieben': 7, 'acht': 8,
        'neun': 9, 'zehn': 10, 'elf': 11, 'zwölf': 12, 'dreizehn': 13, 'vierzehn': 14,
        'fünfzehn': 15, 'sechzehn': 16, 'siebzehn': 17, 'achtzehn': 18, 'neunzehn': 19, 'zwanzig': 20,
        'einundzwanzig': 21, 'zweiundzwanzig': 22, 'dreiundzwanzig': 23, 'vierundzwanzig': 24,
        'fünfundzwanzig': 25, 'sechsundzwanzig': 26, 'siebenundzwanzig': 27, 'achtundzwanzig': 28,
        'neunundzwanzig': 29, 'dreißig': 30, 'einunddreißig': 31, 'zweiunddreißig': 32,
        'dreiunddreißig': 33, 'vierunddreißig': 34, 'fünfunddreißig': 35, 'sechsunddreißig': 36,
      };

      const spanishNumberMapping = {
        'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8,
        'nueve': 9, 'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciséis': 16,
        'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
        'veintiuno': 21, 'veintidos': 22, 'veintitres': 23, 'veinticuatro': 24,
        'veinticinco': 25, 'veintiseis': 26, 'veintisiete': 27, 'veintiocho': 28,
        'veintinueve': 29, 'treinta': 30, 'treintiuno': 31, 'treintidos': 32,
        'treintitres': 33, 'treinticuatro': 34, 'treinticinco': 35, 'treintiseis': 36,
      };

      if (locale === 'de-DE') {
        return getBestMatch(germanNumberMapping, value.toLowerCase());
      } else if (locale === 'es-MX') {
        return getBestMatch(spanishNumberMapping, value.toLowerCase());
      } else {
        return getBestMatch(numberMapping, value.toLowerCase());
      }
    },
    mapZero: function(value) {
      const zeroMapping = {'DOUBLE ZERO': -1, 'SINGLE ZERO': 0, 'DOUBLE 0': -1, 'SINGLE 0': 0};
      const germanZeroMapping = {'DOPPEL-NULL': 0, 'NULL': 0, 'EINZELNE NULL': 0, 'DOPPELTE NULL': -1, 'ZWEI NULLEN': -1};
      const spanishZeroMapping = {'DOBLE CERO': -1, 'UN CERO': 0, 'UN SOLO CERO': 0, 'CERO': 0};

      if (locale === 'de-DE') {
        return getBestMatch(germanZeroMapping, value.toUpperCase());
      } else if (locale === 'es-MX') {
        return getBestMatch(spanishZeroMapping, value.toUpperCase());
      } else {
        return getBestMatch(zeroMapping, value.toUpperCase());
      }
    },
    betRange: function(hand) {
      let format;

      if (hand.minBet && hand.maxBet) {
        format = translation['BETRANGE_BETWEEN'];
      } else if (hand.minBet) {
        format = translation['BETRANGE_MORE'];
      } else if (hand.maxBet) {
        format = translation['BETRANGE_LESS'];
      } else {
        format = 'any amount';
      }

      return (format.replace('{0}', hand.minBet).replace('{1}', hand.maxBet));
    },
    valueFromOrdinal: function(ord) {
      const ordinalMapping = {'first': 1, '1st': 1, 'second': 2, '2nd': 2, 'third': 3, '3rd': 3};
      const germanOrdinalMapping = {'erste': 1, 'zweite': 2, 'dritte': 3};
      const spanishOrdinalMapping = {
        'primera': 1, 'primero': 1, 'primer': 1, 'segunda': 2, 'segundo': 2,
        'tercera': 3, 'tercero': 3, 'tercer': 3,
      };
      const lowerOrd = ord.toLowerCase();
      const value = (locale === 'de-DE') ? germanOrdinalMapping[lowerOrd] :
        ((locale === 'es-MX') ? spanishOrdinalMapping[lowerOrd] : ordinalMapping[lowerOrd]);

      if (value) {
        return value;
      } else if (parseInt(ord) && (parseInt(ord) < 4)) {
        return parseInt(ord);
      } else if (ord.indexOf('1') > -1) {
        return 1;
      } else if (ord.indexOf('2') > -1) {
        return 2;
      } else if (ord.indexOf('3') > -1) {
        return 3;
      }

      // Not a valid value
      return 0;
    },
    getBetSuggestion: function(handlerInput) {
      const event = handlerInput.requestEnvelope;
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      let value1;
      let value2;
      let value3;

      const options = translation['BET_SUGGESTION'].split('|');
      let seed = event.session.user.userId;
      if (attributes.currentHand && attributes[attributes.currentHand]
        && attributes[attributes.currentHand].timestamp) {
        seed += attributes[attributes.currentHand].timestamp;
      }

      value1 = Math.floor(seedrandom(seed)() * options.length);
      if (value1 === options.length) {
        value1--;
      }
      value2 = Math.floor(seedrandom('1' + seed)() * 36);
      if (value2 === 36) {
        value2--;
      }
      value3 = Math.floor(seedrandom('2' + seed)() * 3);
      if (value3 === 3) {
        value3--;
      }
      value3++;
      return options[value1].replace('{0}', value2).replace('{1}', value3);
    },
  };
};

module.exports = utils;

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
  return ((bestMapping && (bestRatio > 60)) ? mapping[bestMapping] : undefined);
}