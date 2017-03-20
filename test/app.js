var mainApp = require('../index');

function BuildEvent(argv)
{
  // Templates that can fill in the intent
  var singleNumber = {'name': 'SingleNumberIntent', 'slots': {'Number': {'name': 'Number', 'value': ''},
                  'Amount': {'name': 'Amount', 'value': ''}}};
  var black = {'name': 'BlackIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var red = {'name': 'RedIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var even = {'name': 'EvenIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var odd = {'name': 'OddIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var column = {'name': 'ColumnIntent', 'slots': {'Ordinal': {'name': 'Ordinal', 'value': ''},
                    'Amount': {'name': 'Amount', 'value': ''}}};
  var dozen = {'name': 'DozenIntent', 'slots': {'Ordinal': {'name': 'Ordinal', 'value': ''},
                    'Amount': {'name': 'Amount', 'value': ''}}};
  var spin = {'name': 'SpinIntent', 'slots': {}};

  var lambda = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04"
      },
      //"attributes": {},
      //"attributes": {"bets":[{"amount":5,"numbers":[20],"type":"SingleNumber"}]},
      //"attributes": {"bets":[{"amount":5,"numbers":[2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],"type":"Black"},{"amount":5,"numbers":[20],"type":"SingleNumber"}]},
      //"attributes" : {"bets":[{"amount":"6","numbers":[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36],"type":"Even"}]},
      "attributes" : {"bets":null,"bankroll":50,"lastbets":[{"amount":"40","numbers":[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36],"type":"Even"}]},
      "user": {
        "userId": "amzn1.ask.account.AFLJ3RYNI3X6MQMX4KVH52CZKDSI6PMWCQWRBHSPJJPR2MKGDNJHW36XF2ET6I2BFUDRKH3SR2ACZ5VCRLXLGJFBTQGY4RNYZA763JED57USTK6F7IRYT6KR3XYO2ZTKK55OM6ID2WQXQKKXJCYMWXQ74YXREHVTQ3VUD5QHYBJTKHDDH5R4ALQAGIQKPFL52A3HQ377WNCCHYI"
      },
      "new": true
    },
    "request": {
      "type": "IntentRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  var openEvent = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04"
      },
      "attributes": {},
      "user": {
        "userId": "amzn1.ask.account.AFLJ3RYNI3X6MQMX4KVH52CZKDSI6PMWCQWRBHSPJJPR2MKGDNJHW36XF2ET6I2BFUDRKH3SR2ACZ5VCRLXLGJFBTQGY4RNYZA763JED57USTK6F7IRYT6KR3XYO2ZTKK55OM6ID2WQXQKKXJCYMWXQ74YXREHVTQ3VUD5QHYBJTKHDDH5R4ALQAGIQKPFL52A3HQ377WNCCHYI"
      },
      "new": true
    },
    "request": {
      "type": "LaunchRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  // If there is no argument, then we'll just return
  if (argv.length <= 2) {
    console.log('I need some parameters');
    return null;
  } else if (argv[2] == 'betsingle') {
    lambda.request.intent = singleNumber;
    if (argv.length > 3) {
      singleNumber.slots.Number.value = argv[3];
    }
    if (argv.length > 4) {
      singleNumber.slots.Amount.value = argv[4];
    }
  } else if (argv[2] == 'betcolumn') {
    lambda.request.intent = column;
    if (argv.length > 3) {
      column.slots.Ordinal.value = argv[3];
    }
    if (argv.length > 4) {
      column.slots.Amount.value = argv[4];
    }
  } else if (argv[2] == 'betdozen') {
    lambda.request.intent = dozen;
    if (argv.length > 3) {
      dozen.slots.Ordinal.value = argv[3];
    }
    if (argv.length > 4) {
      dozen.slots.Amount.value = argv[4];
    }
  } else if (argv[2] == 'betblack') {
    lambda.request.intent = black;
    if (argv.length > 3) {
      black.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'betred') {
    lambda.request.intent = red;
    if (argv.length > 3) {
      red.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'betodd') {
    lambda.request.intent = odd;
    if (argv.length > 3) {
      odd.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'beteven') {
    lambda.request.intent = even;
    if (argv.length > 3) {
      even.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'spin') {
    lambda.request.intent = spin;
  } else if (argv[2] == 'launch') {
    return openEvent;
  }
  else {
    console.log(argv[2] + ' was not valid');
    return null;
  }

  return lambda;
}

// Simple response - just print out what I'm given
function myResponse(appId) {
  this._appId = appId;
}

myResponse.succeed = function(result) {
  if (result.response.outputSpeech.ssml) {
    console.log('AS SSML: ' + result.response.outputSpeech.ssml);
  } else {
    console.log(result.response.outputSpeech.text);
  }
  console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
  if (result.sessionAttributes) {
    console.log('Attributes: ' + JSON.stringify(result.sessionAttributes));
  }
}

myResponse.fail = function(e) {
  console.log(e);
}

// Build the event object and call the app
var event = BuildEvent(process.argv);
if (event) {
    mainApp.handler(event, myResponse);
}