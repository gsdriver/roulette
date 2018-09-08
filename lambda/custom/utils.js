//
// Utility functions
//

'use strict';

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const speechUtils = require('alexa-speech-utils')();
const request = require('request');
const querystring = require('querystring');

module.exports = {
  number: function(locale, value, doubleZeroWheel) {
    let result = parseInt(value);
    const res = require('./resources')(locale);

    // First, is it an integer already?
    if (!isNaN(result)) {
      if ((result >= 0) && (result <= 36)) {
        // valid - return it
        return result;
      }
    } else {
      result = res.mapNumber(value);
      if (result) {
        // Valid - return it
        return result;
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
    const res = require('./resources')(locale);
    const hand = attributes[attributes.currentHand];
    let text;
    const achievementScore = getAchievementScore(attributes.achievements);

    if (achievementScore && !process.env.NOACHIEVEMENT) {
      text = res.strings.READ_BANKROLL_WITH_ACHIEVEMENT.replace('{0}', hand.bankroll).replace('{1}', achievementScore);
    } else {
      text = res.strings.READ_BANKROLL.replace('{0}', hand.bankroll);
    }

    return text;
  },
  getHighScore(attributes, callback) {
    const leaderURL = process.env.SERVICEURL + 'roulette/leaders?count=1&game=' + attributes.currentHand;

    request(
      {
        uri: leaderURL,
        method: 'GET',
        timeout: 1000,
      }, (err, response, body) => {
      if (err) {
        callback(err);
      } else {
        const leaders = JSON.parse(body);
        callback(null, (leaders.top) ? leaders.top[0] : undefined);
      }
    });
  },
  updateLeaderBoard: function(event, attributes) {
    // Update the leader board
    const formData = {
      userId: event.session.user.userId,
      attributes: JSON.stringify(attributes),
    };
    const params = {
      url: process.env.SERVICEURL + 'roulette/updateLeaderBoard',
      formData: formData,
    };
    request.post(params, (err, res, body) => {
      if (err) {
        console.log(err);
      }
    });
  },
  readLeaderBoard: function(locale, userId, attributes, callback) {
    const res = require('./resources')(locale);
    const hand = attributes[attributes.currentHand];
    const scoreType = (attributes.currentHand === 'tournament') ? 'bankroll' : 'achievement';
    let leaderURL = process.env.SERVICEURL + 'roulette/leaders';
    const myScore = (scoreType === 'achievement') ?
            getAchievementScore(attributes.achievements) : hand[scoreType];
    let speech = '';
    const params = {};

    if (myScore > 0) {
      params.userId = userId;
      params.score = myScore;
    }
    if (scoreType === 'bankroll') {
      params.game = attributes.currentHand;
    }
    const paramText = querystring.stringify(params);
    if (paramText.length) {
      leaderURL += '?' + paramText;
    }

    request(
      {
        uri: leaderURL,
        method: 'GET',
        timeout: 1000,
      }, (err, response, body) => {
      if (err) {
        // No scores to read
        speech = res.strings.LEADER_NO_SCORES;
      } else {
        const leaders = JSON.parse(body);

        if (!leaders.count || !leaders.top) {
          // Something went wrong
          speech = res.strings.LEADER_NO_SCORES;
        } else {
          if (leaders.rank) {
            speech += ((scoreType === 'bankroll') ? res.strings.LEADER_TOURNAMENT_RANKING : res.strings.LEADER_RANKING)
              .replace('{0}', myScore)
              .replace('{1}', leaders.rank)
              .replace('{2}', roundPlayers(locale, leaders.count));
          }

          // And what is the leader board?
          let topScores = leaders.top;
          if (scoreType === 'bankroll') {
            topScores = topScores.map((x) => res.strings.LEADER_FORMAT.replace('{0}', x));
          }

          speech += ((scoreType === 'bankroll') ? res.strings.LEADER_TOP_BANKROLLS
              : res.strings.LEADER_TOP_SCORES).replace('{0}', topScores.length);
          speech += speechUtils.and(topScores, {locale: locale, pause: '300ms'});
          if (scoreType === 'achievement') {
            speech += res.strings.LEADER_ACHIEVEMENT_HELP;
          }
        }
      }

      callback(speech);
    });
  },
  // We changed the structure of attributes - this updates legacy saved games
  migrateAttributes: function(attributes, locale) {
    attributes.playerLocale = locale;
    if (!attributes['american']) {
      attributes['american'] = {minBet: 1, doubleZeroWheel: true, canReset: true};

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
      attributes['european'] = {minBet: 1, doubleZeroWheel: false, canReset: true};

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
      attributes.currentHand = module.exports.defaultWheel(locale);
    }

    // Reset spin count based on addition of resets
    if (attributes['american'].legacySpins === undefined) {
      attributes['american'].legacySpins = attributes['american'].spins;
      attributes['american'].spins = 0;
    }
    if (attributes['european'].legacySpins === undefined) {
      attributes['european'].legacySpins = attributes['european'].spins;
      attributes['european'].spins = 0;
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

      if (oldestAd && (oldestAd < cutoff)) {
        return true;
      }
    }

    return false;
  },
  defaultWheel: function(locale) {
    // US and Canada are double zero 'american' - others are single zero 'european'
    return ((locale === 'en-US') || (locale === 'en-CA')) ?
      'american' : 'european';
  },
  drawTable: function(handlerInput) {
    const response = handlerInput.responseBuilder;
    const event = handlerInput.requestEnvelope;
    const res = require('./resources')(event.request.locale);

    // If this is a Show, show the background image
    if (event.context && event.context.System &&
      event.context.System.device &&
      event.context.System.device.supportedInterfaces &&
      event.context.System.device.supportedInterfaces.Display) {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      attributes.display = true;

      // Add background image
      const hand = attributes[attributes.currentHand];
      let imageURL;
      if (hand.lastSpin) {
        if (hand.doubleZeroWheel) {
          const lastSpin = (hand.lastSpin == -1) ? '00' : hand.lastSpin;
          imageURL = 'https://s3.amazonaws.com/garrett-alexa-images/roulette/double' + lastSpin + '.png';
        } else {
          imageURL = 'https://s3.amazonaws.com/garrett-alexa-images/roulette/single' + hand.lastSpin + '.png';
        }
      } else {
        imageURL = (hand.doubleZeroWheel)
          ? 'https://s3.amazonaws.com/garrett-alexa-images/roulette/double.png'
          : 'https://s3.amazonaws.com/garrett-alexa-images/roulette/single.png';
      }
      const image = new Alexa.ImageHelper()
        .withDescription('')
        .addImageInstance(imageURL)
        .getImage();
      const textContent = new Alexa.PlainTextContentHelper()
        .withPrimaryText(res.strings.DISPLAY_TITLE)
        .getTextContent();
      response.addRenderTemplateDirective({
        type: 'BodyTemplate6',
        backButton: 'HIDDEN',
        textContent: textContent,
        backgroundImage: image,
      });
    }
  },
};

//
// Internal functions
//
function slotName(locale, num, sayColor) {
  let result;
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
  const res = require('./resources')(locale);

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

function roundPlayers(locale, playerCount) {
  const res = require('./resources')(locale);

  if (playerCount < 200) {
    return playerCount;
  } else {
    // "Over" to the nearest hundred
    return res.strings.MORE_THAN_PLAYERS.replace('{0}', 100 * Math.floor(playerCount / 100));
  }
}
