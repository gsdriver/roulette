//
// Offers our survey
//

'use strict';

const utils = require('../utils');

const questions = [
  'SURVEY_QUESTION_TOURNAMENT',
  'SURVEY_QUESTION_LEADERBOARD',
  'SURVEY_QUESTION_OTHERGAMES',
];

module.exports = {
  handleStartIntent: function() {
    // Great, they are taking the survey!
    const res = require('../' + this.event.request.locale + '/resources');

    this.attributes.survey = {};
    this.attributes.survey.accepted = Date.now();
    this.handler.state = 'INSURVEY';

    this.attributes.survey.currentQuestion = 0;
    utils.emitResponse(this, null, null,
        res.strings[questions[0]], res.strings.SURVEY_QUESTION_REPROMPT);
  },
  handlePassIntent: function() {
    // No survey - mark survey as declined and offer to spin again
    const res = require('../' + this.event.request.locale + '/resources');

    if (!this.attributes.survey) {
      this.attributes.survey = {};
      this.attributes.survey.declined = Date.now();
    }

    this.handler.state = 'INGAME';
    utils.emitResponse(this, null, null, res.strings.SPIN_REPROMPT, res.strings.SPIN_REPROMPT);
  },
  handleYesIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    const survey = this.attributes.survey;

    survey[questions[survey.currentQuestion]] = true;
    survey.currentQuestion++;
    if (survey.currentQuestion < questions.length) {
      utils.emitResponse(this, null, null,
          res.strings[questions[survey.currentQuestion]], res.strings.SURVEY_QUESTION_REPROMPT);
    } else {
      // End of survey
      let speech = res.strings.SURVEY_ENDED;
      const reprompt = res.strings.SPIN_REPROMPT;
      speech += reprompt;

      this.handler.state = 'INGAME';
      utils.emitResponse(this, null, null, speech, reprompt);
    }
  },
  handleNoIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    const survey = this.attributes.survey;

    survey[questions[survey.currentQuestion]] = false;
    survey.currentQuestion++;
    if (survey.currentQuestion < questions.length) {
      utils.emitResponse(this, null, null,
          res.strings[questions[survey.currentQuestion]], res.strings.SURVEY_QUESTION_REPROMPT);
    } else {
      // End of survey
      let speech = res.strings.SURVEY_ENDED;
      const reprompt = res.strings.SPIN_REPROMPT;
      speech += reprompt;

      this.handler.state = 'INGAME';
      utils.emitResponse(this, null, null, speech, reprompt);
    }
  },
};
