//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  emitResponse: function(emit, locale, error, response, speech, reprompt) {
    if (error) {
      const res = require('./' + locale + '/resources');
      console.log('Speech error: ' + error);
      emit(':ask', error, res.ERROR_REPROMPT);
    } else if (response) {
      emit(':tell', response);
    } else {
      emit(':ask', speech, reprompt);
    }
  },
  number: function(locale, value, doubleZeroWheel) {
    let result = parseInt(value);
    const res = require('./' + locale + '/resources');

    // First, is it an integer already?
    if (!isNaN(result)) {
      if ((result >= 0) && (result <= 36)) {
        // valid - return it
        return result;
      }
    } else {
      // Has to be "double zero" or "single zero"
      result = res.mapZero(value);
      if (result) {
        // Double zero (-1) is only valid if this is a double zero wheel
        if (doubleZeroWheel || (result == 0)) {
          return result;
        }
      }
    }

    // Nope, not a valid value
    return undefined;
  },
  betAmount: function(intent, hand) {
    let amount = 1;

    if (intent.slots.Amount && intent.slots.Amount.value) {
      // If the bet amount isn't an integer, we'll use the default value (1 unit)
      const val = parseInt(intent.slots.Amount.value);
      if (!isNaN(val)) {
        amount = val;
      }
    } else {
      // Check if they have a previous bet amount and reuse that
      if (hand.bets && (hand.bets.length > 0)) {
        amount = hand.bets[0].amount;
      } else if (hand.lastbets && (hand.lastbets.length > 0)) {
        amount = hand.lastbets[0].amount;
      }
    }

    return amount;
  },
  speakNumbers: function(locale, numbers, sayColor) {
    const colors = numbers.map((x) => slotName(locale, x, sayColor));

    return speechUtils.and(colors, {locale: locale});
  },
  readBankroll: function(locale, attributes) {
    const res = require('./' + locale + '/resources');
    const hand = attributes[attributes.currentHand];
    let text;

    if (attributes.trophy) {
      if (attributes.trophy > 1) {
        text = res.strings.READ_BANKROLL_WITH_TROPHIES.replace('{0}', hand.bankroll).replace('{1}', attributes.trophy);
      } else {
        text = res.strings.READ_BANKROLL_WITH_TROPHY.replace('{0}', hand.bankroll);
      }
    } else {
      text = res.strings.READ_BANKROLL.replace('{0}', hand.bankroll);
    }

    return text;
  },
  getRankings(scoreSet, high, callback) {
    getRankFromS3(scoreSet, high, callback);
  },
  readRank: function(locale, hand, verbose, callback) {
    const res = require('./' + locale + '/resources');

    getRankFromS3((hand.doubleZeroWheel) ? 'americanScores' : 'europeanScores',
          hand.high, (err, rank) => {
      // Let them know their current rank
      let speech = '';
      let format;

      if (rank) {
        let togo = '';

        if (rank.delta > 0) {
          togo = res.strings.RANK_TOGO.replace('{0}', rank.delta).replace('{1}', rank.rank - 1);
        }

        if (verbose) {
          // If they haven't played, just tell them the number of players
          if (hand.spins > 0) {
            format = (hand.doubleZeroWheel)
                ? res.strings.RANK_AMERICAN_VERBOSE
                : res.strings.RANK_EUROPEAN_VERBOSE;
            speech += format.replace('{0}', hand.high).replace('{1}', rank.rank).replace('{2}', rank.players);
            speech += togo;
          } else {
            format = (hand.doubleZeroWheel)
                ? res.strings.RANK_AMERICAN_NUMPLAYERS
                : res.strings.RANK_EUROPEAN_NUMPLAYERS;
            speech += res.strings.RANK_AMERICAN_NUMPLAYERS.replace('{0}', rank.players);
          }
        } else {
          if (hand.spins > 0) {
            speech += res.strings.RANK_NONVERBOSE.replace('{0}', rank.rank).replace('{1}', rank.players);
            speech += togo;
          }
        }
      }

      callback(err, speech);
    });
  },
  readLeaderBoard: function(locale, attributes, callback) {
    const res = require('./' + locale + '/resources');
    const hand = attributes[attributes.currentHand];
    const myScore = (attributes.currentHand === 'tournament') ? hand.bankroll : hand.high;

    getTopScoresFromS3(attributes.currentHand + 'Scores', (err, scores) => {
      let speech;

      // OK, read up to five high scores
      if (!scores || (scores.length === 0)) {
        // No scores to read
        speech = res.strings.LEADER_NO_SCORES;
      } else {
        // If their current high score isn't in the list, add it
        if (scores.indexOf(myScore) < 0) {
          scores.push(myScore);
          scores.sort((a, b) => (b - a));
        }

        let format;
        if (attributes.currentHand === 'tournament') {
          format = res.strings.LEADER_TOURNAMENT_TOP_SCORES;
        } else {
          format = (hand.doubleZeroWheel)
              ? res.strings.LEADER_AMERICAN_LEADER_TOP_SCORES
              : res.strings.LEADER_EUROPLEAN_LEADER_TOP_SCORES;
        }

        const toRead = (scores.length > 5) ? 5 : scores.length;
        const topScores = scores.slice(0, toRead).map((x) => res.strings.LEADER_FORMAT.replace('{0}', x));
        speech = format.replace('{0}', toRead);
        speech += speechUtils.and(topScores, {locale: locale, pause: '300ms'});
      }

      callback(speech);
    });
  },
  // We changed the structure of attributes - this updates legacy saved games
  migrateAttributes: function(attributes, locale) {
    if (!attributes['american']) {
      attributes['american'] = {minBet: 1, maxBet: 500, doubleZeroWheel: true, canReset: true, timestamp: Date.now()};

      if (attributes.highScore === undefined) {
        attributes['american'].bankroll = 1000;
        attributes['american'].spins = 0;
        attributes['american'].high = 1000;
      } else {
        attributes['american'].bankroll = attributes.highScore.currentAmerican;
        attributes['american'].spins = attributes.highScore.spinsAmerican;
        attributes['american'].high = attributes.highScore.highAmerican;
      }
    } else {
      // Possible this was migrated before min and max were added
      attributes['american'].minBet = 1;
      attributes['american'].maxBet = 500;
    }

    if (!attributes['european']) {
      attributes['european'] = {minBet: 1, maxBet: 500, doubleZeroWheel: false, canReset: true, timestamp: Date.now()};

      if (attributes.highScore === undefined) {
        attributes['european'].bankroll = 1000;
        attributes['european'].spins = 0;
        attributes['european'].high = 1000;
      } else {
        attributes['european'].bankroll = attributes.highScore.currentEuropean;
        attributes['european'].spins = attributes.highScore.spinsEuropean;
        attributes['european'].high = attributes.highScore.highEuropean;
      }
    } else {
        // Possible this was migrated before min and max were added
        attributes['european'].minBet = 1;
        attributes['european'].maxBet = 500;
      }

    // Save the bets and lastbets
    if (attributes.bets) {
      if (attributes.doubleZeroWheel) {
        // American bets
        attributes.currentHand = 'american';
        attributes['american'].bets = attributes.bets;
        attributes['american'].lastbets = attributes.lastbets;
      } else if (attributes.doubleZeroWheel !== undefined) {
        // European bets
        attributes.currentHand = 'european';
        attributes['european'].bets = attributes.bets;
        attributes['european'].lastbets = attributes.lastbets;
      }
    }

    if (attributes.currentHand === undefined) {
      // Default based on locale
      attributes.currentHand = (locale == 'en-US') ? 'american' : 'european';
    }

    // Clear out the old stuff
    attributes.bankroll = undefined;
    attributes.bets = undefined;
    attributes.lastbets = undefined;
    attributes.doubleZeroWheel = undefined;
    attributes.highScore = undefined;
  },
};

