//
// Main handler for Alexa roulette skill
//

'use strict';

const BetSingleNumber = require('./intents/BetSingleNumber');
const BetBlack = require('./intents/BetBlack');
const BetRed = require('./intents/BetRed');
const BetEven = require('./intents/BetEven');
const BetOdd = require('./intents/BetOdd');
const Spin = require('./intents/Spin');

//
// See https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference
// for documentation about the response object
//
function buildResponse(session, speech, shouldEndSession, reprompt)
{
  let alexaResponse = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: speech
      },
      shouldEndSession: shouldEndSession
    }
  };

  alexaResponse.sessionAttributes = session.attributes;

  // Reprompt is the text Alexa will speak if the user doesn't respond to
  // the prompt in a certain amount of time
  if (reprompt) {
    alexaResponse.response.reprompt = {
      outputSpeech: {
        type: 'PlainText',
        text: reprompt
        }
    };
  }

  return alexaResponse;
}

function IntentResponse(session, context, speechError, speech, reprompt)
{
  let response;
  let shouldEndSession = (reprompt ? true : false);

  if (speechError) {
    response = buildResponse(session, speechError, shouldEndSession, reprompt);
  } else {
    // And add a card
    response = buildResponse(session, speech, shouldEndSession, reprompt);
  }

  context.succeed(response);
}

function onLaunch(request, context)
{
  let speech = 'Welcome to Roulette Wheel. You can place a bet on individual numbers, red or block, even or odd, and groups of numbers. Place your bets!';
  let reprompt = 'You can place a bet by saying bet on red, bet on six, or bet on the first dozen';

  let response = buildResponse(speech, false, reprompt);
  context.succeed(response);
}

function onSessionEnded(request, context)
{
  context.succeed();
}

function onIntent(request, context, session)
{
  switch (request.intent.name) {
    case 'SingleNumberIntent':
      BetSingleNumber.HandleIntent(request.intent, session, context, IntentResponse);
      break;
    case 'BlackIntent':
      BetBlack.HandleIntent(request.intent, session, context, IntentResponse);
      break;
    case 'RedIntent':
      BetRed.HandleIntent(request.intent, session, context, IntentResponse);
      break;
    case 'EvenIntent':
      BetEven.HandleIntent(request.intent, session, context, IntentResponse);
      break;
    case 'OddIntent':
      BetOdd.HandleIntent(request.intent, session, context, IntentResponse);
      break;
    case 'SpinIntent':
      Spin.HandleIntent(request.intent, session, context, IntentResponse);
      break;
    default:
      throw('Unknown intent ' + request.intent.name);
  }
}

exports.handler = function (event, context)
{
  try {
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
