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
         if (data.Items[i].mapAttr && data.Items[i].mapAttr.M
           && data.Items[i].mapAttr.M.highScore
           && data.Items[i].mapAttr.M.highScore.M) {
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
       }

       if (data.LastEvaluatedKey) {
         return loop(false, data.LastEvaluatedKey);
       }
     });
   }
  })(true, null).then(() => {
    americanScores.sort((a, b) => (b-a));
    europeanScores.sort((a, b) => (b-a));
    callback(null, americanScores, europeanScores);
  }).catch((err) => {
    console.log('Error scanning: ' + err);
    callback(err, null, null);
  });
}

// Let's look at Roulette too while we're at it
function getSummaryMail(callback) {
  const american = {high: 0, spins: 0, players: 0};
  const european = {high: 0, spins: 0, players: 0};
  let spins;
  let text;

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
         if (data.Items[i].mapAttr && data.Items[i].mapAttr.M
           && data.Items[i].mapAttr.M.highScore
           && data.Items[i].mapAttr.M.highScore.M) {
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
    callback(text);
  }).catch((err) => {
    text = 'Error getting Roulette results: ' + err;
    callback(text);
  });
}

// Get the ranks every 5 minutes and write to S3 if successful
setInterval(() => {
  // First let's see if this is the first run of the day
  s3.getObject({Bucket: 'garrett-alexa-usage', Key: 'RouletteScores.txt'}, (err, data) => {
    if (data) {
      const scores = JSON.parse(data.Body.toString('ascii'));

      const lastRun = new Date(parseInt(scores.timestamp));
      const now = new Date(Date.now());
      if (lastRun.getDate() != now.getDate()) {
        // Yes, this is the first run of the day, so let's send an e-mail summary
        blackjack.getBlackjackMail((bjText) => {
          getSummaryMail((rouletteText) => {
            mail.sendEmail('BLACKJACK\r\n' + bjText + '\r\n\r\nROULETTE\r\n' + rouletteText, (err, data) => {
              if (err) {
                console.log('Error sending mail ' + err);
              } else {
                console.log('Mail sent!');
              }
            });
          });
        });
      }
    }

    getRankFromDB((err, americanScores, europeanScores) => {
      if (!err) {
        const scoreData = {timestamp: Date.now(),
          americanScores: americanScores,
          europeanScores: europeanScores};
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
  });
}, 1000*60*5);
