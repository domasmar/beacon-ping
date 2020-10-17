require('dotenv').config()

const { ai } = require('./ai');

const onlyCache = process.argv.indexOf('-cache') > 0;
const fileName = (() => {
  const fileIndex = process.argv.indexOf('-file');
  if (fileIndex < 0) throw Error('missing -file');
  if (process.argv.length < fileIndex) throw Error('missing filename for -file');
  if (!process.argv[fileIndex + 1]) throw Error('missing filename for -file');
  return process.argv[fileIndex + 1];
})();


(async () => {
  const response = await ai(fileName, onlyCache)
  console.log(JSON.stringify(response));
})();