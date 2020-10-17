const express = require('express')
const app = express()

const DB = {
  'vokieciu-1': {
    address: 'Vokieciu Gatve',
    totalSpots: 100,
    takenSpots: 23,
    updatedDate: new Date()
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

app.listen(3000)