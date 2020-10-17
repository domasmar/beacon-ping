const express = require('express')
const app = express()

const { ai } = require('./ai');

function updateDatabase(scheduleNext = true) {

  setTimeout(() => {
    updateDatabase(true)
  }, 10000);
}

updateDatabase();

const DB = {
  'vokieciu-1': {
    address: 'Vokieciu Gatve',
    totalSpots: 100,
    takenSpots: 23,
    updatedDate: new Date().toISOString().replace('T', ' ' ).replace('Z', '').replace(/\.\d{3}$/, ''),
    location: {lat: 54.679608, lng: 25.283881}
  },
  'vilniaus_g': {
    address: 'Vilniaus g. 39',
    imageSource: '',
    totalSpots: 42,
    takenSpots: 5,
    updatedDate: new Date().toISOString().replace('T', ' ' ).replace('Z', '').replace(/\.\d{3}$/, ''),
    location: {lat: 54.682144, lng: 25.280008}
  }
};

app.get('/street', function (req, res) {
  console.log(req.query);
  const street = req.query.street;
  if (street && DB[street]) {
    res.json(DB[street]);
  } else {
    res.sendStatus(404);
  }
})

app.listen(3000);

console.log('running');