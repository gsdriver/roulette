//
// Checks whether we can fulfill this intent
// Note that this is processed outside of the normal Alexa SDK
// So we cannot use alexa-sdk functionality here
//

'use strict';

const utils = require('../utils');

module.exports = {
  check: function(event) {
    let valid;
    const ordinalIntents = ['ColumnIntent', 'DozenIntent'];
    const noSlotIntent = ['HighScoreIntent', 'AMAZON.RepeatIntent', 'AMAZON.FallbackIntent',
      'AMAZON.PreviousIntent', 'AMAZON.NextIntent', 'AMAZON.RepeatIntent',
      'AMAZON.HelpIntent', 'AMAZON.YesIntent', 'AMAZON.NoIntent', 'AMAZON.StopIntent',
      'AMAZON.CancelIntent', 'ResetIntent', 'SpinIntent',
      // Note that we can process these even without an amount bet, so treat as no slot needed
      'LowIntent', 'BlackIntent', 'RedIntent', 'EvenIntent', 'OddIntent', 'HighIntent'];

    // Default to a negative response
    const response = {
    'version': '1.0',
      'response': {
        'canFulfillIntent': {
          'canFulfill': 'NO',
          'slots': {},
        },
      },
    };

    // If this is one we understand regardless of attributes,
    // then we can just return immediately
    if (noSlotIntent.indexOf(event.request.intent.name) > -1) {
      valid = true;
    } else if (event.request.intent.name == 'NumbersIntent') {
      // First number is required
      if (event.request.intent.slots && event.request.intent.slots.FirstNumber
        && event.request.intent.slots.FirstNumber.value) {
        const num = utils.number(event.request.locale,
            event.request.intent.slots.FirstNumber.value, true);
        valid = (num !== undefined);
      }
    } else if (event.request.intent.name == 'RulesIntent') {
      if (event.request.intent.slots && event.request.intent.slots.Rules
        && event.request.intent.slots.Rules.value) {
        valid = true;
      }
    } else if (ordinalIntents.indexOf(event.request.intent.name) > -1) {
      // It needs to have the Ordinal field set to 1, 2, or 3
      if (event.request.intent.slots && event.request.intent.slots.Ordinal
        && event.request.intent.slots.Ordinal.value) {
        const res = require('../resources')(event.request.locale);
        const ordinal = res.valueFromOrdinal(event.request.intent.slots.Ordinal.value);
        valid = (ordinal > 0);
      }
    }

    if (valid) {
      // We can fulfill it - all slots are good
      let slot;

      response.response.canFulfillIntent.canFulfill = 'YES';
      for (slot in event.request.intent.slots) {
        if (slot) {
          response.response.canFulfillIntent.slots[slot] =
              {'canUnderstand': 'YES', 'canFulfill': 'YES'};
        }
      }
    }

    console.log('CanFulfill: ' + JSON.stringify(response));
    return response;
  },
};
