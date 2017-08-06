//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const speechUtils = require('alexa-speech-utils')();
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

// Global session ID
let globalEvent;

module.exports = {
  emitResponse: function(emit, locale, error, response, speech, reprompt, cardTitle, cardText) {
    // Save to S3 if environment variable is set
    if (process.env.SAVELOG) {
      const result = (error) ? error : ((response) ? response : speech);
      const params = {Body: JSON.stringify({event: globalEvent, response: result}),
        Bucket: 'garrett-alexa-usage',
        Key: 'logs/roulette/' + Date.now() + '.txt'};
      s3.putObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        }
        emitResult();
      });
    } else {
      emitResult();
    }

    function emitResult() {
      if (!process.env.NOLOG) {
        console.log(JSON.stringify(globalEvent));
      }

      if (error) {
        const res = require('./' + locale + '/resources');
        console.log('Speech error: ' + error);
        emit(':ask', error, res.ERROR_REPROMPT);
      } else if (response) {
        emit(':tell', response);
      } else if (cardTitle) {
        emit(':askWithCard', speech, reprompt, cardTitle, cardText);
      } else {
        emit(':ask', speech, reprompt);
      }
    }
  },
  setEvent: function(event) {
    globalEvent = event;
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
  betsMatch: function(bet1, bet2) {
    // Bets match if all numbers are the same
    // OK if they are different amounts
    let match = (bet1.numbers.length === bet2.numbers.length);

    if (match) {
      let i;

      for (i = 0; i < bet1.numbers.length; i++) {
        if (bet1.numbers[i] !== bet2.numbers[i]) {
          // No match
          match = false;
          break;
        }
      }
    }

    return match;
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
  getHighScore(attributes, currentHand, callback) {
    const hand = attributes[currentHand];

    getTopScoresFromS3(currentHand + 'Scores', hand.bankroll, (err, scores) => {
      callback(err, (scores) ? scores[0] : undefined);
    });
  },
  readLeaderBoard: function(locale, attributes, callback) {
    const res = require('./' + locale + '/resources');
    const hand = attributes[attributes.currentHand];

    getTopScoresFromS3(attributes.currentHand + 'Scores', hand.bankroll, (err, scores) => {
      let speech = '';
      let format;

      // OK, read up to five high scores
      if (!scores || (scores.length === 0)) {
        // No scores to read
        speech = res.strings.LEADER_NO_SCORES;
      } else {
        // What is your ranking - assuming you've done a spin
        if (hand.spins > 0) {
          const ranking = scores.indexOf(hand.bankroll) + 1;

          if (attributes.currentHand === 'tournament') {
            format = res.strings.LEADER_TOURNAMENT_RANKING;
          } else {
            format = (hand.doubleZeroWheel)
                ? res.strings.LEADER_AMERICAN_RANKING
                : res.strings.LEADER_EUROPEAN_RANKING;
          }

          speech += format.replace('{0}', hand.bankroll).replace('{1}', ranking).replace('{2}', scores.length);
        }

        // And what is the leader board?
        const toRead = (scores.length > 5) ? 5 : scores.length;
        const topScores = scores.slice(0, toRead).map((x) => res.strings.LEADER_FORMAT.replace('{0}', x));
        speech += res.strings.LEADER_TOP_SCORES.replace('{0}', toRead);
        speech += speechUtils.and(topScores, {locale: locale, pause: '300ms'});
      }

      callback(speech);
    });
  },
  // We changed the structure of attributes - this updates legacy saved games
  migrateAttributes: function(attributes, locale) {
    if (!attributes['american']) {
      attributes['american'] = {minBet: 1, doubleZeroWheel: true, canReset: true, timestamp: Date.now()};

      if (attributes.highScore === undefined) {
        // Brand new player - let's log this in our DB (async call)
        const params = {
                  TableName: 'RouletteWheel',
                  Key: {userId: {S: 'game'}},
                  AttributeUpdates: {newUsers: {
                      Action: 'ADD',
                      Value: {N: '1'}},
                  }};

        dynamodb.updateItem(params, (err, data) => {
          if (err) {
            console.log(err);
          }
        });

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
      attributes['american'].maxBet = undefined;
    }

    if (!attributes['european']) {
      attributes['european'] = {minBet: 1, doubleZeroWheel: false, canReset: true, timestamp: Date.now()};

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
        attributes['european'].maxBet = undefined;
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
  shouldOfferSurvey: function(attributes) {
    // Survey should be offered to those who first played before July 1
    // But not while they are in a tournament!
    if (!attributes.survey && (attributes.currentHand !== 'tournament')) {
      let oldestAd;
      const cutoff = new Date('July 1, 2017');
      let ad;

      for (ad in attributes.adsPlayed) {
        if (attributes.adsPlayed[ad] &&
          (!oldestAd || (attributes.adsPlayed[ad] < oldestAd))) {
          oldestAd = attributes.adsPlayed[ad];
        }
      }

      console.log((new Date(oldestAd)).toString());
      if (oldestAd && (oldestAd < cutoff)) {
        return true;
      }
    }

    return false;
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

function getTopScoresFromS3(scoreSet, myScore, callback) {
  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, null);
    } else {
      // Yeah, I can do a binary search (this is sorted), but straight search for now
      const ranking = JSON.parse(data.Body.toString('ascii'));
      const scores = ranking[scoreSet];

      // If their current high score isn't in the list, add it
      if (scores.indexOf(myScore) < 0) {
        scores.push(myScore);
      }

      callback(null, scores.sort((a, b) => (b - a)));
    }
  });
}
