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
const ri = require('@jargon/alexa-skill-sdk').ri;

module.exports = {
  getTournamentComplete: function(handlerInput, attributes) {
    // If the user is in a tournament, we check to see if that tournament
    // is complete.  If so, we set certain attributes and return a result
    // string via the callback for the user
    const locale = handlerInput.requestEnvelope.request.locale;
    const hand = attributes['tournament'];

    if (hand) {
      // You are in a tournament - let's see if it's completed
      return s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteTournamentResults.txt'}).promise()
      .then((data) => {
        // Yeah, I can do a binary search (this is sorted), but straight search for now
        const results = JSON.parse(data.Body.toString('ascii'));
        let i;
        let result;
        let speech;
        const speechParams = {};

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
            speech = 'TOURNAMENT_WINNER';
            speechParams.Amount = hand.bankroll;
          } else {
            speech = 'TOURNAMENT_LOSER';
            speechParams.HighScore = result.highScore;
            speechParams.Amount = hand.bankroll;
          }
          attributes.currentHand = utils.defaultWheel(locale);
          attributes['tournament'] = undefined;
          return handlerInput.jrm.render(ri(speech, speechParams));
        } else {
          return '';
        }
      })
      .catch((err) => {
        console.log('Tournament close error', err);
        return '';
      });
    } else {
      // No-op, you weren't playing
      return Promise.resolve('');
    }
  },
  joinTournament: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech;
    const speechParams = {};

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

      speech = 'TOURNAMENT_WELCOME_NEWPLAYER';
      speechParams.Amount = STARTINGBANKROLL;
      speechParams.Spins = MAXSPINS;
      if (buttons.supportButtons(handlerInput)) {
        speech += '_BUTTON';
      }
    } else {
      const hand = attributes[attributes.currentHand];
      speechParams.Spins = hand.maxSpins - hand.spins;
      speech = 'TOURNAMENT_WELCOME_BACK';
    }

    return handlerInput.jrm.render(ri(speech, speechParams));
  },
  canEnterTournament: function(attributes) {
    // You can enter a tournament if one is active and you haven't ended one
    // and you have to have purchased it or be grandfathered in
    // Returns TRUE if you can enter
    // Returns FALSE if you can enter - if you pay
    // Returns undefined if the tournament is not active or you busted out
    const hand = attributes['tournament'];

    if (isTournamentActive()) {
      if (hand && ((hand.bankroll === 0) || hand.finished)) {
        return undefined;
      }

      if (!attributes.needsToBuyTournament) {
        return true;
      }

      if (attributes.paid && attributes.paid.Tournament &&
        (attributes.paid.Tournament.state === 'AVAILABLE')) {
        // You have to pay to play
        return false;
      }

      // OK, you can play!
      return true;
    }

    return undefined;
  },
  playReminderText: function() {
    return (!isTournamentActive() && process.env.TOURNAMENT && process.env.TOURNAMENT_REMINDER);
  },
  promptToEnter: function(locale, attributes) {
    // If there is an active tournament, we need to either inform them
    // or if they are participating in the tournament, allow them to leave
    let speech;
    let reprompt;

    if (attributes['tournament']) {
      speech = 'TOURNAMENT_LAUNCH_WELCOMEBACK';
      reprompt = 'TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT';
    } else {
      speech = 'TOURNAMENT_LAUNCH_INFORM';
      reprompt = 'TOURNAMENT_LAUNCH_INFORM_REPROMPT';
    }

    return ({speech: speech, reprompt: reprompt});
  },
  readHelp: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech;
    const speechParams = {};
    const helpParams = {};
    const hand = attributes['tournament'];

    speechParams.Bankroll = hand.bankroll;
    speechParams.Spins = hand.maxSpins - hand.spins;
    speech = 'TOURNAMENT_HELP';
    return module.exports.readStanding(handlerInput)
    .then((standing) => {
      speechParams.Standing = standing;
      return utils.betRange(handlerInput, hand);
    }).then((range) => {
      helpParams.Spins = hand.maxSpins;
      helpParams.Range = range;

      // Reprompt them based on whether bets are placed
      speech += (hand.bets) ? '_WITHBETS': '_LASTBETS';
      return handlerInput.responseBuilder
        .speak(ri(speech, speechParams))
        .reprompt(ri('TOURNAMENT_HELP_REPROMPT'))
        .withSimpleCard(ri('HELP_CARD_TITLE'), ri('HELP_CARD_TEXT', helpParams))
        .getResponse();
    });
  },
  readStanding: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const hand = attributes['tournament'];

    if (!hand || !hand.spins) {
      // No need to say anything
      return Promise.resolve('');
    } else {
      return utils.getHighScore(attributes)
      .then((high) => {
        // Let them know the current high score
        if (high) {
          let speech;
          const params = {};
          if (hand.bankroll >= high) {
            speech = 'TOURNAMENT_STANDING_FIRST';
          } else {
            params.Amount = high;
            speech = 'TOURNAMENT_STANDING_TOGO';
          }

          return handlerInput.jrm.resolve(ri(speech, params));
        } else {
          return '';
        }
      });
    }
  },
  tournamentGrandfathered: function(event, attributes) {
    // Hash userID to a value from 0-99
    let value = 1;
    let i;
    let needsToBuyTournament = false;

    for (i = 0; i < event.session.user.userId.length; i++) {
      value = (value * 37 + event.session.user.userId.charCodeAt(i)) % 100;
    }

    if (['en-US', 'en-CA', 'en-GB'].indexOf(event.request.locale) > -1) {
      // If you haven't played a tournament before ... now you have to pay
      // If you have played before, we're going to force 25% of users to pay
      // We'll at least message it so they know
      if (attributes.tournamentsPlayed) {
        // Make note that they aren't grandfathered in
        attributes.grandfatheredForTournament = (value % 4 !== 0);
        if (!attributes.grandfatheredForTournament) {
          attributes.temp.payToPlay = true;
        }
      }

      needsToBuyTournament = !attributes.grandfatheredForTournament;
    }

    attributes.needsToBuyTournament = needsToBuyTournament;
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

