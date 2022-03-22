const express = require('express');
const path = require('path');
const url = require('url');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const Player = require('./models/Player');
const Game = require('./models/GameState');
const bodyParser = require('body-parser');
const { mongo } = require('../config.json');

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb+srv://${mongo.user}:${mongo.pass}@cluster0.ftslg.mongodb.net/Clanks?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  err => {
    if(err) {
      console.log('Could not connect to database');
      throw err;
    }
  });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require('./routes')(app);
app.use((req, res) => {
  res.status(404).send({ url: req.originalUrl + ' not found'});
})

const ready = new Promise((resolve, reject) => {
  app.listen(port, (err) => {
    if(err) {
      reject(err);
      throw err;
    }
  
    console.log('Listening on port ' + port)
    resolve();
  });
})




module.exports = ready;