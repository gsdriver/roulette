//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const blackjack = require('./blackjack');
const mail = require('./sendmail');

// Function to get all the scores from the Database
function getRankFromDB(callback) {
  const americanScores = [];
  const europeanScores = [];
  const tournamentScores = [];
  let scoreData;

  // Loop thru to read in all items from the DB
  (function loop(firstRun, startKey) {
    const params = {TableName: 'RouletteWheel'};

    if (firstRun || startKey) {
      params.ExclusiveStartKey = startKey;

      const scanPromise = dynamodb.scan(params).promise();
      return scanPromise.then((data) => {
        // OK, let's see where you rank among American and European players
        let i;

        for (i = 0; i < data.Items.length; i++) {
          if (data.Items[i].mapAttr && data.Items[i].mapAttr.M) {
            if (data.Items[i].mapAttr.M.highScore
                  && data.Items[i].mapAttr.M.highScore.M) {
              // This is the old-style format
              // Only counts if they spinned
              const score = data.Items[i].mapAttr.M.highScore.M;
              const spinsAmerican = (score.spinsAmerican && score.spinsAmerican.N)
                    ? parseInt(score.spinsAmerican.N) : 0;
              const spinsEuropean = (score.spinsEuropean && score.spinsEuropean.N)
                    ? parseInt(score.spinsEuropean.N) : 0;
              const highAmerican = (score.highAmerican && score.highAmerican.N)
                    ? parseInt(score.highAmerican.N) : 0;
              const highEuropean = (score.highEuropean && score.highEuropean.N)
                ? parseInt(score.highEuropean.N) : 0;

               if (spinsAmerican) {
                 americanScores.push(highAmerican);
               }
               if (spinsEuropean) {
                 europeanScores.push(highEuropean);
               }
            }

            // Check for new format
            if (data.Items[i].mapAttr.M.american && data.Items[i].mapAttr.M.american.M) {
              // This is the new format
              scoreData = data.Items[i].mapAttr.M.american.M;
              const spins = (scoreData.spins && scoreData.spins.N)
                    ? parseInt(scoreData.spins.N) : 0;
              const high = (scoreData.high && scoreData.high.N)
                    ? parseInt(scoreData.high.N) : 0;

              if (spins) {
                americanScores.push(high);
              }
            }

            if (data.Items[i].mapAttr.M.european && data.Items[i].mapAttr.M.european.M) {
              // This is the new format
              scoreData = data.Items[i].mapAttr.M.european.M;
              const spins = (scoreData.spins && scoreData.spins.N)
                    ? parseInt(scoreData.spins.N) : 0;
              const high = (scoreData.high && scoreData.high.N)
                    ? parseInt(scoreData.high.N) : 0;

              if (spins) {
                europeanScores.push(high);
              }
            }

            if (data.Items[i].mapAttr.M.tournament && data.Items[i].mapAttr.M.tournament.M) {
              // This is the new format
              scoreData = data.Items[i].mapAttr.M.tournament.M;
              const spins = (scoreData.spins && scoreData.spins.N)
                    ? parseInt(scoreData.spins.N) : 0;
              const high = (scoreData.high && scoreData.high.N)
                    ? parseInt(scoreData.high.N) : 0;

              if (spins) {
                tournamentScores.push(high);
              }
            }
          }
        }

        if (data.LastEvaluatedKey) {
          return loop(false, data.LastEvaluatedKey);
        }
      });
    }
  })(true, null).then(() => {
    americanScores.sort((a, b) => (b-a));
    europeanScores.sort((a, b) => (b-a));
    callback(null, americanScores, europeanScores, tournamentScores);
  }).catch((err) => {
    console.log('Error scanning: ' + err);
    callback(err, null, null, null);
  });
}

