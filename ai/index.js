require('dotenv').config()

const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config.update({region: 'eu-west-1'});

const credentials = new AWS.Credentials({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
})

const rekognition = new AWS.Rekognition({credentials});

const file = fs.readFileSync('../source/trinapolio-impulsas-1.jpg')

const params = {
  Image: {Bytes: file},
};

rekognition.detectLabels(params, (err, data) => {
  if (err) { console.error(err); return; }

  console.log(JSON.stringify(data, null, 2));

});