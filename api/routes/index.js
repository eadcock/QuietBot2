module.exports = (app) => {
  require('./playerRoutes.js')(app);
  require('./gameRoutes.js')(app);
}