//
// All things tournament related go into this file
//
// Tournaments are controlled by a global setting (whether a tournament is active)
// An individual player has a tournament state as follows:
//
//   declined - They declined to join the tournament
//   active - They are actively playing in this tournament
//   passed - They started the tournament, but took a pass this session
//   ended - They have finished playing the tournament
//

'use strict';

const utils = require('./utils');
const MAXSPINS = 50;
const STARTINGBANKROLL = 1000;

module.exports = {
  registerHandlers: function(alexa, handlers, joinHandlers,
    tournamentHandlers, resetHandlers, inGameHandlers) {
    // Register tournament handlers only if there is an active tournament
    if (isTournamentActive()) {
      alexa.registerHandlers(handlers, joinHandlers,
          tournamentHandlers, resetHandlers, inGameHandlers);
    } else {
      alexa.registerHandlers(handlers, resetHandlers, inGameHandlers);
    }
  },
  launchPrompt: function(locale, attributes, callback) {
    // If there is an active tournament, we need to either inform them
    // or if they are participating in the tournament, allow them to leave
    const res = require('./' + locale + '/resources');
    const hand = attributes['tournament'];

    if (isTournamentActive()
            && !(hand && (hand.state === 'declined'))
            && !(hand && (hand.state === 'passed'))
            && !(hand && (hand.state === 'ended'))) {
      if (hand && (hand.state === 'active')) {
        let speech = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK;
        const reprompt = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT;

        speech += res.strings.TOURNAMENT_BANKROLL.replace('{0}', hand.bankroll).replace('{1}', MAXSPINS - hand.spins);
        readStanding(locale, attributes, (standing) => {
          if (standing) {
            speech += standing;
          }

          speech += reprompt;
          callback('JOINTOURNAMENT', speech, reprompt);
        });
      } else {
        callback('JOINTOURNAMENT', res.strings.TOURNAMENT_LAUNCH_INFORM, res.strings.TOURNAMENT_LAUNCH_INFORM_REPROMPT);
      }
    } else {
      // No tournament, do your normal processing
      callback(null, null, null);
    }
  },
  endSession: function(attributes) {
    // If they declined joining the tournament, clear that state so they
    // hear about it the next time they join
    if (attributes['tournament']) {
      if (attributes['tournament'].state === 'declined') {
        attributes['tournament'] = undefined;
      } else if (attributes['tournament'].state === 'passed') {
        attributes['tournament'].state = 'active';
      }
    }
  },
  outOfMoney: function(emit, locale, attributes, speech) {
    const res = require('./' + locale + '/resources');
    let response = speech;

    response += res.strings.TOURNAMENT_BANKRUPT;
    attributes['tournament'].state = 'ended';
    emit(':tell', response);
  },
  handleJoin: function() {
    // Welcome to the tournament!
    const res = require('./' + this.event.request.locale + '/resources');
    let speech;
    const reprompt = res.strings.TOURNAMENT_WELCOME_REPROMPT;

    if (!this.attributes['tournament']) {
      // New player
      this.attributes['tournament'] = {
        state: 'active',
        previousHand: this.attributes.currentHand,
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
      // Welcome back - we'll mark you as active
      this.attributes['tournament'].state = 'active';
      this.attributes['tournament'].previousHand = this.attributes.currentHand;
      speech = res.strings.TOURNAMENT_WELCOME_BACK;
      speech += reprompt;
    }

    this.attributes.currentHand = 'tournament';
    this.handler.state = 'TOURNAMENT';
    this.emit(':ask', speech, reprompt);
  },
  handlePass: function() {
    // Nope, they are not going to join the tournament - we will just pass on to Launch
    this.handler.state = 'INGAME';
    if (this.attributes['tournament']) {
      this.attributes.currentHand = this.attributes['tournament'].previousHand;
      this.attributes['tournament'].state = (this.attributes['tournament'].state === 'active')
        ? 'passed' : 'declined';
    } else {
      this.attributes['tournament'] = {state: 'declined'};
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
