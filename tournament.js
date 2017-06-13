//
// All things tournament related go into this file
//
// Tournaments are controlled by a global setting (whether a tournament is active)
//

'use strict';

const utils = require('./utils');
const MAXSPINS = 5;
const STARTINGBANKROLL = 1000;

module.exports = {
  canEnterTournament: function(attributes) {
    // You can enter a tournament if one is active and you haven't ended one
    const hand = attributes['tournament'];

    return (isTournamentActive() && !(hand && hand.finished));
  },
  promptToEnter: function(locale, attributes, callback) {
    // If there is an active tournament, we need to either inform them
    // or if they are participating in the tournament, allow them to leave
    const res = require('./' + locale + '/resources');
    const hand = attributes['tournament'];

    if (hand) {
      let speech = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK;
      const reprompt = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT;

      speech += res.strings.TOURNAMENT_BANKROLL.replace('{0}', hand.bankroll).replace('{1}', MAXSPINS - hand.spins);
      readStanding(locale, attributes, (standing) => {
        if (standing) {
          speech += standing;
        }

        speech += reprompt;
        callback(speech, reprompt);
      });
    } else {
      callback(res.strings.TOURNAMENT_LAUNCH_INFORM, res.strings.TOURNAMENT_LAUNCH_INFORM_REPROMPT);
    }
  },
  outOfMoney: function(emit, locale, attributes, speech) {
    const res = require('./' + locale + '/resources');
    let response = speech;

    response += res.strings.TOURNAMENT_BANKRUPT;
    attributes['tournament'].finished = true;
    emit(':tell', response);
  },
  outOfSpins: function(emit, locale, attributes, speech) {
    const res = require('./' + locale + '/resources');
    let response = speech;

    response += res.strings.TOURNAMENT_OUTOFSPINS;
    readStanding(locale, attributes, (standing) => {
      response += standing;
      attributes['tournament'].finished = true;
      emit(':tell', response);
    });
  },
  handleJoin: function() {
    // Welcome to the tournament!
    const res = require('./' + this.event.request.locale + '/resources');
    let speech;
    const reprompt = res.strings.TOURNAMENT_WELCOME_REPROMPT;

    if (!this.attributes['tournament']) {
      // New player
      this.attributes['tournament'] = {
        bankroll: STARTINGBANKROLL,
        doubleZeroWheel: true,
        canReset: false,
        maxSpins: MAXSPINS,
        high: STARTINGBANKROLL,
        spins: 0,
        timestamp: Date.now(),
      };

      speech = res.strings.TOURNAMENT_WELCOME_NEWPLAYER.replace('{0}', STARTINGBANKROLL).replace('{1}', MAXSPINS);
      speech += reprompt;
    } else {
      speech = res.strings.TOURNAMENT_WELCOME_BACK;
      speech += reprompt;
    }

    this.attributes.currentHand = 'tournament';
    this.handler.state = 'INGAME';
    this.emit(':ask', speech, reprompt);
  },
  handlePass: function() {
    // Nope, they are not going to join the tournament - we will just pass on to Launch
    if (this.attributes.currentHand == 'tournament') {
      this.attributes.currentHand = (this.event.request.locale == 'en-US') ? 'american' : 'european';
    }

    this.emit('LaunchRequest');
  },
};

//
// Internal functions
//
function isTournamentActive() {
  // For now, it's controlled by an environment variable but this could be
  // more sophisticated in the future
  return process.env.TOURNAMENT;
}

function readStanding(locale, attributes, callback) {
  const res = require('./' + locale + '/resources');
  const hand = attributes['tournament'];

  utils.getRankings('tournamentScores', hand.bankroll, (err, rank) => {
    // Let them know their current rank
    let speech = '';

    if (rank) {
      let togo = '';

      if (rank.delta > 0) {
        togo = res.strings.TOURNAMENT_STANDING_TOGO.replace('{0}', rank.delta).replace('{1}', rank.rank - 1);
      }

      // If they haven't played, just tell them the number of players
      if (hand.spins > 0) {
        speech += res.strings.TOURNAMENT_STANDING.replace('{0}', rank.rank);
        speech += togo;
      }
    }

    callback(speech);
  });
}
