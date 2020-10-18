require('dotenv').config();

const fs = require('fs');
const AWS = require('aws-sdk');
const {last} = require('lodash');

module.exports = {ai};


async function ai(fileName, onlyCache) {
  if (onlyCache) {
    console.log(`[${fileName}] Searching in cache`);

    const strippedFileName = getFilenameWithoutFormat(fileName);
    let content;
    try {
      content = fs.readFileSync(cacheFile(strippedFileName), {encoding: 'utf-8'})
    } catch (e) {
    }
    if (!content) {
      console.log(`[${fileName}] Not in cache`);
      console.log(`[${fileName}] Returning default!`);
      content = fs.readFileSync(cacheFile('default'), {encoding: 'utf-8'})
    }

    return JSON.parse(content);
  } else {
    const strippedFileName = getFilenameWithoutFormat(fileName);
    if (haveInCache(strippedFileName)) {
      console.log(`[${fileName}] in in cache`);
      const content = fs.readFileSync(cacheFile(strippedFileName), {encoding: 'utf-8'});
      return JSON.parse(content);
    }

    console.log(`[${fileName}] not in cache. Calling AWS!`);

    AWS.config.update({region: 'eu-west-1'});

    const credentials = new AWS.Credentials({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
    });

    const rekognition = new AWS.Rekognition({credentials});

    const file = fs.readFileSync(fileName);

    const params = {
      Image: {Bytes: file},
    };

    return new Promise((resolve, reject) => {
      rekognition.detectLabels(params, (err, data) => {
        if (err) {
          console.log(`[${fileName}] ERROR IN AWS!`);
          console.error(err);
          reject(err);
          return;
        }

        console.log(`[${fileName}] RESPONSE FROM AWS!`);
        console.log(`[${fileName}] Saving to cache`);

        fs.writeFileSync(cacheFile(strippedFileName), JSON.stringify(data, null, 2));

        resolve(data);
      });
    })
  }
}


function getFilenameWithoutFormat(fileName) {
  const onlyFileName = last(fileName.split('/'));
  return onlyFileName.slice(0, onlyFileName.lastIndexOf('.'));
}

function haveInCache(filename) {
  try {
    fs.readFileSync(cacheFile(filename), {encoding: 'utf-8'});
    return true;
  } catch (e) {
  }
  return false;
}

function cacheFile(filename) {
    return process.env.PUBLIC_DIR + '/generated/' + filename + '.json';
}
