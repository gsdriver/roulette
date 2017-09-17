//
// Main handler for Alexa roulette skill
//

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const BetNumbers = require('./intents/BetNumbers');
const OutsideBet = require('./intents/OutsideBet');
const Spin = require('./intents/Spin');
const Rules = require('./intents/Rules');
const Help = require('./intents/Help');
const Stop = require('./intents/Stop');
const Cancel = require('./intents/Cancel');
const Launch = require('./intents/Launch');
const Reset = require('./intents/Reset');
const HighScore = require('./intents/HighScore');
const Survey = require('./intents/Survey');
const tournament = require('./tournament');
const utils = require('./utils');
const request = require('request');

const APP_ID = 'amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04';

// Handlers for our skill
const resetHandlers = Alexa.CreateStateHandler('CONFIRMRESET', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'LaunchRequest': Reset.handleNoReset,
  'AMAZON.YesIntent': Reset.handleYesReset,
  'AMAZON.NoIntent': Reset.handleNoReset,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Reset.handleNoReset,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
              res.strings.UNKNOWNINTENT_RESET, res.strings.UNKNOWNINTENT_RESET_REPROMPT);
  },
});

const surveyOfferHandlers = Alexa.CreateStateHandler('SURVEYOFFERED', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'AMAZON.YesIntent': Survey.handleStartIntent,
  'AMAZON.NoIntent': Survey.handlePassIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Survey.handlePassIntent,
  'AMAZON.CancelIntent': Survey.handlePassIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    // Anything else, flip to INGAME and continue
    this.handler.state = 'INGAME';
    this.emitWithState(this.event.request.intent.name);
  },
});

const inSurveyHandlers = Alexa.CreateStateHandler('INSURVEY', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'AMAZON.YesIntent': Survey.handleYesIntent,
  'AMAZON.NoIntent': Survey.handleNoIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Survey.handlePassIntent,
  'AMAZON.CancelIntent': Survey.handlePassIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
              res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
});

const inGameHandlers = Alexa.CreateStateHandler('INGAME', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'LaunchRequest': Launch.handleIntent,
  'NumbersIntent': BetNumbers.handleIntent,
  'BlackIntent': OutsideBet.handleIntent,
  'RedIntent': OutsideBet.handleIntent,
  'EvenIntent': OutsideBet.handleIntent,
  'OddIntent': OutsideBet.handleIntent,
  'HighIntent': OutsideBet.handleIntent,
  'LowIntent': OutsideBet.handleIntent,
  'ColumnIntent': OutsideBet.handleIntent,
  'DozenIntent': OutsideBet.handleIntent,
  'SpinIntent': Spin.handleIntent,
  'RulesIntent': Rules.handleIntent,
  'ResetIntent': Reset.handleIntent,
  'HighScoreIntent': HighScore.handleIntent,
  'AMAZON.YesIntent': Spin.handleIntent,
  'AMAZON.NoIntent': Cancel.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Cancel.handleIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
              res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
});

const handlers = {
  'NewSession': function() {
    utils.migrateAttributes(this.attributes, this.event.request.locale);

    tournament.getTournamentComplete(this.event.request.locale, this.attributes, (result) => {
      // If there is an active tournament, go to the start tournament state
      if (tournament.canEnterTournament(this.attributes)) {
        // Great, enter the tournament!
        this.handler.state = 'JOINTOURNAMENT';
        tournament.promptToEnter(this.event.request.locale, this.attributes, (speech, reprompt) => {
          utils.emitResponse(this.emit, this.event.request.locale,
                null, null, result + speech, reprompt);
        });
      } else {
        if (result && (result.length > 0)) {
          this.attributes.tournamentResult = result;
        }
        if (this.event.request.type === 'IntentRequest') {
          this.emit(this.event.request.intent.name);
        } else {
          this.emit('LaunchRequest');
        }
      }
    });
  },
  'LaunchRequest': Launch.handleIntent,
  'NumbersIntent': BetNumbers.handleIntent,
  'BlackIntent': OutsideBet.handleIntent,
  'RedIntent': OutsideBet.handleIntent,
  'EvenIntent': OutsideBet.handleIntent,
  'OddIntent': OutsideBet.handleIntent,
  'HighIntent': OutsideBet.handleIntent,
  'LowIntent': OutsideBet.handleIntent,
  'ColumnIntent': OutsideBet.handleIntent,
  'DozenIntent': OutsideBet.handleIntent,
  'SpinIntent': Spin.handleIntent,
  'RulesIntent': Rules.handleIntent,
  'ResetIntent': Reset.handleIntent,
  'HighScoreIntent': HighScore.handleIntent,
  'AMAZON.YesIntent': Spin.handleIntent,
  'AMAZON.NoIntent': Cancel.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Cancel.handleIntent,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
            res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
};

// These states are only accessible during tournament play
const joinHandlers = Alexa.CreateStateHandler('JOINTOURNAMENT', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'LaunchRequest': tournament.handlePass,
  'AMAZON.YesIntent': tournament.handleJoin,
  'AMAZON.NoIntent': tournament.handlePass,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': tournament.handlePass,
  'SessionEndedRequest': function() {
    saveState(this.event.session.user.userId, this.attributes);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    utils.emitResponse(this.emit, this.event.request.locale, null, null,
              res.strings.UNKNOWNINTENT_RESET, res.strings.UNKNOWNINTENT_RESET_REPROMPT);
  },
});

exports.handler = function(event, context, callback) {
  AWS.config.update({region: 'us-east-1'});

  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;
  if (!event.session.sessionId || event.session['new']) {
    const doc = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    doc.get({TableName: 'RouletteWheel',
            ConsistentRead: true,
            Key: {userId: event.session.user.userId}},
            (err, data) => {
      if (err || (data.Item === undefined)) {
        if (err) {
          console.log('Error reading attributes ' + err);
        } else {
          request.post({url: process.env.SERVICEURL + 'roulette/newUser'}, (err, res, body) => {
          });
        }
      } else {
        Object.assign(event.session.attributes, data.Item.mapAttr);
      }

      execute();
    });
  } else {
    execute();
  }

  function execute() {
    utils.setEvent(event);
    alexa.registerHandlers(handlers, surveyOfferHandlers, inSurveyHandlers,
          joinHandlers, resetHandlers, inGameHandlers);
    alexa.execute();
  }
};

function saveState(userId, attributes) {
  const formData = {};

  formData.savedb = JSON.stringify({
    userId: userId,
    attributes: attributes,
  });

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
