//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    utils.emitResponse(this.emit, null, 'Thanks for playing. Goodbye.', null, null);
  },
};
