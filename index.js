//
// Main handler for Alexa roulette skill
//

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const BetNumbers = require('./intents/BetNumbers');
const BetBlack = require('./intents/BetBlack');
const BetRed = require('./intents/BetRed');
const BetEven = require('./intents/BetEven');
const BetOdd = require('./intents/BetOdd');
const BetColumn = require('./intents/BetColumn');
const BetDozen = require('./intents/BetDozen');
const BetHigh = require('./intents/BetHigh');
const BetLow = require('./intents/BetLow');
const Spin = require('./intents/Spin');
const Rules = require('./intents/Rules');
const Help = require('./intents/Help');
const Stop = require('./intents/Stop');
const Cancel = require('./intents/Cancel');
const Launch = require('./intents/Launch');

const APP_ID = 'amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04';

// Handlers for our skill
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
      console.log('New session started SessionEndedRequest');
      this.emit(':tell', 'Thanks for playing.  Goodbye.');
    } else {
      console.log('New session started ' + this.event.request.locale + ': Launch');
      this.emit('LaunchRequest');
    }
  },
  'LaunchRequest': Launch.handleIntent,
  'NumbersIntent': BetNumbers.handleIntent,
  'BlackIntent': BetBlack.handleIntent,
  'RedIntent': BetRed.handleIntent,
  'EvenIntent': BetEven.handleIntent,
  'OddIntent': BetOdd.handleIntent,
  'HighIntent': BetHigh.handleIntent,
  'LowIntent': BetLow.handleIntent,
  'ColumnIntent': BetColumn.handleIntent,
  'DozenIntent': BetDozen.handleIntent,
  'SpinIntent': Spin.handleIntent,
  'RulesIntent': Rules.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Stop.handleIntent,
  'AMAZON.CancelIntent': Cancel.handleIntent,
  'SessionEndedRequest': function() {
    console.log('In SessionEndedRequest');
    this.emit(':tell', 'Thanks for playing.  Goodbye.');
  },
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t get that. Try saying Bet on red.', 'Try saying Bet on red.');
  },
};

exports.handler = function(event, context, callback) {
  AWS.config.update({region: 'us-east-1'});

  const alexa = Alexa.handler(event, context);

  alexa.APP_ID = APP_ID;
  alexa.dynamoDBTableName = 'RouletteWheel';
  alexa.registerHandlers(handlers);
  alexa.execute();
};
