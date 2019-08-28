var mainApp = require('./index');

const attributeFile = 'attributes.txt';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const fs = require('fs');

const sessionId = "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fb4";
const LOCALE = "en-US";
const APPID = "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04";
const APITOKEN = '';
const USERID = "not-amazon";

function BuildEvent(argv)
{
  // Templates that can fill in the intent
  var numbers = {'name': 'NumbersIntent', 'slots': {'FirstNumber': {'name': 'FirstNumber', 'value': ''},
                  'SecondNumber': {'name': 'SecondNumber', 'value': ''},
                  'ThirdNumber': {'name': 'ThirdNumber', 'value': ''},
                  'FourthNumber': {'name': 'FourthNumber', 'value': ''},
                  'FifthNumber': {'name': 'FifthNumber', 'value': ''},
                  'SixthNumber': {'name': 'SixthNumber', 'value': ''},
                  'Amount': {'name': 'Amount', 'value': ''}}};
  var black = {'name': 'BlackIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var red = {'name': 'RedIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var even = {'name': 'EvenIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var odd = {'name': 'OddIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var high = {'name': 'HighIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var low = {'name': 'LowIntent', 'slots': {'Amount': {'name': 'Amount', 'value': ''}}};
  var column = {'name': 'ColumnIntent', 'slots': {'Ordinal': {'name': 'Ordinal', 'value': ''},
                    'Amount': {'name': 'Amount', 'value': ''}}};
  var dozen = {'name': 'DozenIntent', 'slots': {'Ordinal': {'name': 'Ordinal', 'value': ''},
                    'Amount': {'name': 'Amount', 'value': ''}}};
  var spin = {'name': 'SpinIntent', 'slots': {}};
  var rules = {'name': 'RulesIntent', 'slots': {'Rules': {'name': 'Rules', 'value': ''}}};
  var reset = {'name': 'ResetIntent', 'slots': {}};
  var repeat = {'name': 'AMAZON.RepeatIntent', 'slots': {}};
  var yes = {'name': 'AMAZON.YesIntent', 'slots': {}};
  var no = {'name': 'AMAZON.NoIntent', 'slots': {}};
  var help = {'name': 'AMAZON.HelpIntent', 'slots': {}};
  var stop = {'name': 'AMAZON.StopIntent', 'slots': {}};
  var cancel = {'name': 'AMAZON.CancelIntent', 'slots': {}};
  var highScore = {'name': 'HighScoreIntent', 'slots': {}};

  var lambda = {
    "session": {
      "sessionId": sessionId,
      "application": {
        "applicationId": APPID,
      },
      "attributes": {},
      "user": {
        "userId": USERID,
      },
      "new": false
    },
    "request": {
      "type": "IntentRequest",
      "requestId": "EdwRequestId.12",
      "locale": LOCALE,
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0",
     "context": {
       "AudioPlayer": {
         "playerActivity": "IDLE"
       },
       "Display": {},
       "System": {
         "application": {
           "applicationId": APPID
         },
         "user": {
           "userId": USERID,
         },
         "device": {
           "deviceId": USERID,
           "supportedInterfaces": {
             "AudioPlayer": {},
             "Display": {
               "templateVersion": "1.0",
               "markupVersion": "1.0"
             }
           }
         },
         "apiEndpoint": "https://api.amazonalexa.com",
         "apiAccessToken": "",
       }
     },
  };

  var openEvent = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": APPID
      },
      "user": {
        "userId": USERID
      },
      "new": true
    },
    "request": {
      "type": "LaunchRequest",
      "requestId": "EdwRequestId.12",
      "locale": LOCALE,
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0",
     "context": {
       "AudioPlayer": {
         "playerActivity": "IDLE"
       },
       "Display": {},
       "System": {
         "application": {
           "applicationId": APPID
         },
         "user": {
           "userId": USERID
         },
         "device": {
           "deviceId": USERID,
           "supportedInterfaces": {
             "AudioPlayer": {},
             "Display": {
               "templateVersion": "1.0",
               "markupVersion": "1.0"
             }
           }
         },
         "apiEndpoint": "https://api.amazonalexa.com",
         "apiAccessToken": APITOKEN,
       }
     },
  };


  var buttonEvent = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": APPID
      },
      "attributes": {},
      "user": {
        "userId": "not-amazon",
      },
      "new": false
    },
    "request": {
      "type": "GameEngine.InputHandlerEvent",
      "requestId": "EdwRequestId.12",
      "timestamp": "2018-08-02T01:05:33Z",
      "locale": LOCALE,
      "originatingRequestId": "EdwRequestId.12",
      "events": [
        {
          "name": "button_down_event",
          "inputEvents": [
            {
              "gadgetId": "amzn1.ask.gadget.05RPH7PJG9C61DHI4QR0RLOQOHKGUBVM9A7T9FD3V4OR7ASISG8HIIRQT3O4IF0KGJVKUMT0LLB45D78QBJFTLVOEM32UFCRVKLBKMJM9ADL7CEU4EUBO5DNQ83L7EE9PFQQ3LUFE8929JPSGKLN6GTBIKVQBPOUH6SU7C27OEO86DIF32ET8",
              "timestamp": "2018-08-02T01:05:29.371Z",
              "color": "000000",
              "feature": "press",
              "action": "down"
            }
          ]
        }
      ]
    },
    "version": "1.0",
     "context": {
       "AudioPlayer": {
         "playerActivity": "IDLE"
       },
       "Display": {},
       "System": {
         "application": {
           "applicationId": "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04"
         },
         "user": {
           "userId": "not-amazon",
         },
         "device": {
           "deviceId": "not-amazon",
           "supportedInterfaces": {
             "AudioPlayer": {},
             "Display": {
               "templateVersion": "1.0",
               "markupVersion": "1.0"
             }
           }
         },
         "apiEndpoint": "https://api.amazonalexa.com",
         "apiAccessToken": "",
       }
     },
  };

 var buttonTimeout = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": APPID
      },
      "attributes": {},
      "user": {
        "userId": "not-amazon",
      },
      "new": false
    },
    "request": {
        "type": "GameEngine.InputHandlerEvent",
        "requestId": "EdwRequestId.12",
        "timestamp": "2018-10-20T13:50:06Z",
        "locale": LOCALE,
        "originatingRequestId": "EdwRequestId.12",
        "events": [
            {
                "name": "reprompt_timeout",
                "inputEvents": []
            }
        ]
    },
    "version": "1.0",
     "context": {
       "AudioPlayer": {
         "playerActivity": "IDLE"
       },
       "Display": {},
       "System": {
         "application": {
           "applicationId": "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04"
         },
         "user": {
           "userId": "not-amazon",
         },
         "device": {
           "deviceId": "not-amazon",
           "supportedInterfaces": {
             "AudioPlayer": {},
             "Display": {
               "templateVersion": "1.0",
               "markupVersion": "1.0"
             }
           }
         },
         "apiEndpoint": "https://api.amazonalexa.com",
         "apiAccessToken": "",
       }
     },
  };

  const canFulfill = {
   "session":{
     "new": true,
     "sessionId":"SessionId.12",
     "application":{
       "applicationId": APPID
     },
     "attributes":{
       "key": "string value"
     },
     "user":{
       "userId": USERID,
     }
   },
   "request":{
     "type":"CanFulfillIntentRequest",
     "requestId":"EdwRequestId.12",
     "intent":{
       "name":"ColumnIntent",
       "slots":{
         "Ordinal":{
           "name":"Ordinal",
           "value":"2"
         },
       }
     },
     "locale":LOCALE,
     "timestamp":"2017-10-03T22:02:29Z"
   },
   "context":{
     "AudioPlayer":{
       "playerActivity":"IDLE"
     },
     "System":{
       "application":{
         "applicationId": APPID
       },
       "user":{
         "userId":USERID,
       },
       "device":{
         "supportedInterfaces":{

         }
       }
     }
   },
   "version":"1.0"
  };

  // If there is an attributes.txt file, read the attributes from there
  if (fs.existsSync(attributeFile) && (argv.length >= 2) && (argv[2] !== 'launch')) {
    data = fs.readFileSync(attributeFile, 'utf8');
    if (data) {
      lambda.session.attributes = JSON.parse(data);
      buttonEvent.session.attributes = JSON.parse(data);
      buttonTimeout.session.attributes = JSON.parse(data);
      openEvent.session.attributes = JSON.parse(data);
    }
  }

  // If there is no argument, then we'll just return
  if (argv.length <= 2) {
    console.log('I need some parameters');
    return null;
  } else if (argv[2] == "seed") {
    if (fs.existsSync("seed.txt")) {
      data = fs.readFileSync("seed.txt", 'utf8');
      if (data) {
        return JSON.parse(data);
      }
    }
  } else if (argv[2] == "canfulfill") {
      return canFulfill;
  } else if (argv[2] == 'betnumbers') {
    lambda.request.intent = numbers;
    if (argv.length > 3) {
      if (!isNaN(parseInt(argv[3]))) {
        numbers.slots.Amount.value = argv[3];
      }
    }
    if (argv.length > 4) {
      numbers.slots.FirstNumber.value = argv[4];
    }
    if (argv.length > 5) {
      numbers.slots.SecondNumber.value = argv[5];
    }
    if (argv.length > 6) {
      numbers.slots.ThirdNumber.value = argv[6];
    }
    if (argv.length > 7) {
      numbers.slots.FourthNumber.value = argv[7];
    }
    if (argv.length > 8) {
      numbers.slots.FifthNumber.value = argv[8];
    }
    if (argv.length > 9) {
      numbers.slots.SixthNumber.value = argv[9];
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
  } else if (argv[2] == 'bethigh') {
    lambda.request.intent = high;
    if (argv.length > 3) {
      high.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'betlow') {
    lambda.request.intent = low;
    if (argv.length > 3) {
      low.slots.Amount.value = argv[3];
    }
  } else if (argv[2] == 'rules') {
    lambda.request.intent = rules;
    if (argv.length > 3) {
      rules.slots.Rules.value = argv[3];
    }
  } else if (argv[2] == 'spin') {
    lambda.request.intent = spin;
  } else if (argv[2] == 'highscore') {
    lambda.request.intent = highScore;
  } else if (argv[2] == 'launch') {
    return openEvent;
  } else if (argv[2] == 'button') {
    return buttonEvent;
  } else if (argv[2] == 'timeout') {
    if (argv.length > 3) {
      buttonTimeout.request.events[0].name = argv[3];
    }
    return buttonTimeout;
  } else if (argv[2] == 'repeat') {
    lambda.request.intent = repeat;
  } else if (argv[2] == 'help') {
    lambda.request.intent = help;
  } else if (argv[2] == 'stop') {
    lambda.request.intent = stop;
  } else if (argv[2] == 'cancel') {
    lambda.request.intent = cancel;
  } else if (argv[2] == 'reset') {
    lambda.request.intent = reset;
  } else if (argv[2] == 'yes') {
    lambda.request.intent = yes;
  } else if (argv[2] == 'no') {
    lambda.request.intent = no;
  } else {
    console.log(argv[2] + ' was not valid');
    return null;
  }

  // Write the last action
  fs.writeFile('lastaction.txt', JSON.stringify(lambda), (err) => {
    if (err) {
      console.log(err);
    }
  });

  return lambda;
}

function ssmlToText(ssml) {
  let text = ssml;

  // Replace break with ...
  text = text.replace(/<break[^>]+>/g, ' ... ');

  // Remove all other angle brackets
  text = text.replace(/<\/?[^>]+(>|$)/g, '');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Simple response - just print out what I'm given
function myResponse(appId) {
  this._appId = appId;
}

function myResponse(err, result) {
  // Write the last action
  fs.writeFile('lastResponse.txt', JSON.stringify(result), (err) => {
    if (err) {
      console.log('ERROR; ' + err.stack);
    } else if (result) {
      if (result.sessionAttributes) {
        // Output the attributes
        const fs = require('fs');
        fs.writeFile(attributeFile, JSON.stringify(result.sessionAttributes), (err) => {
          if (err) {
            console.log(err);
          }
        });
        if (!process.env.NOLOG) {
          console.log('"attributes": ' + JSON.stringify(result.sessionAttributes));
        }
      }
      if (!result.response || !result.response.outputSpeech) {
        console.log('RETURNED ' + JSON.stringify(result));
      } else {
        if (result.response.outputSpeech.ssml) {
          console.log('AS SSML: ' + result.response.outputSpeech.ssml);
          console.log('AS TEXT: ' + ssmlToText(result.response.outputSpeech.ssml));
        } else {
          console.log(result.response.outputSpeech.text);
        }
        if (result.response.card && result.response.card.content) {
          console.log('Card Content: ' + result.response.card.content);
        }
        console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
      }
    } else {
      console.log('Huh, no error and no result');
    }
  });
}

// Build the event object and call the app
if ((process.argv.length == 3) && (process.argv[2] == 'clear')) {
  const fs = require('fs');

  // Clear is a special case - delete this entry from the DB and delete the attributes.txt file
  dynamodb.deleteItem({TableName: 'RouletteWheel', Key: { userId: {S: 'not-amazon'}}}, function (error, data) {
    console.log("Deleted " + error);
    if (fs.existsSync(attributeFile)) {
      fs.unlinkSync(attributeFile);
    }
  });
} else {
  var event = BuildEvent(process.argv);
  if (event) {
      mainApp.handler(event, {}, myResponse);
  }
}
