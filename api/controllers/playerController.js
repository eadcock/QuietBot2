const mongoose = require('mongoose');
const Player = mongoose.model('Player');

module.exports = {
  getAllPlayers(req, res) {
    console.log('request recieved');
    Player.find({}, (err, player) => {
      console.log('recieved players');
      if(err)
        res.status(500).send(err);
      else 
        res.json(player);
    });
  },

  createPlayer(req, res) {
    console.log('creating player');
    const newPlayer = new Player(req.body);
    newPlayer.save().then(player => {
      res.json(player);
    }).catch(err => {
      console.log('SOMETHING WENT WRONG');
      console.error(err);
      res.status(500).send(err);
    })
  },

  getPlayer(req, res) {
    if(!mongoose.isValidObjectId(req.params.playerId)) {
      res.status(400).send({ message: 'Invalid object Id'});
      return;
    };
    Player.findById(req.params.playerId, (err, player) => {
      if(err) {
        console.log('err');
        res.status(500).send(err);
        return;
      };
      res.json(player);
    });
  },

  updatePlayer(req, res) {
    if(!mongoose.isValidObjectId(req.params.playerId)) {
      res.status(400).send({ message: 'Invalid object Id'});
      return;
    };
    Player.findOneAndUpdate({_id: req.params.playerId}, req.body, {new: true, useFindAndModify: false}, (err, player) => {
      if (err) {
        res.status(500).send(err);
        return;
      };
      res.json(player);
    });
  },

  deletePlayer(req, res) {
    const search = {};
    if(!mongoose.isValidObjectId(req.params.playerId)) {
      res.status(400).send({ message: 'Invalid object Id'});
      return;
    };
    Player.deleteOne({_id: req.params.playerId}, (err, player) => {
      if (err) res.status(500).send(err);
      else res.json({ message: 'Player deleted successfully' });
    })
  }
}