var mainApp = require('../index');

const attributeFile = 'attributes.txt';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

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
  var yes = {'name': 'AMAZON.YesIntent', 'slots': {}};
  var no = {'name': 'AMAZON.NoIntent', 'slots': {}};
  var help = {'name': 'AMAZON.HelpIntent', 'slots': {}};
  var stop = {'name': 'AMAZON.StopIntent', 'slots': {}};
  var cancel = {'name': 'AMAZON.CancelIntent', 'slots': {}};
  var highScore = {'name': 'HighScoreIntent', 'slots': {}};

  var lambda = {
    "session": {
      "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
      "application": {
        "applicationId": "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04"
      },
      "attributes": {},
      "user": {
        "userId": "not-amazon",
      },
      "new": false
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
        "userId": "not-amazon",
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

  var endEvent = {
                   "session": {
                     "sessionId": "SessionId.d2501a83-bf90-406e-b2d7-dd7606214d17",
                     "application": {
                       "applicationId": "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04"
                     },
                     "attributes": {
                       "highScore": {
                         "spinsEuropean": 2,
                         "currentAmerican": 1260,
                         "currentEuropean": 1020,
                         "spinsAmerican": 14,
                         "highAmerican": 1800,
                         "highEuropean": 1020,
                         "timestamp": 1496537080780
                       },
                       "bankroll": 1260,
                       "doubleZeroWheel": true
                     },
                     "user": {
                       "userId": "not-amazon",
                     },
                     "new": false
                   },
                   "request": {
                     "type": "SessionEndedRequest",
                     "requestId": "EdwRequestId.97c42d5b-86ef-4e3c-8655-2e06aec98e7e",
                     "locale": "en-US",
                     "timestamp": "2017-06-04T13:16:51Z",
                     "reason": "USER_INITIATED"
                   },
                   "version": "1.0"
                 };

  var testEvent = {
                    "session": {
                      "sessionId": "SessionId.65ce4124-c7ff-4446-b077-65b514440c0e",
                      "application": {
                        "applicationId": "amzn1.ask.skill.5fdf0343-ea7d-40c2-8c0b-c7216b98aa04"
                      },
                      "attributes": {
                        "lastbets": [
                          {
                            "amount": "100",
                            "numbers": [
                              -1
                            ],
                            "type": "SingleNumber"
                          }
                        ]
                      },
                      "user": {
                        "userId": "not-amazon",
                      },
                      "new": false
                    },
                    "request": {
                      "type": "IntentRequest",
                      "requestId": "EdwRequestId.8142106c-c9dd-4771-a224-52fbd6068801",
                      "locale": "en-US",
                      "timestamp": "2017-03-20T20:55:41Z",
                      "intent": {
                        "name": "BlackIntent",
                        "slots": {
                          "Amount": {
                            "name": "Amount",
                            "value": "100"
                          }
                        }
                      }
                    },
                    "version": "1.0"
                  };

  // If there is an attributes.txt file, read the attributes from there
  const fs = require('fs');
  if (fs.existsSync(attributeFile)) {
    data = fs.readFileSync(attributeFile, 'utf8');
    if (data) {
      lambda.session.attributes = JSON.parse(data);
      openEvent.session.attributes = JSON.parse(data);
    }
  }

  // If there is no argument, then we'll just return
  if (argv.length <= 2) {
    console.log('I need some parameters');
    return null;
  } else if (argv[2] == 'betnumbers') {
    lambda.request.intent = numbers;
    if (argv.length > 3) {
      numbers.slots.FirstNumber.value = argv[3];
    }
    if (argv.length > 4) {
      numbers.slots.SecondNumber.value = argv[4];
    }
    if (argv.length > 5) {
      numbers.slots.ThirdNumber.value = argv[5];
    }
    if (argv.length > 6) {
      numbers.slots.FourthNumber.value = argv[6];
    }
    if (argv.length > 7) {
      numbers.slots.FifthNumber.value = argv[7];
    }
    if (argv.length > 8) {
      numbers.slots.SixthNumber.value = argv[8];
    }
    if (argv.length > 9) {
      numbers.slots.Amount.value = argv[9];
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
  } else if (argv[2] == 'exit') {
    return endEvent;
  } else if (argv[2] == 'test') {
    return testEvent;
  } else if (argv[2] == 'launch') {
    return openEvent;
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
  if (result.response.card && result.response.card.content) {
    console.log('Card Content: ' + result.response.card.content);
  }
  console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
  if (result.sessionAttributes) {
    // Output the attributes too
    const fs = require('fs');
    fs.writeFile(attributeFile, JSON.stringify(result.sessionAttributes), (err) => {
      if (!process.env.NOLOG) {
        console.log('attributes:' + JSON.stringify(result.sessionAttributes) + ',');
      }
    });
  }
}

myResponse.fail = function(e) {
  console.log(e);
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
      mainApp.handler(event, myResponse);
  }
}
