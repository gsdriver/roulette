//
// Handles response from Product purchase, upsell, or refund
//

'use strict';

const Launch = require('./Launch');
const Spin = require('./Spin');
const buttons = require('../buttons');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const SNS = new AWS.SNS();
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'Connections.Response');
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let promise;

    // First write out to S3
    const summary = {
      token: event.request.token,
      action: event.request.name,
      userId: event.session.user.userId,
      response: event.request.payload.purchaseResult,
    };
    if (attributes.upsellSelection) {
      summary.selection = attributes.upsellSelection;
    }
    const params = {
      Body: JSON.stringify(summary),
      Bucket: 'garrett-alexa-usage',
      Key: 'roulette-upsell/' + Date.now() + '.txt',
    };

    if (process.env.SNSTOPIC) {
      promise = s3.putObject(params).promise().then(() => {
        // Publish to SNS if the action was accepted so we know something happened
        if (event.request.payload.purchaseResult === 'ACCEPTED') {
          let message;

          // This message is sent internally so no worries about localizing
          message = 'For token ' + event.request.token + ' (' + attributes.playerLocale + '), ';
          if (event.request.payload.message) {
            message += event.request.payload.message;
          } else {
            message += event.request.name + ' was accepted';
          }
          message += ' by user ' + event.session.user.userId;
          if (attributes.upsellSelection) {
            message += '\nUpsell variant ' + attributes.upsellSelection + ' was presented. ';
          }

          return SNS.publish({
            Message: message,
            TopicArn: process.env.SNSTOPIC,
            Subject: 'Roulette Wheel New Purchase',
          }).promise();
        } else {
          return;
        }
      });
    } else {
      promise = Promise.resolve();
    }

    return promise.then(() => {
      const options = event.request.token.split('.');
      const accepted = (event.request.payload &&
        ((event.request.payload.purchaseResult == 'ACCEPTED') ||
        (event.request.payload.purchaseResult == 'ALREADY_PURCHASED')));
      let nextAction = options[2];

      attributes.upsellSelection = undefined;
      if ((event.request.name === 'Upsell') && !accepted) {
        // Don't upsell them again on the next round
        attributes.temp.noUpsell = true;
      }

      // And go to the appropriate next step
      if (nextAction === 'spin') {
        return Spin.handle(handlerInput);
      } else {
        // Just drop them directly into a game
        attributes.temp.resumeGame = true;
        return Launch.handle(handlerInput);
      }
    });
  },
};