//
// Internal functions
//
function slotName(locale, num, sayColor) {
  let result;
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
  const res = require('./' + locale + '/resources');

  result = (num === -1) ? res.strings.DOUBLE_ZERO : num.toString();
  if ((num > 0) && sayColor) {
    if (blackNumbers.indexOf(num) > -1) {
      result = res.strings.BLACK_NUMBER.replace('{0}', result);
    } else {
      result = res.strings.RED_NUMBER.replace('{0}', result);
    }
  }

  return result;
}

function getRankFromS3(scoreSet, high, callback) {
  let higher;

  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, null);
    } else {
      // Yeah, I can do a binary search (this is sorted), but straight search for now
      const ranking = JSON.parse(data.Body.toString('ascii'));
      const scores = ranking[scoreSet];

      if (scores) {
        for (higher = 0; higher < scores.length; higher++) {
          if (scores[higher] <= high) {
            break;
          }
        }

        // Also let them know how much it takes to move up a position
        callback(null, {rank: (higher + 1), high: (scores ? scores[0] : 0),
            delta: (higher > 0) ? (scores[higher - 1] - high) : 0,
            players: scores.length});
      } else {
        console.log('No scoreset for ' + scoreSet);
        callback('No scoreset', null);
      }
    }
  });
}

function getTopScoresFromS3(scoreSet, callback) {
  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, null);
    } else {
      // Yeah, I can do a binary search (this is sorted), but straight search for now
      const ranking = JSON.parse(data.Body.toString('ascii'));
      const scores = ranking[scoreSet];

      callback(null, scores.sort((a, b) => (b - a)));
    }
  });
}
