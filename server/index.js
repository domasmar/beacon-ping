const express = require('express')
const app = express()

const { ai } = require('../ai/ai');

const DB = {
  'vokieciu-1': {
    address: 'Vokieciu Gatve',
    totalSpots: 100,
    takenSpots: 23,
    updatedDate: new Date().toISOString().replace('T', ' ' ).replace('Z', '').replace(/\.\d{3}$/, '')
  }
};

// TODO refresh DB

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