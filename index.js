"use strict";
const fs = require('fs');
const { Client, Collection, Intents, Channel, CategoryChannel, MessageReaction } = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ['CHANNEL']});
const prn = require('./pronouns.json');
const {transformCommand} = require('./helpers');
require('reflect-metadata');

const { prefix, token, quiet } = require('./config.json');

client.commands = new Collection();
client.messageCommands = new Collection();
client.questions = require('./conversation')();

const commandFiles = fs.readdirSync('./commands', { withFileTypes: true }).filter(file => file.isDirectory || file.name.endsWith('.js')).map(f => f.name);

/**
 * @type {{client: Client, ttByPass: Channel}}
 */
const publicAPI = {
  client,
  ttBypass: null,
}


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for(const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

(async () => {
  client.game = await require('./tanktactics/game.js').init(publicAPI, 'default');
  for (const file of commandFiles) {
    if(file === 'locked' || file === 'clanks') continue;
    const command = await require(`./commands/${file}`)(publicAPI, client.game);
    
    client.commands.set(command.meta.name, command);
    if(command.type === ApplicationCommandOptionType.SubcommandGroup) {
      command.commands.forEach(c => client.messageCommands.set(c.name, c));
    } else {
      client.messageCommands.set(command.name, command);
    }
  }
  console.log(client.commands);

  client.login(token);
})();