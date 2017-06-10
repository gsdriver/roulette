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
const tournament = require('./tournament');

const APP_ID = 'amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04';

// Handlers for our skill
const resetHandlers = Alexa.CreateStateHandler('CONFIRMRESET', {
  'LaunchRequest': Reset.handleNoReset,
  'AMAZON.YesIntent': Reset.handleYesReset,
  'AMAZON.NoIntent': Reset.handleNoReset,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Reset.handleNoReset,
  'SessionEndedRequest': function() {
    tournament.endSession(this.attributes);
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    this.emit(':ask', res.strings.UNKNOWNINTENT_RESET, res.strings.UNKNOWNINTENT_RESET_REPROMPT);
  },
});

const inGameHandlers = Alexa.CreateStateHandler('INGAME', {
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
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Cancel.handleIntent,
  'SessionEndedRequest': function() {
    tournament.endSession(this.attributes);
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    this.emit(':ask', res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
});

// These states are only accessible during tournament play
const joinHandlers = Alexa.CreateStateHandler('JOINTOURNAMENT', {
  'LaunchRequest': tournament.handlePass,
  'AMAZON.YesIntent': tournament.handleJoin,
  'AMAZON.NoIntent': tournament.handlePass,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': tournament.handlePass,
  'SessionEndedRequest': function() {
    tournament.endSession(this.attributes);
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    this.emit(':ask', res.strings.UNKNOWNINTENT_RESET, res.strings.UNKNOWNINTENT_RESET_REPROMPT);
  },
});

const tournamentHandlers = Alexa.CreateStateHandler('TOURNAMENT', {
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
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Cancel.handleIntent,
  'SessionEndedRequest': function() {
    tournament.endSession(this.attributes);
    this.emit(':saveState', true);
  },
  'RulesIntent': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    this.emit(':ask', res.strings.TOURNAMENT_NOCHANGERULES, res.strings.TOURNAMENT_INVALIDACTION_REPROMPT);
  },
  'ResetIntent': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    this.emit(':ask', res.strings.TOURNAMENT_NORESET, res.strings.TOURNAMENT_INVALIDACTION_REPROMPT);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    this.emit(':ask', res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
});

const handlers = {
  'NewSession': function() {
    // If attributes aren't set, set them
    if (this.attributes['bankroll'] == undefined) {
      this.attributes['bankroll'] = 1000;
    }
    if (this.attributes['doubleZeroWheel'] == undefined) {
      this.attributes['doubleZeroWheel'] = (this.event.request.locale == 'en-US');
    }
    if (this.attributes['highScore'] == undefined) {
      this.attributes['highScore'] = {
        currentAmerican: 1000,
        currentEuropean: 1000,
        highAmerican: 1000,
        highEuropean: 1000,
        spinsAmerican: 0,
        spinsEuropean: 0,
        timestamp: Date.now(),
      };
    }

    if (this.event.request.type === 'IntentRequest') {
      // Set the state and route accordingly
      console.log('New session started ' + this.event.request.locale + ': ' + JSON.stringify(this.event.request.intent));
      this.emit(this.event.request.intent.name);
    } else if (this.event.request.type == 'SessionEndedRequest') {
      // Odd, but whatever
      this.emit('SessionEndedRequest');
    } else {
      console.log('New session started ' + this.event.request.locale + ': Launch');
      this.emit('LaunchRequest');
    }
  },
  // Some intents don't make sense for a new session - so just launch instead
  'LaunchRequest': Launch.handleIntent,
  'RulesIntent': Launch.handleIntent,
  'ResetIntent': Launch.handleIntent,
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
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Cancel.handleIntent,
  'SessionEndedRequest': function() {
    tournament.endSession(this.attributes);
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    const res = require('./' + this.event.request.locale + '/resources');
    this.emit(':ask', res.strings.UNKNOWN_INTENT, res.strings.UNKNOWN_INTENT_REPROMPT);
  },
};

exports.handler = function(event, context, callback) {
  // Small enough volume for me to just write the incoming request
  if (event) {
    console.log(JSON.stringify(event.request));
  }

  AWS.config.update({region: 'us-east-1'});

  const alexa = Alexa.handler(event, context);

  alexa.APP_ID = APP_ID;
  alexa.dynamoDBTableName = 'RouletteWheel';
  tournament.registerHandlers(alexa, handlers, joinHandlers,
    tournamentHandlers, resetHandlers, inGameHandlers);

  alexa.execute();
};
