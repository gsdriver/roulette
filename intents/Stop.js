//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');

    utils.emitResponse(this.emit, this.event.request.locale,
      null, res.strings.EXIT_GAME, null, null);
  },
};
