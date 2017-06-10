//
// Resets your bankroll and clears all bets
//

'use strict';

module.exports = {
  handleIntent: function() {
    // We will ask them if they want to reset
    const res = require('../' + this.event.request.locale + '/resources');
    const speech = res.strings.RESET_CONFIRM;

    this.handler.state = 'CONFIRMRESET';
    this.emit(':ask', speech, speech);
  },
  handleYesReset: function() {
    // Confirmed - let's reset
    const res = require('../' + this.event.request.locale + '/resources');

    this.attributes['bankroll'] = 1000;
    this.attributes['doubleZeroWheel'] = (this.event.request.locale == 'en-US');
    this.attributes['bets'] = undefined;
    this.attributes['lastbets'] = undefined;
    if (this.attributes['highScore']) {
      this.attributes['highScore'].currentAmerican = 1000;
      this.attributes['highScore'].currentEuropean = 1000;
    }

    this.handler.state = 'INGAME';
    this.emit(':ask', res.strings.RESET_COMPLETED, res.strings.RESET_REPROMPT);
  },
  handleNoReset: function() {
    // Nope, they are not going to reset - so go back to start a new game
    const res = require('../' + this.event.request.locale + '/resources');

    this.handler.state = 'INGAME';
    this.emit(':ask', res.strings.RESET_ABORTED, res.strings.RESET_REPROMPT);
  },
};
