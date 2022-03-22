const { REST } = require('@discordjs/rest');
const { quiet } = require('../config.json');
const { refresh } = require('../helpers').refreshCommands;
const { Client } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  /**
   * 
   * @param {Client} client 
   */
  execute(client) {
    refresh(client, { guild: quiet });    
  }
}