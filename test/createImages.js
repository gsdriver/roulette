//
// Creates images for single and double wheel
//

const Jimp = require('jimp');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

let ballImage;
let doubleImage;
let singleImage;
let background;
const imageDir = '../images/wheels/';

function createImage(double, number) {
  const image = background.clone();
  const wheelImage = (double ? doubleImage : singleImage).clone();
  wheelImage.resize(380, 380);
  const degree = (number * 360) / (double ? 38 : 37);
  wheelImage.rotate(degree);
  const newSize = wheelImage.bitmap.width;
  image.composite(wheelImage, (1024 - newSize) / 2, (600 - newSize) / 2);

  // Draw the ball
  if (double) {
    image.composite(ballImage, 506, 176);
  } else {
    image.composite(ballImage, 516, 182);
  }
  return image;
}

function initImages(callback) {
  Jimp.read(imageDir + 'doublezero.png', (err, image) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      image.crop(0, 0, 404, 404);
      doubleImage = image;
      Jimp.read(imageDir + 'singlezero.png', (err, image) => {
        if (err) {
          console.log(err);
          callback(err);
        } else {
          singleImage = image;
          Jimp.read(imageDir + 'background.png', (err, image) => {
            if (err) {
              console.log(err);
              callback(err);
            } else {
              background = image;
              Jimp.read(imageDir + 'ball.png', (err, image) => {
                if (err) {
                  console.log(err);
                } else {
                  ballImage = image;
                  ballImage.resize(18, 20);
                }
                callback(err);
              });
            }
          });
        }
      });
    }
  });
}

function saveImage(image, name, callback) {
  const key = 'roulette/' + name + '.png';

  // Now write to S3
  image.getBuffer(Jimp.MIME_PNG, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      s3.putObject({Body: data,
           ACL: 'public-read',
           Bucket: 'garrett-alexa-images',
           Key: key}, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        }
        callback(err);
      });
    }
  });
}

initImages((err) => {
  const doubleOrder = ['00', 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2, 0,
    28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1];
  const singleOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  if (!err) {
    let i;
    let numCalls = doubleOrder.length;

    // Double wheel images
    for (i = 0; i < doubleOrder.length; i++) {
      const image = createImage(true, i);
      saveImage(image, 'double' + doubleOrder[i], () => {
        if (--numCalls === 0) {
          single();
        }
      });
    }

    function single() {
      numCalls = singleOrder.length;
      for (i = 0; i < singleOrder.length; i++) {
        const image = createImage(false, i);

        saveImage(image, 'single' + singleOrder[i], () => {
          if (--numCalls === 0) {
            done();
          }
        });
      }

      function done() {
        console.log('All done!');
      }
    }
  }
});
