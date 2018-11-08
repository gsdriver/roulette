//
// All things tournament related go into this file
//
// Tournaments are controlled by a global setting (whether a tournament is active)
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const utils = require('./utils');
const moment = require('moment-timezone');
const buttons = require('./buttons');

module.exports = {
  getTournamentComplete: function(locale, attributes, callback) {
    // If the user is in a tournament, we check to see if that tournament
    // is complete.  If so, we set certain attributes and return a result
    // string via the callback for the user
    const res = require('./resources')(locale);
    const hand = attributes['tournament'];

    if (hand) {
      // You are in a tournament - let's see if it's completed
      s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteTournamentResults.txt'}, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          callback('');
        } else {
          // Yeah, I can do a binary search (this is sorted), but straight search for now
          const results = JSON.parse(data.Body.toString('ascii'));
          let i;
          let result;
          let speech = '';

          // Go through the results and find one that closed AFTER our last play
          for (i = 0; i < (results ? results.length : 0); i++) {
            if (results[i].timestamp > hand.timestamp) {
              // This is the one
              result = results[i];
              break;
            }
          }

          if (result) {
            if (hand.bankroll >= result.highScore) {
              // Congratulations, you won!
              if (!attributes.achievements) {
                attributes.achievements = {trophy: 1};
              } else {
                attributes.achievements.trophy = (attributes.achievements.trophy)
                    ? (attributes.achievements.trophy + 1) : 1;
              }
              speech = res.strings.TOURNAMENT_WINNER.replace('{Amount}', hand.bankroll);
            } else {
              speech = res.strings.TOURNAMENT_LOSER.replace('{HighScore}', result.highScore).replace('{Amount}', hand.bankroll);
            }
            attributes.currentHand = utils.defaultWheel(locale);
            attributes['tournament'] = undefined;
          }

          callback(speech);
        }
      });
    } else {
      // No-op, you weren't playing
      callback('');
    }
  },
  joinTournament: function(handlerInput, callback) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('./resources')(event.request.locale);
    let speech;
    const reprompt = res.strings.TOURNAMENT_WELCOME_REPROMPT;

    attributes.temp.joinTournament = undefined;
    attributes.currentHand = 'tournament';
    if (!attributes.tournament) {
      // New player
      const MAXSPINS = 50;
      const STARTINGBANKROLL = 1000;

      attributes.tournamentsPlayed = (attributes.tournamentsPlayed + 1) || 1;
      attributes['tournament'] = {
        bankroll: STARTINGBANKROLL,
        doubleZeroWheel: true,
        canReset: false,
        minBet: 1,
        maxBet: 500,
        maxSpins: MAXSPINS,
        high: STARTINGBANKROLL,
        spins: 0,
        timestamp: Date.now(),
      };

      speech = res.strings.TOURNAMENT_WELCOME_NEWPLAYER
        .replace('{Amount}', STARTINGBANKROLL)
        .replace('{Spins}', MAXSPINS);
      if (buttons.supportButtons(handlerInput)) {
        speech += res.strings.TOURNAMENT_WELCOME_BUTTON;
      }
      speech += reprompt;
      callback(speech, reprompt);
    } else {
      const hand = attributes[attributes.currentHand];

      speech = res.strings.TOURNAMENT_WELCOME_BACK.replace('{Spins}', hand.maxSpins - hand.spins);
      module.exports.readStanding(event.request.locale, attributes, (standing) => {
        if (standing) {
          speech += standing;
        }

        if (buttons.supportButtons(handlerInput)) {
          speech += res.strings.TOURNAMENT_WELCOME_BUTTON;
        }
        speech += reprompt;
        callback(speech, reprompt);
      });
    }
  },
  canEnterTournament: function(attributes) {
    // You can enter a tournament if one is active and you haven't ended one
    const hand = attributes['tournament'];

    return (isTournamentActive() &&
          !(hand && ((hand.bankroll === 0) || hand.finished)));
  },
  getReminderText: function(locale) {
    const res = require('./resources')(locale);
    let reminder = '';

    if (!isTournamentActive() && process.env.TOURNAMENT && process.env.TOURNAMENT_REMINDER) {
      reminder = res.strings.TOURNAMENT_REMINDER;
    }

    return reminder;
  },
  promptToEnter: function(locale, attributes) {
    // If there is an active tournament, we need to either inform them
    // or if they are participating in the tournament, allow them to leave
    const res = require('./resources')(locale);
    let speech;
    let reprompt;

    if (attributes['tournament']) {
      speech = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK;
      reprompt = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT;
    } else {
      speech = res.strings.TOURNAMENT_LAUNCH_INFORM;
      reprompt = res.strings.TOURNAMENT_LAUNCH_INFORM_REPROMPT;
    }

    return ({speech: speech, reprompt: reprompt});
  },
  outOfMoney: function(handlerInput, speech) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('./resources')(event.request.locale);
    let response = speech;

    response += res.strings.TOURNAMENT_BANKRUPT;
    attributes['tournament'].finished = true;
    return handlerInput.responseBuilder
      .speak(response)
      .withShouldEndSession(true)
      .getResponse();
  },
  outOfSpins: function(handlerInput, speech) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('./resources')(event.request.locale);
    let response = speech;

    return new Promise((resolve, reject) => {
      response += res.strings.TOURNAMENT_OUTOFSPINS;
      module.exports.readStanding(event.request.locale, attributes, (standing) => {
        response += standing;
        attributes['tournament'].finished = true;
        resolve(response);
      });
    });
  },
  readHelp: function(handlerInput, callback) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('./resources')(event.request.locale);
    let speech;
    let reprompt = res.strings.HELP_REPROMPT;
    const hand = attributes['tournament'];

    speech = res.strings.TOURNAMENT_HELP;
    speech += res.strings.TOURNAMENT_BANKROLL.replace('{Bankroll}', hand.bankroll).replace('{Spins}', hand.maxSpins - hand.spins);
    module.exports.readStanding(event.request.locale, attributes, (standing) => {
      speech += standing;

      // Reprompt them based on whether bets are placed
      if (hand.bets) {
        speech += res.strings.HELP_SPIN_WITHBETS;
        reprompt = res.strings.HELP_SPIN_WITHBETS_REPROMPT;
      } else if (hand.lastbets) {
        speech += res.strings.HELP_SPIN_LASTBETS;
        reprompt = res.strings.HELP_SPIN_LASTBETS_REPROMPT;
      }

      speech += reprompt;
      const response = handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt)
        .withSimpleCard(res.strings.HELP_CARD_TITLE,
            res.strings.TOURNAMENT_HELP_CARD_TEXT
              .replace('{Spins}', hand.maxSpins)
              .replace('{Range}', utils.betRange(handlerInput, hand)))
        .getResponse();
      callback(response);
    });
  },
  readStanding: function(locale, attributes, callback) {
      const res = require('./resources')(locale);
    const hand = attributes['tournament'];

    if (!hand.spins) {
      // No need to say anything
      callback('');
    } else {
      utils.getHighScore(attributes, (err, high) => {
        // Let them know the current high score
        let speech = '';

        if (high) {
          if (hand.bankroll >= high) {
            speech = res.strings.TOURNAMENT_STANDING_FIRST;
          } else {
            speech = res.strings.TOURNAMENT_STANDING_TOGO.replace('{Amount}', high);
          }
        }

        callback(speech);
      });
    }
  },
};

//
// Internal functions
//
function isTournamentActive() {
  let active = false;

  if (process.env.TOURNAMENT) {
    // Active on Thursdays PST (Day=4)
    // We actually start the tournament at 9 PM Wednesday PST
    // for our East Coast friends
    const tzOffset = moment.tz.zone('America/Los_Angeles').utcOffset(Date.now());
    const d = new Date();
    d.setMinutes(d.getMinutes() - tzOffset);

    active = (((d.getDay() == 3) && (d.getHours() >= 21))
            || (d.getDay() == 4));
  }

  return active;
}

