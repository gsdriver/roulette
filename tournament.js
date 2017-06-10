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

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const MAXSPINS = 50;

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

    if (isTournamentActive()
      && !(attributes['tournament'] && (attributes['tournament'].state === 'declined'))
      && !(attributes['tournament'] && (attributes['tournament'].state === 'passed'))
      && !(attributes['tournament'] && (attributes['tournamentState'] === 'ended'))) {
      if (attributes['tournament'] && (attributes['tournament'].state === 'active')) {
        let speech = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK;
        const reprompt = res.strings.TOURNAMENT_LAUNCH_WELCOMEBACK_REPROMPT;

        speech += res.strings.TOURNAMENT_BANKROLL.replace('{0}', attributes['tournament'].bankroll).replace('{1}', MAXSPINS - attributes['tournament'].spins);
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
  handleJoin: function() {
    // Welcome to the tournament!
    const res = require('./' + this.event.request.locale + '/resources');
    let speech;
    const reprompt = res.strings.TOURNAMENT_WELCOME_REPROMPT;

    if (!this.attributes['tournament']) {
      // New player
      this.attributes['tournament'] = {
        state: 'active',
        bankroll: 1000,
        spins: 0,
      };

      speech = res.strings.TOURNAMENT_WELCOME_NEWPLAYER;
      speech += reprompt;
    } else {
      // Welcome back - we'll mark you as active
      this.attributes['tournament'].state = 'active';
      speech = res.strings.TOURNAMENT_WELCOME_BACK;
      speech += reprompt;
    }

    this.handler.state = 'TOURNAMENT';
    this.emit(':ask', speech, reprompt);
  },
  handlePass: function() {
    // Nope, they are not going to join the tournament - we will just pass on to Launch
    this.handler.state = 'INGAME';
    if (this.attributes['tournament']) {
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

  getTournamentRankFromS3(attributes['tournament'].bankroll, (err, rank) => {
    // Let them know their current rank
    let speech = '';

    if (rank) {
      let togo = '';

      if (rank.delta > 0) {
        togo = res.strings.TOURNAMENT_STANDING_TOGO.replace('{0}', rank.americanDelta).replace('{1}', rank.americanRank - 1);
      }

      // If they haven't played, just tell them the number of players
      if (attributes['tournament'].spins > 0) {
        speech += res.strings.TOURNAMENT_STANDING.replace('{0}', rank.rank);
        speech += togo;
      }
    }

    callback(speech);
  });
}

function getTournamentRankFromS3(bankroll, callback) {
  let higher;

  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'TournamentRouletteScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, null);
    } else {
      const standings = JSON.parse(data.Body.toString('ascii'));

      for (higher = 0; higher < scores.scores.length; higher++) {
        if (standings.scores[higher] <= bankroll) {
          break;
        }
      }

      // Also let them know how much it takes to move up a position
      callback(null, {rank: (higher + 1),
          delta: (higher > 0) ? (standings.scores[higher - 1] - bankroll) : 0,
          players: standings.scores.length});
    }
  });
}
