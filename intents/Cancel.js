//
// Cancels the previous bet, if any
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    let speech;
    let response;
    let reprompt;
    const res = require('../' + this.event.request.locale + '/resources');

    if (this.attributes.bets && (this.attributes.bets.length > 0)) {
      const bet = this.attributes.bets.shift();

      this.attributes.bankroll += bet.amount;
      speech = res.strings.CANCEL_REMOVE_BET.replace('{0}', bet.amount).replace('{1}', res.mapBetType(bet.type, bet.numbers));
    } else {
      // No bets that can be cancelled
      response = res.strings.EXIT_GAME;
    }

    if (this.attributes.bets && (this.attributes.bets.length > 0)) {
      reprompt = res.strings.CANCEL_REPROMPT_WITHBET;
    } else {
      reprompt = res.strings.CANCEL_REPROMPT_NOBET;
    }
    speech += reprompt;

    utils.emitResponse(this.emit, this.event.request.locale, null, response, speech, reprompt);
  },
};
