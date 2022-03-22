module.exports = (app) => {
  const control = require('../controllers/playerController.js');

  app.route('/').get((req, res) => {
    res.status(200).send(`<p>I'm alive!</p>`);
  })

  app.route('/player')
    .get(control.getAllPlayers)
    .post(control.createPlayer);

  app.route('/player/:playerId')
    .get(control.getPlayer)
    .put(control.updatePlayer)
    .delete(control.deletePlayer);
}