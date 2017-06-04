//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
  emitResponse: function(emit, error, response, speech, reprompt) {
    if (error) {
      console.log('Speech error: ' + error);
      emit(':ask', error, 'What else can I help you with?');
    } else if (response) {
      emit(':tell', response);
    } else {
      emit(':ask', speech, reprompt);
    }
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
    } else if (parseInt(ord)) {
      return parseInt(ord);
    }

    // Not a valid value
    return 0;
  },
  ssmlToSpeech: function(ssml) {
    // Just removes the <speak> tags and any pause or audio tags
    // Since that's all we use with SSML
    let speech;

    speech = ssml.replace('<speak>', '');
    speech = speech.replace('</speak>', '');
    speech = extractTag(speech, 'break');
    speech = extractTag(speech, 'audio');

    return speech;
  },
  number: function(value, doubleZeroWheel) {
    let result = parseInt(value);

    // First, is it an integer already?
    if (!isNaN(result)) {
      if ((result >= 0) && (result <= 36)) {
        // valid - return it
        return result;
      }
    } else {
      // Has to be "double zero" or "single zero"
      const zeroMapping = {'DOUBLE ZERO': -1, 'SINGLE ZERO': 0, 'DOUBLE 0': -1, 'SINGLE 0': 0};

      result = zeroMapping[value.toUpperCase()];
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
  speakNumbers: function(numbers, sayColor) {
    let numString = '';
    let i;
    const len = numbers.length;

    for (i = 0; i < len; i++) {
      numString += (slotName(numbers[i], sayColor));
      if (i < len - 1) {
        numString += (i == (len - 2)) ? ((len == 2) ? ' and ' : ', and ') : ', ';
      }
    }
    return numString;
  },
  speakBet: function(amount, betPlaced, reprompt) {
    let ssml;

    ssml = amount + ' unit';
    if (amount > 1) {
      ssml += 's';
    }
    ssml += (' ' + betPlaced);
    ssml += ' <break time="200ms"/> ';
    ssml += reprompt;
    ssml;

    return ssml;
  },
  readRank: function(attributes, callback) {
    getRankFromS3(attributes.highScore, (err, rank) => {
      // Let them know their current rank
      let speech = '';

      if (rank) {
        // If they haven't played, just tell them the number of players
        if (attributes.doubleZeroWheel) {
          if (attributes.highScore.spinsAmerican > 0) {
            speech += 'On a double zero American wheel, your high score of ';
            speech += (attributes.highScore.highAmerican + ' units ');
            speech += ('ranks <say-as interpret-as="ordinal">' + rank.americanRank + '</say-as> of ' + rank.americanPlayers + ' players. ');
          } else {
            speech += 'There are ' + rank.americanPlayers + ' players on a double zero American wheel. ';
          }
        } else {
          if (attributes.highScore.spinsEuropean > 0) {
            speech += 'On a single zero European wheel, your high score of ';
            speech += (attributes.highScore.highEuropean + ' units ');
            speech += ('ranks <say-as interpret-as="ordinal">' + rank.europeanRank + '</say-as> of ' + rank.europeanPlayers + ' players. ');
          } else {
            speech += 'There are ' + rank.europeanPlayers + ' players on a single zero European wheel. ';
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
function slotName(num, sayColor) {
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
}

function extractTag(ssml, tag) {
  let iStart;
  let iEnd;
  let speech = ssml;

  iStart = speech.indexOf('<' + tag);
  while (iStart > -1) {
    // Look for closing />
    iEnd = speech.indexOf('/>', iStart);
    speech = speech.substring(0, iStart) + speech.substring(iEnd + 2);
    iStart = speech.indexOf('<' + tag);
  }

  return speech;
}

function getRankFromS3(highScore, callback) {
  let higherAmerican;
  let higherEuropean;

  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'roulette-scores', Key: 'scoreData.txt'}, (err, data) => {
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

      callback(null, {americanRank: (higherAmerican + 1),
          americanPlayers: scores.americanScores.length,
          europeanRank: (higherEuropean + 1),
          europeanPlayers: scores.europeanScores.length});
    }
  });
}