function checkScoreChange(newScores, callback) {
  // Read the S3 buckets that has everyone's scores
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteScores.txt'}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback('error');
    } else {
      // Get the scores array from the file
      const scores = JSON.parse(data.Body.toString('ascii'));
      const newTournament = (newScores.tournamentScores) ? newScores.tournamentScores.length : 0;
      const oldTournament = (scores.tournamentScores) ? scores.tournamentScores.length : 0;

      if ((newScores.americanScores.length != scores.americanScores.length) ||
        (newScores.europeanScores.length != scores.europeanScores.length) ||
        (newTournament != oldTournament)) {
        // They are different
        callback('different');
      } else {
        // Check if all alements are the same
        let i = 0;

        for (i = 0; i < scores.americanScores.length; i++) {
          if (scores.americanScores[i] != newScores.americanScores[i]) {
            callback('different');
            return;
          }
        }

        for (i = 0; i < scores.europeanScores.length; i++) {
          if (scores.europeanScores[i] != newScores.europeanScores[i]) {
            callback('different');
            return;
          }
        }

        if (oldTournament) {
          for (i = 0; i < scores.tournamentScores.length; i++) {
            if (scores.tournamentScores[i] != newScores.tournamentScores[i]) {
              callback('different');
              return;
            }
          }
        }

        // If we made it this far, we are the same
        callback('same');
      }
    }
  });
}

// Let's look at Roulette too while we're at it
function getSummaryMail(callback) {
  const american = {high: 0, spins: 0, players: 0};
  const european = {high: 0, spins: 0, players: 0};
  const tournament = {high: 0, spins: 0, players: 0};
  const adsPlayed = {};
  let spins;
  let text;
  let oldFormat = 0;
  let newFormat = 0;

  // Loop thru to read in all items from the DB
  (function loop(firstRun, startKey) {
    const params = {TableName: 'RouletteWheel'};

    if (firstRun || startKey) {
      params.ExclusiveStartKey = startKey;

      const scanPromise = dynamodb.scan(params).promise();
      return scanPromise.then((data) => {
        // OK, let's see where you rank among American and European players
        let i;

         for (i = 0; i < data.Items.length; i++) {
           // Any ads played?
           if (data.Items[i].mapAttr && data.Items[i].mapAttr.M
                    && data.Items[i].mapAttr.M.adsPlayed
                    && data.Items[i].mapAttr.M.adsPlayed.M) {
             const ads = data.Items[i].mapAttr.M.adsPlayed.M;
             let ad;

             for (ad in ads) {
               if (adsPlayed[ad]) {
                 adsPlayed[ad]++;
               } else {
                 adsPlayed[ad] = 1;
               }
             }
           }

           if (data.Items[i].mapAttr && data.Items[i].mapAttr.M) {
             if (data.Items[i].mapAttr.M.highScore
                  && data.Items[i].mapAttr.M.highScore.M) {
               // This is the old format
               oldFormat++;

               // Only counts if they spinned
               const score = data.Items[i].mapAttr.M.highScore.M;
               if (score.spinsAmerican && score.spinsAmerican.N) {
                 spins = parseInt(score.spinsAmerican.N);
                 american.spins += spins;
                 if (spins) {
                   american.players++;
                 }
                 if (parseInt(score.highAmerican.N) > american.high) {
                   american.high = parseInt(score.highAmerican.N);
                 }
               }

               if (score.spinsEuropean && score.spinsEuropean.N) {
                 spins = parseInt(score.spinsEuropean.N);
                 european.spins += spins;
                 if (spins) {
                   european.players++;
                 }
                 if (parseInt(score.highEuropean.N) > european.high) {
                   european.high = parseInt(score.highEuropean.N);
                 }
               }
             } else {
               let scoreData;
               newFormat++;

               if (data.Items[i].mapAttr.M.american && data.Items[i].mapAttr.M.american.M) {
                 // This is the new format
                 scoreData = data.Items[i].mapAttr.M.american.M;

                 if (scoreData.spins && scoreData.spins.N) {
                   spins = parseInt(scoreData.spins.N);
                   american.spins += spins;
                   if (spins) {
                     american.players++;
                   }
                   if (parseInt(scoreData.high.N) > american.high) {
                     american.high = parseInt(scoreData.high.N);
                   }
                 }
               }

               if (data.Items[i].mapAttr.M.european && data.Items[i].mapAttr.M.european.M) {
                 // This is the new format
                 scoreData = data.Items[i].mapAttr.M.european.M;

                 if (scoreData.spins && scoreData.spins.N) {
                   spins = parseInt(scoreData.spins.N);
                   european.spins += spins;
                   if (spins) {
                     european.players++;
                   }
                   if (parseInt(scoreData.high.N) > european.high) {
                     european.high = parseInt(scoreData.high.N);
                   }
                 }
               }

               if (data.Items[i].mapAttr.M.tournament && data.Items[i].mapAttr.M.tournament.M) {
                 // This is the new format
                 scoreData = data.Items[i].mapAttr.M.tournament.M;

                 if (scoreData.spins && scoreData.spins.N) {
                   spins = parseInt(scoreData.spins.N);
                   tournament.spins += spins;
                   if (spins) {
                     tournament.players++;
                   }
                   if (parseInt(scoreData.high.N) > tournament.high) {
                     tournament.high = parseInt(scoreData.high.N);
                   }
                 }
               }
             }
           }
         }

       if (data.LastEvaluatedKey) {
         return loop(false, data.LastEvaluatedKey);
       }
     });
   }
  })(true, null).then(() => {
    text = ('You have ' + american.players + ' people who have done ' + american.spins + ' total spins on an American wheel with a high score of ' + american.high + ' units.\r\n');
    text += ('You have ' + european.players + ' people who have done ' + european.spins + ' total spins on a European wheel with a high score of ' + european.high + ' units.\r\n');
    text += ('You have ' + tournament.players + ' people who have done ' + tournament.spins + ' total spins in the tournament with a high score of ' + tournament.high + ' units.\r\n');
    text += ('There are ' + newFormat + ' people on new-style attributes and ' + oldFormat + ' people with old-style attributes.\r\n');
    if (adsPlayed) {
      let ad;

      text += '\r\nAds played - \r\n';
      for (ad in adsPlayed) {
        if (ad) {
          text += ('  ' + ad + ': ' + adsPlayed[ad] + '\r\n');
        }
      }
    }
    callback(text);
  }).catch((err) => {
    text = 'Error getting Roulette results: ' + err;
    callback(text);
  });
}

