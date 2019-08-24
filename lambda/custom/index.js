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
const Repeat = require('./intents/Repeat');
const HighScore = require('./intents/HighScore');
const SessionEnd = require('./intents/SessionEnd');
const TournamentJoin = require('./intents/TournamentJoin');
const OldTimeOut = require('./intents/OldTimeOut');
const Reprompt = require('./intents/Reprompt');
const ProductResponse = require('./intents/ProductResponse');
const Purchase = require('./intents/Purchase');
const ListPurchase = require('./intents/ListPurchase');
const Refund = require('./intents/Refund');
const Unhandled = require('./intents/Unhandled');
const utils = require('./utils');
const request = require('request');
const tournament = require('./tournament');
const buttons = require('./buttons');
const {JargonSkillBuilder} = require('@jargon/alexa-skill-sdk');

const requestInterceptor = {
  process(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const event = handlerInput.requestEnvelope;
    let attributes;

    if ((Object.keys(sessionAttributes).length === 0) ||
      ((Object.keys(sessionAttributes).length === 1)
        && sessionAttributes.platform)) {
      // No session attributes - so get the persistent ones
      return attributesManager.getPersistentAttributes()
      .then((attr) => {
        // Since there were no session attributes, this is the first
        // round of the session
        attributes = attr;
        attributes.temp = {};
        attributes.temp.newSession = true;
        attributes.sessions = (attributes.sessions + 1) || 1;
        attributes.platform = sessionAttributes.platform;
        return tournament.getTournamentComplete(event.request.locale, attributes)
        .then((result) => {
          attributes.temp.tournamentResult = result;
          console.log('Tournament result is', result);

          // If no persistent attributes, it's a new player
          utils.migrateAttributes(attributes, event.request.locale);
          if (!attributes.currentGame) {
            attributes.playerLocale = event.request.locale;
            request.post({url: process.env.SERVICEURL + 'roulette/newUser'}, (err, res, body) => {
            });
          }

          // If you haven't played a tournament before ... now you have to pay
          attributes.needsToBuyTournament = !attributes.tournamentsPlayed &&
            ((event.request.locale === 'en-US') || (event.request.locale === 'en-GB'));
          attributesManager.setSessionAttributes(attributes);
        });
      });
    } else {
      return Promise.resolve();
    }
  },
};

const saveResponseInterceptor = {
  process(handlerInput) {
    const response = handlerInput.responseBuilder.getResponse();
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if (response) {
      return utils.drawTable(handlerInput)
      .then(() => {
        if (attributes.temp) {
          if (attributes.temp.tournamentResult) {
            if (response.outputSpeech.ssml && (response.outputSpeech.ssml.indexOf('<speak>') === 0)) {
              // Splice this into the start of the string
              response.outputSpeech.ssml = '<speak>' + attributes.temp.tournamentResult
                + response.outputSpeech.ssml.substring(7);
            }
            attributes.temp.tournamentResult = undefined;
          }
          if (attributes.temp.newSession) {
            // Set up the buttons to all flash, welcoming the user to press a button
            buttons.addLaunchAnimation(handlerInput);
            buttons.buildButtonDownAnimationDirective(handlerInput, []);
            buttons.startInputHandler(handlerInput, 20000);
            attributes.temp.newSession = undefined;
          }
        }

        if (response.shouldEndSession) {
          // We are meant to end the session
          SessionEnd.handle(handlerInput);
        } else {
          // Save the response and reprompt for repeat
          if (response.outputSpeech && response.outputSpeech.ssml) {
            // Strip <speak> tags
            let lastResponse = response.outputSpeech.ssml;
            lastResponse = lastResponse.replace('<speak>', '');
            lastResponse = lastResponse.replace('</speak>', '');
            attributes.temp.lastResponse = lastResponse;
          }
          if (response.reprompt && response.reprompt.outputSpeech
            && response.reprompt.outputSpeech.ssml) {
            let lastReprompt = response.reprompt.outputSpeech.ssml;
            lastReprompt = lastReprompt.replace('<speak>', '');
            lastReprompt = lastReprompt.replace('</speak>', '');
            attributes.temp.lastReprompt = lastReprompt;
          }

          if (attributes.temp) {
            if (attributes.temp.deferReprompt === 'DEFER') {
              // Oh, actually we don't want to reprompt but will
              // rely on the button timeout to handle a reprompt
              response.reprompt = undefined;
              attributes.temp.deferReprompt = 'PENDING';

              // If should end session is true, set it to false
              if (response.shouldEndSession) {
                handlerInput.responseBuilder.withShouldEndSession(false);
              }
            } else {
              // Clear the flag so any errant input handler reprompt
              // timeout events are ignored
              attributes.temp.deferReprompt = undefined;
            }
          }
        }

        // Do we have Connections.SendRequest? If so, just send that
        let idx = -1;
        if (response.directives) {
          response.directives.forEach((d, i) => {
            if (d.type === 'Connections.SendRequest') {
              idx = i;
            }
          });
        }
        if (idx > -1) {
          response.directives = [response.directives[idx]];
        }

        if (!process.env.NOLOG) {
          console.log(JSON.stringify(response));
        }
      });
    } else {
      return Promise.resolve();
    }
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
  // If this is a CanFulfill, handle this separately
  if (event.request && (event.request.type == 'CanFulfillIntentRequest')) {
    callback(null, CanFulfill.check(event));
    return;
  }

  // If this is German or Spanish, we will forward to the legacy lambda to fulfill
  const langs = event.request.locale.split('-');
  if (langs[0] !== 'en') {
    const AWS = require('aws-sdk');
    AWS.config.update({region: 'us-east-1'});
    const Lambda = new AWS.Lambda();

    console.log('Forwarding ' + event.request.locale + ' event to legacy.');
    Lambda.invoke({FunctionName: 'Roulette_Legacy', Payload: JSON.stringify(event)}, (err, data) => {
      let alexaResponse;
      if (data && data.Payload) {
        alexaResponse = JSON.parse(data.Payload);
      }
      callback(err, alexaResponse);
    });
    return;
  }

  const skillBuilder = new JargonSkillBuilder().wrap(Alexa.SkillBuilders.custom());

  if (!process.env.NOLOG) {
    console.log(JSON.stringify(event));
  }

  const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
  const dbAdapter = new DynamoDbPersistenceAdapter({
    tableName: 'RouletteWheel',
    partitionKeyName: 'userId',
    attributesName: 'mapAttr',
  });
  const skillFunction = skillBuilder.addRequestHandlers(
      Launch,
      ProductResponse,
      TournamentJoin,
      OldTimeOut,
      Reprompt,
      Purchase,
      ListPurchase,
      Refund,
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
    .withPersistenceAdapter(dbAdapter)
    .withApiClient(new Alexa.DefaultApiClient())
//    .withSkillId('amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04')
    .lambda();
  skillFunction(event, context, (err, response) => {
    callback(err, response);
  });
}
