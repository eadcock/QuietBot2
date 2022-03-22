const control = require('../controllers/gameController.js');
module.exports = (app) => {
  app.route('/game')
    .get(control.getAllGames)
    .post(control.createGame);

  app.route('/game/:gameId')
    .get(control.getGame)
    .put(control.updateGame)
    .delete(control.deleteGame);
}