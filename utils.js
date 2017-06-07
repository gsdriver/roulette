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
  betAmount: function(intent, attributes) {
    let amount = 1;

    if (intent.slots.Amount && intent.slots.Amount.value) {
      // If the bet amount isn't an integer, we'll use the default value (1 unit)
      const val = parseInt(intent.slots.Amount.value);
      if (!isNaN(val)) {
        amount = val;
      }
    } else {
      // Check if they have a previous bet amount and reuse that
      if (attributes.bets && (attributes.bets.length > 0)) {
        amount = attributes.bets[0].amount;
      } else if (attributes.lastbets && (attributes.lastbets.length > 0)) {
        amount = attributes.lastbets[0].amount;
      }
    }

    // Better make sure they have this much - if they don't return -1
    if (amount > attributes.bankroll) {
      amount = -1;
    } else {
      attributes.bankroll -= amount;
    }

    return amount;
  },
  speakNumbers: function(locale, numbers, sayColor) {
    const colors = numbers.map((x) => slotName(locale, x, sayColor));

    return speechUtils.and(colors, {locale: locale});
  },
  readRank: function(locale, attributes, verbose, callback) {
    const res = require('./' + locale + '/resources');

    getRankFromS3(attributes.highScore, (err, rank) => {
      // Let them know their current rank
      let speech = '';

      if (rank) {
        let togo = '';

        if (attributes.doubleZeroWheel && (rank.americanDelta > 0)) {
          togo = res.strings.RANK_TOGO.replace('{0}', rank.americanDelta).replace('{1}', rank.americanRank - 1);
        } else if (!attributes.doubleZeroWheel && (rank.europeanDelta > 0)) {
          togo = res.strings.RANK_TOGO.replace('{0}', rank.europeanDelta).replace('{1}', rank.europeanRank - 1);
        }

        if (verbose) {
          // If they haven't played, just tell them the number of players
          if (attributes.doubleZeroWheel) {
            if (attributes.highScore.spinsAmerican > 0) {
              speech += res.strings.RANK_AMERICAN_VERBOSE.replace('{0}', attributes.highScore.highAmerican).replace('{1}', rank.americanRank).replace('{2}', rank.americanPlayers);
              speech += togo;
            } else {
              speech += res.strings.RANK_AMERICAN_NUMPLAYERS.replace('{0}', rank.americanPlayers);
            }
          } else {
            if (attributes.highScore.spinsEuropean > 0) {
              speech += res.strings.RANK_EUROPEAN_VERBOSE.replace('{0}', attributes.highScore.highEuropean).replace('{1}', rank.europeanRank).replace('{2}', rank.europeanPlayers);
              speech += togo;
            } else {
              speech += res.strings.RANK_EUROPEAN_NUMPLAYERS.replace('{0}', rank.europeanPlayers);
            }
          }
        } else {
          if (attributes.doubleZeroWheel) {
            if (attributes.highScore.spinsAmerican > 0) {
              speech += res.strings.RANK_NONVERBOSE.replace('{0}', rank.americanRank).replace('{1}', rank.americanPlayers);
              speech += togo;
            }
          } else {
            if (attributes.highScore.spinsEuropean > 0) {
              speech += res.strings.RANK_NONVERBOSE.replace('{0}', rank.europeanRank).replace('{1}', rank.europeanPlayers);
              speech += togo;
            }
          }
        }
      }

      callback(err, speech);
    });
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

function getRankFromS3(highScore, callback) {
  let higherAmerican;
  let higherEuropean;

  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, null);
    } else {
      // Yeah, I can do a binary search (this is sorted), but straight search for now
      const scores = JSON.parse(data.Body.toString('ascii'));

      for (higherAmerican = 0; higherAmerican < scores.americanScores.length; higherAmerican++) {
        if (scores.americanScores[higherAmerican] <= highScore.highAmerican) {
          break;
        }
      }
      for (higherEuropean = 0; higherEuropean < scores.europeanScores.length; higherEuropean++) {
        if (scores.europeanScores[higherEuropean] <= highScore.highEuropean) {
          break;
        }
      }

      // Also let them know how much it takes to move up a position
      callback(null, {americanRank: (higherAmerican + 1),
          americanDelta: (higherAmerican > 0) ?
            (scores.americanScores[higherAmerican - 1] - highScore.highAmerican) : 0,
          americanPlayers: scores.americanScores.length,
          europeanDelta: (higherEuropean > 0) ?
            (scores.europeanScores[higherEuropean - 1] - highScore.highEuropean) : 0,
          europeanRank: (higherEuropean + 1),
          europeanPlayers: scores.europeanScores.length});
    }
  });
}
