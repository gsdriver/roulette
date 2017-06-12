const aws = require('aws-sdk');

aws.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: 'us-east-1',
});

const ses = new aws.SES();

module.exports = {
  // Sends e-mail
  sendEmail: function(text, callback) {
    const digestName = (new Date(Date.now()).getHours() < 12)
            ? 'Alexa Skill Usage Morning Digest'
            : 'Alexa Skill Usage Evening Digest';

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
          Data: digestName,
          Charset: 'UTF-8',
        },
      },
      Source: 'garrettv@replacementgameparts.com',
    };

    ses.sendEmail(params, callback);
  },
};
