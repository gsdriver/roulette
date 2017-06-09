//
// Cancels the previous bet, if any
//

'use strict';

const utils = require('../utils');
const ads = require('../ads');

module.exports = {
  handleIntent: function() {
    let speech;
    let reprompt;
    const res = require('../' + this.event.request.locale + '/resources');

    if (this.attributes.bets && (this.attributes.bets.length > 0)) {
      const bet = this.attributes.bets.shift();

      this.attributes.bankroll += bet.amount;
      speech = res.strings.CANCEL_REMOVE_BET.replace('{0}', bet.amount).replace('{1}', res.mapBetType(bet.type, bet.numbers));

      // Reprompt based on whether we still have bets or not
      if (this.attributes.bets && (this.attributes.bets.length > 0)) {
        reprompt = res.strings.CANCEL_REPROMPT_WITHBET;
      } else {
        reprompt = res.strings.CANCEL_REPROMPT_NOBET;
      }
      speech += reprompt;

      utils.emitResponse(this.emit, this.event.request.locale, null, null, speech, reprompt);
    } else {
      // No bets that can be cancelled
      ads.getAd(this.attributes, 'roulette', this.event.request.locale, (adText) => {
        utils.emitResponse(this.emit, this.event.request.locale,
          null, res.strings.EXIT_GAME.replace('{0}', adText), null, null);
      });
    }
  },
};
