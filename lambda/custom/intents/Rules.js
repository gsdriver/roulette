//
// Handles setting the rules of the game (either a single or double zero board)
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // You can set either a single zero (European) or double zero (American) wheel
    let reprompt;
    let speechError;
    let ssml;
    let numZeroes;
    const res = require('../' + this.event.request.locale + '/resources');

    if (!this.attributes[this.attributes.currentHand].canReset) {
      // Sorry, you can't reset this or change the rules
      speechError = res.strings.TOURNAMENT_NOCHANGERULES;
      reprompt = res.strings.TOURNAMENT_INVALIDACTION_REPROMPT;
      speechError += reprompt;
      utils.emitResponse(this, speechError, null, null, reprompt);
    } else if (!this.event.request.intent.slots.Rules
            || !this.event.request.intent.slots.Rules.value) {
      // Sorry - reject this
      speechError = res.strings.RULES_NO_WHEELTYPE;
      reprompt = res.strings.RULES_ERROR_REPROMPT;
      speechError += reprompt;
      utils.emitResponse(this, speechError, null, null, reprompt);
    } else {
      numZeroes = res.mapWheelType(this.event.request.intent.slots.Rules.value);
      if (!numZeroes) {
        speechError = res.strings.RULES_INVALID_VARIANT.replace('{0}', this.event.request.intent.slots.Rules.value);
        reprompt = res.strings.RULES_ERROR_REPROMPT;
        speechError += reprompt;
        utils.emitResponse(this, speechError, null, null, reprompt);
      } else {
        // OK, set the wheel, clear all bets, and set the bankroll based on the highScore object
        let hand;

        // Clear the old
        hand = this.attributes[this.attributes.currentHand];
        hand.bets = undefined;
        hand.lastbets = undefined;

        // Set the new
        this.attributes.currentHand = (numZeroes == 2) ? 'american' : 'european';
        hand = this.attributes[this.attributes.currentHand];

        ssml = (numZeroes == 2) ? res.strings.RULES_SET_AMERICAN : res.strings.RULES_SET_EUROPEAN;
        ssml += res.strings.RULES_CLEAR_BETS;
        ssml += utils.readBankroll(this.event.request.locale, this.attributes);
        ssml += res.strings.RULES_WHAT_NEXT;

        reprompt = res.strings.RULES_REPROMPT;
        utils.emitResponse(this, speechError, null, ssml, reprompt);
      }
    }
  },
};