// Get the ranks every 5 minutes and write to S3 if successful
setInterval(() => {
  getRankFromDB((err, americanScores, europeanScores, tournamentScores) => {
    if (!err) {
      const scoreData = {timestamp: Date.now(),
        americanScores: americanScores,
        europeanScores: europeanScores};

      if (tournamentScores) {
        scoreData.tournamentScores = tournamentScores;
      }

      // Let's only write to S3 if these scores have changed
      checkScoreChange(scoreData, (diff) => {
        if (diff != 'same') {
          // It's not the same, so try to write it out
          const params = {Body: JSON.stringify(scoreData),
            Bucket: 'garrett-alexa-usage',
            Key: 'RouletteScores.txt'};

          s3.putObject(params, (err, data) => {
            if (err) {
              console.log(err, err.stack);
            }
          });
        }
      });
    }
  });
}, 1000*60*5);

// Send a summary mail every 12 hours
setInterval(() => {
  // Yes, this is the first run of the day, so let's send an e-mail summary
  blackjack.getBlackjackMail((bjText) => {
    getSummaryMail((rouletteText) => {
      const mailBody = 'BLACKJACK\r\n' + bjText + '\r\n\r\nROULETTE\r\n' + rouletteText;

      console.log(mailBody);
      mail.sendEmail(mailBody, (err, data) => {
        if (err) {
          console.log('Error sending mail ' + err);
        } else {
          console.log('Mail sent!');
        }
      });
    });
  });
}, 1000*60*60*12);
