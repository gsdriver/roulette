//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const speechUtils = require('alexa-speech-utils')();
const request = require('request');

// Global session ID
let globalEvent;

module.exports = {
  emitResponse: function(emit, locale, error, response, speech, reprompt, cardTitle, cardText) {
    const formData = {};

    // Async call to save state and logs if necessary
    if (process.env.SAVELOG) {
      const result = (error) ? error : ((response) ? response : speech);
      formData.savelog = JSON.stringify({
        event: globalEvent,
        result: result,
      });
    }
    if (response) {
      formData.savedb = JSON.stringify({
        userId: globalEvent.session.user.userId,
        attributes: globalEvent.session.attributes,
      });
    }

    if (formData.savelog || formData.savedb) {
      const params = {
        url: process.env.SERVICEURL + 'roulette/saveState',
        formData: formData,
      };

      request.post(params, (err, res, body) => {
        if (err) {
          console.log(err);
        }
      });
    }

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
    const achievementScore = getAchievementScore(attributes.achievements);

    if (achievementScore) {
      text = res.strings.READ_BANKROLL_WITH_ACHIEVEMENT.replace('{0}', hand.bankroll).replace('{1}', achievementScore);
    } else {
      text = res.strings.READ_BANKROLL.replace('{0}', hand.bankroll);
    }

    return text;
  },
  getHighScore(attributes, currentHand, callback) {
    getTopScoresFromS3(attributes, 'bankroll', (err, scores) => {
      callback(err, (scores) ? scores[0] : undefined);
    });
  },
  readLeaderBoard: function(locale, attributes, callback) {
    const res = require('./' + locale + '/resources');
    const hand = attributes[attributes.currentHand];
    const tournament = (attributes.currrentHand === 'tournament');

    getTopScoresFromS3(attributes, (tournament) ? 'bankroll' : 'achievementScore', (err, scores) => {
      let speech = '';
      const format = (tournament) ? res.strings.LEADER_TOURNAMENT_RANKING : LEADER_RANKING;

      // OK, read up to five high scores
      if (!scores || (scores.length === 0)) {
        // No scores to read
        speech = res.strings.LEADER_NO_SCORES;
      } else {
        const myScore = (tournament) ? hand.bankroll : getAchievementScore(attributes.achievements);

        if (myScore > 0) {
          const ranking = scores.indexOf(myScore) + 1;
          speech += format.replace('{0}', myScore).replace('{1}', ranking).replace('{2}', scores.length);
        }

        // And what is the leader board?
        const toRead = (scores.length > 5) ? 5 : scores.length;
        let topScores = scores.slice(0, toRead);
        if (tournament) {
          topScores = topScores.map((x) => res.strings.LEADER_FORMAT.replace('{0}', x));
          speech += res.strings.LEADER_TOP_BANKROLLS.replace('{0}', toRead);
        } else {
          speech += res.strings.LEADER_TOP_SCORES.replace('{0}', toRead);
        }
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

function getTopScoresFromS3(attributes, scoreType, callback) {
  const hand = attributes[attributes.currentHand];
  const scoreSet = attributes.currentHand + 'Scores';

  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'BlackjackScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, null);
    } else {
      // Yeah, I can do a binary search (this is sorted), but straight search for now
      const ranking = JSON.parse(data.Body.toString('ascii'));
      const scores = ranking[scoreSet];
      const myScore = (scoreType === 'achievementScore') ?
              getAchievementScore(attributes.achievements) : hand[scoreType];

      if (scores) {
        const mappedScores = scores.map((a) => a[scoreType]);

        // If their current achievement score isn't in the list, add it
        if (mappedScores.indexOf(myScore) < 0) {
          mappedScores.push(myScore);
        }

        callback(null, mappedScores.sort((a, b) => (b - a)));
      } else {
        console.log('No scores for ' + attributes.currentGame);
        callback('No scoreset', null);
      }
    }
  });
}

function getAchievementScore(achievements) {
  let achievementScore = 0;

  if (achievements) {
    if (achievements.trophy) {
      achievementScore += 100 * achievements.trophy;
    }
    if (achievements.daysPlayed) {
      achievementScore += 10 * achievements.daysPlayed;
    }
    if (achievements.streakScore) {
      achievementScore += achievements.streakScore;
    }
  }

  return achievementScore;
}
