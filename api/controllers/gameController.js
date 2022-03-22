const mongoose = require('mongoose');
const Game = mongoose.model('Game');

module.exports = {
  getAllGames(req, res) {
    console.log('request recieved');
    Game.find({}, (err, game) => {
      console.log('recieved games');
      if(err)
        res.status(500).send(err);
      else 
        res.json(game);
    });
  },

  createGame(req, res) {
    console.log('creating game');
    const newGame = new Game(req.body);
    newGame.save().then(game => {
      res.json(game);
    }).catch(err => {
      console.log('SOMETHING WENT WRONG');
      console.error(err);
      res.status(500).send(err);
    })
  },

  getGame(req, res) {
    if(!mongoose.isValidObjectId(req.params.gameId)) {
      res.status(400).send({ message: 'Invalid object Id'});
      return;
    };
    Game.findById(req.params.gameId, (err, game) => {
      if(err) {
        console.log('err');
        res.status(500).send(err);
        return;
      };
      res.json(game);
    });
  },

  updateGame(req, res) {
    if(!mongoose.isValidObjectId(req.params.gameId)) {
      res.status(400).send({ message: 'Invalid object Id'});
      return;
    };
    Game.findOneAndUpdate({_id: req.params.gameId}, req.body, {new: true, useFindAndModify: false}, (err, game) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      };
      res.json(game);
    });
  },

  deleteGame(req, res) {
    if(!mongoose.isValidObjectId(req.params.gameId)) {
      res.status(400).send({ message: 'Invalid object Id'});
      return;
    };
    Game.deleteOne({_id: req.params.gameId}, (err, game) => {
      if (err) res.status(500).send(err);
      else res.json({ message: 'Game deleted successfully' });
    })
  }
}