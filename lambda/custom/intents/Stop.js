//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');
const ads = require('../ads');
const tournament = require('../tournament');

module.exports = {
  handleIntent: function() {
    const res = require('../resources')(this.event.request.locale);

    ads.getAd(this.attributes, 'roulette', this.event.request.locale, (adText) => {
      let speech = tournament.getReminderText(this.event.request.locale);
      speech += res.strings.EXIT_GAME.replace('{0}', adText);
      utils.emitResponse(this, null, speech, null, null);
    });
  },
};
