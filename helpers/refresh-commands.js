//@ts-check
const { Client } = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, quiet } = require('../config.json');
// @ts-ignore
const transformCommand = require('../helpers/transform-command.js');

/**
 * @function 
 * @param {Client} client
 * @param {{
 * relocate?: {command: string, namespace: string},
 * guild?: string
 * }} [options]
 */
module.exports.refresh = (client, options) => {
  if(options.relocate) {
    fs.renameSync(`./commands/locked/${options.relocate.command}.js`, `./commands/${options.relocate.namespace}/${options.relocate.command}.js`);
  }

  // @ts-ignore
  const c = client.commands.map(c => transformCommand.call(c));
  
  const rest = new REST({ version: '9' }).setToken(token);

  (async () => {
    try {
      console.log('Refreshing application commands');

      if(options.guild) {
        await rest.put(
          Routes.applicationGuildCommands(client.application.id, quiet),
          { body: c }
        );
      } else {
        await rest.put(
          Routes.applicationCommands(client.application.id),
          { body: c }
        );
      }

      

      console.log('Done.');
    } catch (error) {
      console.log('Something went wrong.');
      console.error(error);
    }
  })();
}

module.exports.name = 'refreshCommands';