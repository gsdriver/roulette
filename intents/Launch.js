//
// Handles bet of a single number - "Bet on five"
//

'use strict';

const utils = require('../utils');
const tournament = require('../tournament');

module.exports = {
  handleIntent: function() {
    // Give the tournament an opportunity to return a state and text first
    tournament.launchPrompt(this.event.request.locale,
      this.attributes,
      (tournamentState, tournamentSpeech, tournamentReprompt) => {
      if (tournamentSpeech) {
        // This overrides
        this.handler.state = tournamentState;
        utils.emitResponse(this.emit, this.event.request.locale,
          null, null, tournamentSpeech, tournamentReprompt);
      } else {
        // Tell them the rules, their bankroll and offer a few things they can do
        const res = require('../' + this.event.request.locale + '/resources');
        const reprompt = res.strings.LAUNCH_REPROMPT;
        let speech = res.strings.LAUNCH_WELCOME;
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
      }
    });
  },
};
