//
// Utility functions
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

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

// Get the ranks every 5 minutes and write to S3 if successful
setInterval(() => {
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
}, 1000*60*5);
