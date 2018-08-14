//
// Main handler for Alexa roulette skill
//

'use strict';

const Alexa = require('ask-sdk');
const CanFulfill = require('./intents/CanFulfill');
const BetNumbers = require('./intents/BetNumbers');
const OutsideBet = require('./intents/OutsideBet');
const Spin = require('./intents/Spin');
const Rules = require('./intents/Rules');
const Help = require('./intents/Help');
const Stop = require('./intents/Stop');
const Cancel = require('./intents/Cancel');
const Launch = require('./intents/Launch');
const Reset = require('./intents/Reset');
const ResetResponse = require('./intents/ResetResponse');
const Repeat = require('./intents/Repeat');
const HighScore = require('./intents/HighScore');
const SessionEnd = require('./intents/SessionEnd');
const TournamentJoin = require('./intents/TournamentJoin');
const Unhandled = require('./intents/Unhandled');
const utils = require('./utils');
const request = require('request');

let responseBuilder;

const requestInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      const attributesManager = handlerInput.attributesManager;
      const sessionAttributes = attributesManager.getSessionAttributes();
      const event = handlerInput.requestEnvelope;

      if ((Object.keys(sessionAttributes).length === 0) ||
        ((Object.keys(sessionAttributes).length === 1)
          && sessionAttributes.platform)) {
        // No session attributes - so get the persistent ones
        attributesManager.getPersistentAttributes()
          .then((attributes) => {
            // If no persistent attributes, it's a new player
            utils.migrateAttributes(attributes, event.request.locale);
            if (!attributes.currentGame) {
              attributes.playerLocale = event.request.locale;
              request.post({url: process.env.SERVICEURL + 'roulette/newUser'}, (err, res, body) => {
              });
            }

            // Since there were no session attributes, this is the first
            // round of the session - set the temp attributes
            attributes.temp = {};
            attributes.sessions = (attributes.sessions + 1) || 1;
            attributes.platform = sessionAttributes.platform;
            attributesManager.setSessionAttributes(attributes);
            responseBuilder = handlerInput.responseBuilder;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        responseBuilder = handlerInput.responseBuilder;
        resolve();
      }
    });
  },
};

const saveResponseInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      const response = handlerInput.responseBuilder.getResponse();

      if (response) {
        utils.drawTable(handlerInput);
        if (response.shouldEndSession) {
          // We are meant to end the session
          SessionEnd.handle(handlerInput);
        }
      }
      resolve();
    });
  },
};

const ErrorHandler = {
  canHandle(handlerInput, error) {
    console.log(error);
    return error.name.startsWith('AskSdk');
  },
  handle(handlerInput, error) {
    return handlerInput.responseBuilder
      .speak('An error was encountered while handling your request. Try again later')
      .getResponse();
  },
};

if (process.env.DASHBOTKEY) {
  const dashbot = require('dashbot')(process.env.DASHBOTKEY).alexa;
  exports.handler = dashbot.handler(runGame);
} else {
  exports.handler = runGame;
}

function runGame(event, context, callback) {
  const skillBuilder = Alexa.SkillBuilders.standard();

  if (!process.env.NOLOG) {
    console.log(JSON.stringify(event));
  }

  // If this is a CanFulfill, handle this separately
  if (event.request && (event.request.type == 'CanFulfillIntentRequest')) {
    callback(null, CanFulfill.check(event));
    return;
  }

  const skillFunction = skillBuilder.addRequestHandlers(
      Launch,
      Reset,
      ResetResponse,
      TournamentJoin,
      OutsideBet,
      BetNumbers,
      Spin,
      Repeat,
      Rules,
      HighScore,
      Help,
      Stop,
      Cancel,
      SessionEnd,
      Unhandled
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(requestInterceptor)
    .addResponseInterceptors(saveResponseInterceptor)
    .withTableName('RouletteWheel')
    .withAutoCreateTable(true)
    .withSkillId('amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04')
    .lambda();
  skillFunction(event, context, (err, response) => {
    if (response) {
      response.response = responseBuilder.getResponse();
    }
    callback(err, response);
  });
}
