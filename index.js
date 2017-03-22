//
// Main handler for Alexa roulette skill
//

'use strict';

const BetSingleNumber = require('./intents/BetSingleNumber');
const BetSplit = require('./intents/BetSplit');
const BetCorner = require('./intents/BetCorner');
const BetBlack = require('./intents/BetBlack');
const BetRed = require('./intents/BetRed');
const BetEven = require('./intents/BetEven');
const BetOdd = require('./intents/BetOdd');
const BetColumn = require('./intents/BetColumn');
const BetDozen = require('./intents/BetDozen');
const Spin = require('./intents/Spin');

function buildResponse(session, speech, speechSSML, shouldEndSession, reprompt, cardContent) {
  const alexaResponse = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: speech,
      },
      shouldEndSession: shouldEndSession,
    },
  };

  if (speechSSML) {
    alexaResponse.response.outputSpeech.type = 'SSML';
    alexaResponse.response.outputSpeech.ssml = speechSSML;
  }

  if (session && session.attributes) {
    alexaResponse.sessionAttributes = session.attributes;
  }

  if (cardContent) {
    alexaResponse.response.card = {
        type: 'Simple',
        title: 'Roulette Wheel',
        content: cardContent,
    };
  }

  // Reprompt is the text Alexa will speak if the user doesn't respond to
  // the prompt in a certain amount of time
  if (reprompt) {
    alexaResponse.response.reprompt = {
      outputSpeech: {
        type: 'PlainText',
        text: reprompt,
        },
    };
  }

  return alexaResponse;
}

function intentResponse(session, context, speechError, speech, speechSSML, reprompt) {
  let response;
  const shouldEndSession = (reprompt ? false : true);

  if (speechError) {
    response = buildResponse(session, speechError, null, shouldEndSession, reprompt);
  } else {
    // Use speech as the card content too
    response = buildResponse(session, speech, speechSSML, shouldEndSession, reprompt, speech);
  }

  context.succeed(response);
}

function onLaunch(request, context) {
  const speech = 'Welcome to Roulette Wheel. You can place a bet on individual numbers, red or block, even or odd, and groups of numbers. Place your bets!';
  const reprompt = 'You can place a bet by saying bet on red, bet on six, or bet on the first dozen';

  const response = buildResponse(null, speech, null, false, reprompt);
  context.succeed(response);
}

function onSessionEnded(request, context) {
  context.succeed();
}

function onIntent(request, context, session) {
  // If there is no bankroll, set it to 1000
  if ((session.attributes.bankroll === undefined) || (session.attributes.bankroll === null)) {
    session.attributes.bankroll = 1000;
  }

  console.log(request.intent.name + ' with slots ' + JSON.stringify(request.intent.slots));
  switch (request.intent.name) {
    case 'SingleNumberIntent':
      BetSingleNumber.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'SplitIntent':
      BetSplit.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'CornerIntent':
      BetCorner.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'BlackIntent':
      BetBlack.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'RedIntent':
      BetRed.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'EvenIntent':
      BetEven.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'OddIntent':
      BetOdd.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'ColumnIntent':
      BetColumn.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'DozenIntent':
      BetDozen.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'SpinIntent':
      Spin.handleIntent(request.intent, session, context, intentResponse);
      break;
    case 'AMAZON.HelpIntent':
      const helpText = 'You can place a bet by saying phrases like bet on red, bet on six, or bet on the first dozen. Say spin the wheel to spin after you place your bets.';
      intentResponse(session, context, null, helpText, helpText);
      break;
    default:
      console.log('Unknown intent ' + request.intent.name);
      break;
  }
}

exports.handler = function(event, context) {
  try {
    if (!event.session || !event.session.application || !event.session.application.applicationId ||
      (event.session.application.applicationId != 'amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04')) {
      throw new Error('Invalid application ID');
    }

    switch (event.request.type) {
      case 'LaunchRequest':
        onLaunch(event.request, context);
        break;
      case 'SessionEndedRequest':
        onSessionEnded(event.request, context);
        break;
      case 'IntentRequest':
        onIntent(event.request, context, event.session);
        break;
    }
  } catch(e) {
    console.log('Unexpected exception ' + e);
    context.fail(e);
  }
};
