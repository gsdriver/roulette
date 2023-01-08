//
// Utility functions
//

'use strict';

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const speechUtils = require('alexa-speech-utils')();
const request = require('request-promise');
const querystring = require('querystring');
const leven = require('leven');
const seedrandom = require('seedrandom');
const ri = require('@jargon/alexa-skill-sdk').ri;
const moment = require('moment-timezone');

module.exports = {
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

    // Force the amount to fit
    if (hand.maxBet && (amount > hand.maxBet)) {
      amount = hand.maxBet;
    }
    if (amount > hand.bankroll) {
      amount = hand.bankroll;
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
  speakNumbers: function(handlerInput, numbers, sayColor) {
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    const items = [];

    numbers.forEach((number) => {
      let renderItem;
      const params = {};
      params.Number = number.toString();

      if (number === -1) {
        renderItem = ri('DOUBLE_ZERO');
      } else if ((number > 0) && sayColor) {
        const speech = (blackNumbers.indexOf(number) > -1) ? 'BLACK_NUMBER' : 'RED_NUMBER';
        renderItem = ri(speech, params);
      } else {
        renderItem = ri('NUMBER', params);
      }
      items.push(renderItem);
    });

    return handlerInput.jrm.renderBatch(items)
    .then((colors) => {
      return speechUtils.and(colors, {locale: handlerInput.requestEnvelope.request.locale});
    });
  },
  getAchievementScore: function(achievements) {
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
  },
  getHighScore(attributes) {
    const leaderURL = process.env.SERVICEURL + 'roulette/leaders?count=1&game=' + attributes.currentHand;

    return request({uri: leaderURL, method: 'GET', timeout: 1000})
    .then((body) => {
      const leaders = JSON.parse(body);
      return (leaders.top ? leaders.top[0] : undefined);
    })
    .catch((err) => {
      return;
    });
  },
  updateLeaderBoard: function(event, attributes) {
    // Update the leader board
    if (process.env.SERVICEURL) {
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
    }
  },
  readLeaderBoard: function(handlerInput, callback) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const hand = attributes[attributes.currentHand];
    const scoreType = (attributes.currentHand === 'tournament') ? 'bankroll' : 'achievement';
    let leaderURL = process.env.SERVICEURL + 'roulette/leaders';
    const myScore = (scoreType === 'achievement') ?
            module.exports.getAchievementScore(attributes.achievements) : hand[scoreType];
    let speech = '';
    const params = {};

    if (myScore > 0) {
      params.userId = event.session.user.userId;
      params.score = myScore;
    }
    if (scoreType === 'bankroll') {
      params.game = attributes.currentHand;
    }
    const paramText = querystring.stringify(params);
    if (paramText.length) {
      leaderURL += '?' + paramText;
    }

    return request(
      {
        uri: leaderURL,
        method: 'GET',
        timeout: 1000,
      }
    ).then((body) => {
      const leaders = JSON.parse(body);
      const speechParams = {};
      if (!leaders.count || !leaders.top) {
        // Something went wrong
        speech = 'LEADER_NO_SCORES';
      } else {
        speechParams.Players = leaders.count;
        if (leaders.rank) {
          speechParams.Bankroll = myScore;
          speechParams.Position = leaders.rank;
          speech = (scoreType === 'bankroll') ? 'LEADER_TOURNAMENT_RANKING' : 'LEADER_RANKING';
        } else {
          speech = (scoreType === 'bankroll') ? 'LEADER_TOURNAMENT_NORANKING' : 'LEADER_NORANKING';
        }

        speechParams.NumberOfLeaders = leaders.top.length;

        // And what is the leader board?
        let i;
        for (i = 0; i < 5; i++) {
          speechParams['HighScore' + (i + 1)] = (leaders.top.length > i)
            ? leaders.top[i] : 0;
        }
      }

      return handlerInput.jrm.render(ri(speech, speechParams));
    })
    .catch((err) => {
      return handlerInput.jrm.render(ri('LEADER_NO_SCORES'));
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
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // We could look at the specific viewport dimensions and display based on that
    // But for now, we'll try to display on all viewport sizes
    if (attributes.temp && event.context && event.context.System &&
      event.context.System.device &&
      event.context.System.device.supportedInterfaces &&
      event.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
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

      return handlerInput.jrm.render(ri('DISPLAY_TITLE'))
      .then((title) => {
        const document = {
          type: 'APL',
          version: '1.6',
          import: [{
            name: 'alexa-layouts',
            version: '1.3.0',
          }],
          mainTemplate: {
            parameters: [
              'headlineTemplateData',
            ],
            item: [{
              type: 'AlexaHeadline',
              headerTitle: '${headlineTemplateData.textContent}',
              headerBackButton: false,
              backgroundImageSource: '${headlineTemplateData.backgroundImage}',
            }],
          },
        };
        const datasources = {
          headlineTemplateData: {
            backgroundImage: imageURL,
            textContent: title,
          },
        };

        return response.addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          version: '1.1',
          document,
          datasources,
        });
      });
    } else {
      return Promise.resolve();
    }
  },
  mapBetType: function(handlerInput, betType, numbers) {
    let speech;
    const speechParams = {};
    const betTypeMapping = {'Black': 'BETTYPE_BLACK',
                          'Red': 'BETTYPE_RED',
                          'Even': 'BETTYPE_EVEN',
                          'Odd': 'BETTYPE_ODD',
                          'High': 'BETTYPE_HIGH',
                          'Low': 'BETTYPE_LOW'};
    if (betTypeMapping[betType]) {
      speech = betTypeMapping[betType];
    } else if (betType === 'Column') {
      speech = 'BETTYPE_COLUMN';
      speechParams.Ordinal = numbers[0];
    } else if (betType === 'Dozen') {
      speech = 'BETTYPE_DOZEN';
      speechParams.Ordinal = (numbers[11] / 12);
    } else if (betType === 'Numbers') {
      return module.exports.speakNumbers(handlerInput, numbers);
    } else {
      return Promise.resolve('');
    }

    return handlerInput.jrm.render(ri(speech, speechParams));
  },
  getBetSuggestion: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let value;
    const params = {};

    let seed = event.session.user.userId;
    if (attributes.currentHand && attributes[attributes.currentHand]
      && attributes[attributes.currentHand].timestamp) {
      seed += attributes[attributes.currentHand].timestamp;
    }
    value = Math.floor(seedrandom('1' + seed)() * 36);
    if (value === 36) {
      value--;
    }
    params.Number = value;
    value = Math.floor(seedrandom('2' + seed)() * 3);
    if (value === 3) {
      value--;
    }
    value++;
    params.Ordinal = value;

    return handlerInput.jrm.render(ri('BET_SUGGESTION', params));
  },
  betRange: function(handlerInput, hand) {
    let speech;
    const speechParams = {};

    if (hand.minBet && hand.maxBet) {
      speech = 'BETRANGE_BETWEEN';
    } else if (hand.minBet) {
      speech = 'BETRANGE_MORE';
    } else if (hand.maxBet) {
      speech = 'BETRANGE_LESS';
    } else {
      speech = 'BETRANGE_ANY';
    }

    speechParams.Minimum = hand.minBet;
    speechParams.Maximum = hand.maxBet;
    return handlerInput.jrm.render(ri(speech, speechParams));
  },
  valueFromOrdinal: function(handlerInput, ord) {
    return handlerInput.jrm.renderObject(ri('ORDINAL_MAPPING'))
    .then((ordinalMapping) => {
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
    });
  },
  mapWheelType: function(handlerInput, wheel) {
    return handlerInput.jrm.renderObject(ri('WHEEL_TYPES'))
    .then((wheelMapping) => {
      return getBestMatchFromArray(wheelMapping, wheel.toUpperCase());
    });
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
  getGreeting: function(handlerInput) {
    const speechParams = {};
    return module.exports.getUserName(handlerInput)
    .then((name) => {
      speechParams.Name = name ? name : '';
      return getUserTimezone(handlerInput)
      .then((timezone) => {
        console.log('params', name, timezone);
        if (timezone) {
          const hour = moment.tz(Date.now(), timezone).format('H');
          let greeting;
          if ((hour > 5) && (hour < 12)) {
            greeting = 'GOOD_MORNING';
          } else if ((hour >= 12) && (hour < 18)) {
            greeting = 'GOOD_AFTERNOON';
          } else {
            greeting = 'GOOD_EVENING';
          }

          return handlerInput.jrm.render(ri(greeting, speechParams));
        } else {
          return '';
        }
      });
    });
  },
  getUserName: function(handlerInput) {
    const usc = handlerInput.serviceClientFactory.getUpsServiceClient();
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if (attributes.given_name) {
      return Promise.resolve(attributes.given_name);
    }

    return usc.getProfileGivenName()
    .then((givenName) => {
      attributes.given_name = givenName;
      return givenName;
    })
    .catch((err) => {
      // If we need permissions, return false - otherwise, return undefined
      return (err.statusCode === 403) ? false : undefined;
    });
  },
};

//
// Internal functions
//

function getBestMatchFromArray(mapping, value) {
  const valueLen = value.length;
  let map;
  let ratio;
  let bestMapping;
  let bestRatio = 0;

  for (map in mapping) {
    if (map) {
      let items;
      if (typeof mapping[map] === 'object') {
        items = Object.keys(mapping[map]).map((key) => mapping[map][key]);
      } else {
        items = mapping[map];
      }
      items.forEach((entry) => {
        const lensum = entry.length + valueLen;
        ratio = Math.round(100 * ((lensum - leven(value, entry)) / lensum));
        if (ratio > bestRatio) {
          bestRatio = ratio;
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

function getUserTimezone(handlerInput) {
  const event = handlerInput.requestEnvelope;
  const usc = handlerInput.serviceClientFactory.getUpsServiceClient();

  if (usc.getSystemTimeZone) {
    return usc.getSystemTimeZone(event.context.System.device.deviceId)
    .then((timezone) => {
      return timezone;
    })
    .catch((error) => {
      // OK if the call fails, return gracefully
      return;
    });
  } else {
    return Promise.resolve();
  }
}
