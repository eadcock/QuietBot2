const Agenda = require('agenda');
const { mongo } = require('../config.json');
const { wait } = require('./await-promise.js');

const agenda = new Agenda({ db: { address: `mongodb+srv://${mongo.user}:${mongo.pass}@cluster0.ftslg.mongodb.net/Clanks?retryWrites=true&w=majority` }});
agenda.start();

const ready = new Promise(r => {
  agenda.on('ready', () => { r(); console.log('ready!') });
});

/**
 * @typedef {(id: string, time: string, task: function) => *} scheduleTask
 */

/**
 * @type {scheduleTask}
 */
const scheduleTask = async (id, time, task) => {
  await wait(ready);
  agenda.define(id, task);
  return agenda.schedule(time, id);
}

/**
 * @type {{scheduleTask: scheduleTask, name: string}}
 */
module.exports = {
  scheduleTask: scheduleTask,
  name: 'scheduler',
}