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
const leven = require('leven');
const seedrandom = require('seedrandom');

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
      const numberMapping = JSON.parse(res.strings.NUMBER_MAPPING);
      result = getBestMatch(numberMapping, value.toLowerCase());
      if (result) {
        // Valid - return it
        return result;
      } else {
        // Has to be "double zero" or "single zero"
        const zeroMapping = JSON.parse(res.strings.ZERO_MAPPING);
        const zeroes = getBestMatchFromArray(zeroMapping, value.toUpperCase());
        const result = (zeroes === 'onezero') ? 0 : ((zeroes === 'twozero') ? -1 : undefined);

        if (result !== undefined) {
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
      text = res.strings.READ_BANKROLL_WITH_ACHIEVEMENT.replace('{Bankroll}', hand.bankroll).replace('{Achievements}', achievementScore);
    } else {
      text = res.strings.READ_BANKROLL.replace('{Bankroll}', hand.bankroll);
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
              .replace('{Bankroll}', myScore)
              .replace('{Position}', leaders.rank)
              .replace('{Players}', roundPlayers(locale, leaders.count));
          }

          // And what is the leader board?
          let topScores = leaders.top;
          if (scoreType === 'bankroll') {
            topScores = topScores.map((x) => res.strings.LEADER_FORMAT.replace('{Amount}', x));
          }

          speech += ((scoreType === 'bankroll') ? res.strings.LEADER_TOP_BANKROLLS
              : res.strings.LEADER_TOP_SCORES).replace('{Top}', topScores.length);
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
      if (!attributes.temp.spinColor && hand.lastSpin) {
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
  mapBetType: function(handlerInput, betType, numbers) {
    const event = handlerInput.requestEnvelope;
    const res = require('./resources')(event.request.locale);
    const betTypeMapping = {'Black': 'BETTYPE_BLACK',
                          'Red': 'BETTYPE_RED',
                          'Even': 'BETTYPE_EVEN',
                          'Odd': 'BETTYPE_ODD',
                          'High': 'BETTYPE_HIGH',
                          'Low': 'BETTYPE_LOW'};
    if (betTypeMapping[betType]) {
      return res.strings[betTypeMapping[betType]];
    } else if (betType === 'Column') {
      return res.strings.BETTYPE_COLUMN.replace('{Ordinal}', numbers[0]);
    } else if (betType === 'Dozen') {
      return res.strings.BETTYPE_DOZEN.replace('{Ordinal}', (numbers[11] / 12));
    } else if (betType === 'Numbers') {
      return module.exports.speakNumbers(locale, numbers);
    }

    // No match
    return betType;
  },
  getBetSuggestion: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const res = require('./resources')(event.request.locale);
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let value1;
    let value2;
    let value3;

    const options = res.strings.BET_SUGGESTION.split('|');
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
    return options[value1].replace('{Number}', value2).replace('{Ordinal}', value3);
  },
  betRange: function(handlerInput, hand) {
    const event = handlerInput.requestEnvelope;
    const res = require('./resources')(event.request.locale);
    let format;

    if (hand.minBet && hand.maxBet) {
      format = res.strings['BETRANGE_BETWEEN'];
    } else if (hand.minBet) {
      format = res.strings['BETRANGE_MORE'];
    } else if (hand.maxBet) {
      format = res.strings['BETRANGE_LESS'];
    } else {
      format = res.strings['BETRANGE_ANY'];
    }

    return (format.replace('{Minimum}', hand.minBet).replace('{Maximum}', hand.maxBet));
  },
  valueFromOrdinal: function(handlerInput, ord) {
    const event = handlerInput.requestEnvelope;
    const res = require('./resources')(event.request.locale);
    const ordinalMapping = JSON.parse(res.strings.ORDINAL_MAPPING);
    const lowerOrd = ord.toLowerCase();
    const value = ordinalMapping[lowerOrd];

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
  mapWheelType: function(handlerInput, wheel) {
    const event = handlerInput.requestEnvelope;
    const res = require('./resources')(event.request.locale);
    const wheelMapping = JSON.parse(res.strings.WHEEL_TYPES);
    return getBestMatchFromArray(wheelMapping, wheel.toUpperCase());
  },
  estimateDuration: function(speech) {
    let duration = 0;
    let text = speech;
    let index;
    let end;
    const soundList = [
      {file: 'https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3', length: 2750},
      {file: 'https://s3-us-west-2.amazonaws.com/alexasoundclips/spinwheel.mp3', length: 5350},
    ];

    // Look for and remove all audio clips
    while (text.indexOf('<audio') > -1) {
      index = text.indexOf('<audio');
      end = text.indexOf('>', index);
      const str = text.substring(index, end);

      soundList.forEach((sound) => {
        if (str.indexOf(sound.file) > -1) {
          duration += sound.length;
        }
      });

      text = text.substring(0, index) + text.substring(end + 1);
    }

    // Find and strip out all breaks
    while (text.indexOf('<break') > -1) {
      // Extract the number
      index = text.indexOf('<break');
      end = text.indexOf('>', index);

      // We're assuming the break time is in ms
      const str = text.substring(index, end);
      const time = parseInt(str.match(/\d/g).join(''));
      if (!isNaN(time)) {
        duration += time;
      }

      // And skip this one
      text = text.substring(0, index) + text.substring(end + 1);
    }

    // 60 ms for each remaining character
    duration += 60 * text.length;
    return duration;
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
      result = res.strings.BLACK_NUMBER.replace('{Number}', result);
    } else {
      result = res.strings.RED_NUMBER.replace('{Number}', result);
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
    return res.strings.MORE_THAN_PLAYERS.replace('{Players}', 100 * Math.floor(playerCount / 100));
  }
}

function getBestMatchFromArray(mapping, value) {
  const valueLen = value.length;
  let map;
  let ratio;
  let bestMapping;
  let bestRatio = 0;

  for (map in mapping) {
    if (map) {
      mapping[map].forEach((entry) => {
        const lensum = entry.length + valueLen;
        ratio = Math.round(100 * ((lensum - leven(value, entry)) / lensum));
        if (ratio > bestRatio) {
          bestRatio = ratio;
          console.log(map);
          bestMapping = map;
        }
      });
    }
  }

  if (bestRatio < 90) {
    console.log('Near match: ' + bestMapping + ', ' + bestRatio);
  }
  return ((bestMapping && (bestRatio > 60)) ? bestMapping : undefined);
}

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
  return ((bestMapping && (bestRatio > 80)) ? mapping[bestMapping] : undefined);
}
