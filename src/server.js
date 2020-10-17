const express = require('express')
const fs = require('fs');
const {takePlayAndTakeScreenshot} = require("./screenshots/take");
const app = express()

const {ai} = require('./ai');

const now = () => new Date().toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}$/, '')

async function updateDatabase() {
  for (const [, data] of Object.entries(DB)) {
    const randomDiff = Math.floor(Math.random() * (Math.random() - 0.3) * 5);
    data.updatedDate = now();
    if (typeof data.imageIndex !== 'undefined') {
      const nextIndex = (data.imageIndex + 1) % data.sources.length;

      const cacheFile = `${__dirname}/../public/generated/${data.sources[nextIndex]}.json`;
      const generatedImage = `public/generated/${data.sources[nextIndex]}.jpg`;

      const fromCache = JSON.parse(fs.readFileSync(cacheFile, {encoding: 'utf-8'}));
      const labelWithCar = fromCache.Labels.find(l => l.Name === 'Car');

      data.takenSpots = ((labelWithCar && labelWithCar.Instances) || []).length;
      data.sourceImage = generatedImage;
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
    address: 'Vokieciu Gatve',
    totalSpots: 100,
    takenSpots: 23,
    updatedDate: now(),
    location: {lat: 54.679608, lng: 25.283881}
  },
  'vilniaus_g': {
    address: 'Vilniaus g. 39',
    totalSpots: 42,
    takenSpots: 5,
    updatedDate: now(),
    location: {lat: 54.682144, lng: 25.280008}
  },
  'opera': {
    address: 'A. Vienuolio g. 1',
    totalSpots: 20, // approx
    takenSpots: 0,
    updatedDate: now(),
    location: {lat: 54.6881731, lng: 25.2787993},
    imageIndex: 0,
    sourceImage: 'generated/operos-ir-baleto-aikstele-19h00m28s649.jpg',
    sources: [
      'operos-ir-baleto-aikstele-19h00m28s649',
      'operos-ir-baleto-aikstele-19h00m36s069',
      'operos-ir-baleto-aikstele-19h00m42s741',
      'operos-ir-baleto-aikstele-19h00m50s654',
      'operos-ir-baleto-aikstele-19h00m57s731'
    ]
  }
};

app.use(express.static('public'))

app.get('/api/streets', function (req, res) {
  const response = Object.entries(DB).map(([streetSlug, data]) => {
    return {
      address: data.address,
      totalSpots: data.totalSpots,
      takenSpots: data.takenSpots,
      updatedDate: data.updatedDate,
      location: data.location,
      ...(data.sourceImage && {sourceImage: data.sourceImage})
    }
  })

  res.json(response);
})

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

async function startProcessingRealTimeImage() {
  if (!running) return;

  try {
    const imageInBase64 = await takePlayAndTakeScreenshot()
    const filename = await new Promise((resolve, reject) => {
      const fileName = process.env.PUBLIC_DIR + '/generated/vilnius' + '-' + now() + '.png';
      createdImages.push(fileName);
      fs.writeFile(fileName, imageInBase64, 'base64', function (err) {
        if (err) reject(err);
        else resolve(fileName);
      });
    });

    const result = await ai(filename, false);

    createdImagesAIs.push({filename, awsResult: result});

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