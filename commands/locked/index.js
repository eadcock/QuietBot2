const { ApplicationCommandOptionTypes } = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, quiet } = require('../../config.json');
const { refresh } = require('../../helpers').refreshCommands;

module.exports.unlockCommand = (client, commandName, newLoc) => {
  refresh(client, { relocate: { commandName, newNamespace: newLoc }});
}