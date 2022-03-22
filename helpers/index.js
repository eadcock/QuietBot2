const { ApplicationCommandOptionTypes } = require('discord.js');
const fs = require('fs');
const _ = require('underscore');

const obj = {};
const files = fs.readdirSync('./helpers').filter(f => f !== 'index.js' && f.endsWith('.js'));
for(const file of files) {
  const helper = require(`./${file}`);
  obj[helper.name] = helper;
}

module.exports = obj;