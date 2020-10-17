const express = require('express')
const app = express()

const {ai} = require('./ai');

function updateDatabase(scheduleNext = true) {

  setTimeout(() => {
    updateDatabase(true)
  }, 10000);
}

// updateDatabase();

const DB = {
  'vokieciu-1': {
    address: 'Vokieciu Gatve',
    totalSpots: 100,
    takenSpots: 23,
    updatedDate: new Date().toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}$/, ''),
    location: {lat: 54.679608, lng: 25.283881}
  },
  'vilniaus_g': {
    address: 'Vilniaus g. 39',
    totalSpots: 42,
    takenSpots: 5,
    updatedDate: new Date().toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}$/, ''),
    location: {lat: 54.682144, lng: 25.280008}
  }
};

app.get('/streets', function (req, res) {
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

app.listen(process.env.PORT || 3000);

console.log('running');