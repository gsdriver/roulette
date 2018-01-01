//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    const hand = this.attributes[this.attributes.currentHand];
    let speech;
    const betText = [];

    // Tell them the bankroll and their bets
    speech = utils.readBankroll(this.event.request.locale, this.attributes);
    if (hand.bets) {
      hand.bets.forEach((bet) => {
        betText.push(res.strings.REPEAT_SAY_BET
          .replace('{0}', bet.amount)
          .replace('{1}', res.mapBetType(bet.type, bet.numbers)));
      });
      speech += res.strings.REPEAT_BETS.replace('{0}', speechUtils.and(betText, {locale: this.event.request.locale}));
    } else if (hand.lastbets) {
      hand.lastbets.forEach((bet) => {
        betText.push(res.strings.REPEAT_SAY_BET
          .replace('{0}', bet.amount)
          .replace('{1}', res.mapBetType(bet.type, bet.numbers)));
      });
      speech += res.strings.REPEAT_LAST_BETS.replace('{0}', speechUtils.and(betText, {locale: this.event.request.locale}));
    } else {
      speech += res.strings.REPEAT_PLACE_BETS;
    }

    utils.emitResponse(this.emit, this.event.request.locale, null, null,
          speech, res.strings.REPEAT_REPROMPT);
  },
  handleResetIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');

    // Just need to repeat the question
    utils.emitResponse(this.emit, this.event.request.locale,
      null, null, res.strings.RESET_CONFIRM, res.strings.RESET_CONFIRM);
  },
};
