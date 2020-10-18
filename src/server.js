const express = require('express');
const fs = require('fs');
const {takePlayAndTakeScreenshot} = require("./screenshots/take");
const app = express();
const path = require('path');
const moment = require('moment');

const {ai} = require('./ai');

const now = () => moment().utcOffset(180).format('YYYY MM DD HH:mm:ss');

async function updateDatabase() {
  for (const [, data] of Object.entries(DB)) {
    if (data.real) {
      return;
    }
    const randomDiff = Math.floor(Math.random() * (Math.random() - 0.3) * 5);
    data.updatedDate = now();
    if (typeof data.imageIndex !== 'undefined') {
      const nextIndex = (data.imageIndex + 1) % data.sources.length;

      const cacheFile = `${__dirname}/../public/generated/${data.sources[nextIndex]}.json`;
      const generatedImage = `generated/${data.sources[nextIndex]}.jpg`;

      const fromCache = JSON.parse(fs.readFileSync(cacheFile, {encoding: 'utf-8'}));
      const labelWithCar = fromCache.Labels.find(l => l.Name === 'Car');

      const takenSpots = ((labelWithCar && labelWithCar.Instances) || []).filter(i => i.Confidence > data.confidence).length

      data.takenSpots = takenSpots;
      data.image = generatedImage;
      data.imageIndex = nextIndex;
    } else {
      data.takenSpots = Math.min(Math.max(0, data.takenSpots + randomDiff), data.totalSpots);
    }
  }

  setTimeout(() => {
    updateDatabase(true)
  }, 5000);
}

setTimeout(() => {
  updateDatabase(true);
}, 1000);

const DB = {
  'vokieciu-1': {
    address: 'Vokiečių g. 11',
    totalSpots: 5,
    takenSpots: 0,
    updatedDate: now(),
    location: {lat: 54.679608, lng: 25.283881},
    image: 'generated/vokieciu/PXL_20201018_081516416.jpg',
    confidence: 90,
    imageIndex: 0,
    sources: [
      'vokieciu/PXL_20201018_081516416',
      'vokieciu/PXL_20201018_081633419',
      'vokieciu/PXL_20201018_081636863',
    ]
  },
  'vilniaus_g': {
    address: 'Vilniaus g. 39',
    totalSpots: 9,
    takenSpots: 0,
    updatedDate: now(),
    location: {lat: 54.682144, lng: 25.280008},
    confidence: 0,
    imageIndex: 0,
    image: 'generated/vilniaus/vilniaus1.jpg',
    sources:[
      'vilniaus/vilniaus1',
      'vilniaus/vilniaus2',
      'vilniaus/vilniaus3',
      'vilniaus/vilniaus4',
      'vilniaus/vilniaus5',
      'vilniaus/vilniaus6',
      'vilniaus/vilniaus7',
    ]
  },
  'opera': {
    address: 'A. Vienuolio g. 1',
    totalSpots: 20, // approx
    takenSpots: 0,
    updatedDate: now(),
    location: {lat: 54.6881731, lng: 25.2787993},
    imageIndex: 0,
    confidence: 0,
    image: 'generated/opera/operos-ir-baleto-aikstele-19h00m28s649.jpg',
    sources: [
      'opera/operos-ir-baleto-aikstele-19h00m28s649',
      'opera/operos-ir-baleto-aikstele-19h00m36s069',
      'opera/operos-ir-baleto-aikstele-19h00m42s741',
      'opera/operos-ir-baleto-aikstele-19h00m50s654',
      'opera/operos-ir-baleto-aikstele-19h00m57s731'
    ]
  },
  'smugleviciaus': {
    address: 'P. Smugleviciaus g. 6',
    totalSpots: 14, // approx
    takenSpots: 0,
    updatedDate: now(),
    location: {lat: 54.736186, lng: 25.275899},
    imageIndex: 0,
    confidence: 0,
    image: 'generated/smugleviciaus/smugleviciausg_1.jpg',
    sources: [
      'smugleviciaus/smugleviciausg_1',
      'smugleviciaus/smugleviciausg_2',
      'smugleviciaus/smugleviciausg_3',
      'smugleviciaus/smugleviciausg_4',
    ]
  }
};

app.use(express.static('public'));
app.use('/source', express.static(path.join(__dirname, '../source')));

app.get('/api/streets', function (req, res) {
  const response = Object.entries(DB).map(([streetSlug, data]) => {
    return {
      address: data.address,
      totalSpots: data.totalSpots,
      takenSpots: data.takenSpots,
      updatedDate: data.updatedDate,
      location: data.location,
      image: data.image,
    }
  });

  res.json(response);
});

app.get('/api/created_images', (req, res) => {
  res.json({createdImages, createdImagesAIs});
});

app.get('/api/start', (req, res) => {
  running = true;
  setTimeout(() => startProcessingRealTimeImage(), 100);
  res.sendStatus(200);
});

app.get('/api/stop', (req, res) => {
  running = false;
  res.sendStatus(200);
});

app.get('/api/refresh_rate', (req, res) => {
  refreshRate = Math.max(parseInt(req.query.value), 20000);
  res.sendStatus(200);
});

const {putIndicators} = require('./indicators');

async function startProcessingRealTimeImage() {
  if (!running) return;

  try {
    const imageInBase64 = await takePlayAndTakeScreenshot();


    const baseFileName = process.env.PUBLIC_DIR + '/generated/vilnius' + '-' + now();
    const sourceFileName = baseFileName + '.png';
    const destinationFileName = baseFileName + '-processed.jpg';

    const filename = await new Promise((resolve, reject) => {
      createdImages.push(sourceFileName);
      fs.writeFile(sourceFileName, imageInBase64, 'base64', function (err) {
        if (err) reject(err);
        else resolve(sourceFileName);
      });
    });

    const result = await ai(filename, false);

    const labelWithCar = result.Labels.find(l => l.Name === 'Car');
    const instances = (labelWithCar && labelWithCar.Instances) || [];

    await putIndicators(sourceFileName, destinationFileName, instances, 0);

    createdImagesAIs.push({filename, awsResult: result});

    DB['sv_jonu'] = {
      address: 'Sv. Jono g. 13-15',
      totalSpots: 12, // approx
      takenSpots: instances.length,
      updatedDate: now(),
      location: {lat: 54.682395, lng: 25.2889421},
      image: destinationFileName.replace(process.env.PUBLIC_DIR + '/', ''),
      real: true
    };

  } catch (e) {
    console.error(e);
  }

  if (running) {
    setTimeout(startProcessingRealTimeImage, refreshRate);
  }
}

const createdImages = [];
const createdImagesAIs = [];
let running = false;
let refreshRate = 60000;


app.listen(process.env.PORT || 3000);

console.log('running');
