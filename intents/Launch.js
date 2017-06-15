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
      this.attributes.currentHand = (this.event.request.locale === 'en-US') ? 'american' : 'european';
    }

    const hand = this.attributes[this.attributes.currentHand];

    speech += res.strings.READ_BANKROLL.replace('{0}', hand.bankroll);

    utils.readRank(this.event.request.locale, hand, true, (err, rank) => {
      // Let them know their current rank
      if (rank) {
        speech += rank;
      }

      speech += reprompt;
      this.handler.state = 'INGAME';
      utils.emitResponse(this.emit, this.event.request.locale, null, null, speech, reprompt);
    });
  },
};
