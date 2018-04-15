//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Tell them the rules, their bankroll and offer a few things they can do
    const res = require('../' + this.event.request.locale + '/resources');
    const reprompt = res.strings.LAUNCH_REPROMPT;
    let speech = res.strings.LAUNCH_WELCOME;

    if (this.attributes.tournamentResult) {
      speech += this.attributes.tournamentResult;
      this.attributes.tournamentResult = undefined;
    }

    // Since we aren't in a tournament, make sure current hand isn't set to one
    if (this.attributes.currentHand === 'tournament') {
      this.attributes.currentHand = utils.defaultWheel(this.event.request.locale);
    }

    const hand = this.attributes[this.attributes.currentHand];

    // There was a bug where you could get to $0 bankroll without auto-resetting
    // Let the user know they can say reset if they have $0
    if ((hand.bankroll === 0) && hand.canReset) {
      speech += res.strings.SPIN_BUSTED;
      hand.bankroll = 1000;
    } else {
      speech += utils.readBankroll(this.event.request.locale, this.attributes);
    }

    speech += reprompt;
    this.handler.state = 'INGAME';
    utils.emitResponse(this, null, null, speech, reprompt);
  },
};
