const express = require('express')
const {takePlayAndTakeScreenshot} = require("./screenshots/take");
const app = express()

// TODO use AI
const {ai} = require('./ai');

const now = () => new Date().toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}$/, '')

async function updateDatabase() {

  Object.entries(DB).forEach(([streetSlug, data]) => {

    const randomDiff = Math.floor(Math.random() * (Math.random() - 0.3) * 5)

    data.updatedDate = now();
    data.takenSpots = Math.min(Math.max(0, data.takenSpots + randomDiff), data.totalSpots);
  });

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
    }
  })

  res.json(response);
})

app.get('/api/latest_image_from_vilnius', async (req, res) => {
  try {
    const image = await takePlayAndTakeScreenshot()
    res.json({image});
  } catch (e) {
    console.error('latest_image_from_vilnius', e);
    res.sendStatus(500);
  }
})

app.listen(process.env.PORT || 3000);

console.log('running');