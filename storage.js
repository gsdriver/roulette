/*
 * Handles DynamoDB storage
 */

'use strict';

var AWS = require('aws-sdk');
var config = require('./config');

// Run locally if told to do so
if (config.runDBLocal) {
    AWS.config.update({
      region: 'us-west-2',
      endpoint: 'http://localhost:8000'
    });
}

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The UserData class stores all game states for the user
     */
    function UserData(session, bankroll, bets) {
        // Save values or defaults
        this.bankroll = (bankroll) ? parseInt(bankroll) : 1000;
        this.bets = (bets) ? JSON.parse(bets) : null;

        // Save the session information
        this._session = session;
    }

    UserData.prototype = {
        save: function (callback) {
            // Save state in the session object, so we can reference that instead of hitting the DB
            this._session.attributes.userData = this.data;

            dynamodb.putItem({
                TableName: 'RouletteUserData',
                Item: { UserID: {S: this._session.user.userId },
                        bankroll: {N: this.bankroll.toString()},
                        bets: {S: JSON.stringify(this.bets)}}
            }, function (err, data) {
                // We only need to pass the error back - no other data to return
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback(err);
                }
            });
        }
    };

    return {
        loadUserData: function (session, callback) {
            if (session.attributes.userData) {
                // It was in the session so no need to hit the DB
                callback(new UserData(session, session.attributes.userData.bankroll,
                                    session.attributes.userData.bets));
            } else {
                dynamodb.getItem({TableName: 'RouletteUserData',
                                  Key: { UserID: {S: session.user.userId}}}, function (error, data) {
                    var userData;

                    if (error || (data.Item == undefined)) {
                        // No big deal, we'll just start over
                        userData = new UserData(session);
                        session.attributes.userData = userData.data;
                        callback(userData);
                    } else {
                        userData = new UserData(session, data.Item.bankroll.N, data.Item.bets.S);
                        session.attributes.userData = userData.data;
                        callback(userData);
                    }
                });
            }
        },
        newUserData: function (session) {
            return new newUserData(session);
        }
    };
})();

module.exports = storage;
