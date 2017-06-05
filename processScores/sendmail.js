const aws = require('aws-sdk');

aws.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: 'us-west-2',
});

const ses = new aws.SES();

module.exports = {
  // Sends e-mail
  sendEmail: function(text, callback) {
    const params = {
      Destination: {
        ToAddresses: [
          'gsdriver@live.com',
        ],
      },
      Message: {
        Body: {
          Text: {
            Data: text,
            Charset: 'UTF-8',
          },
        },
        Subject: {
          Data: 'Alexa Skill Usage Daily Digest',
          Charset: 'UTF-8',
        },
      },
      Source: 'garrettv@replacementgameparts.com',
    };

    ses.sendEmail(params, callback);
  },
};
