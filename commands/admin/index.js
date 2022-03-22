//@ts-check
const { Collection, CommandInteraction, Message } = require('discord.js');
const fs = require('fs');
const _ = require('underscore');

module.exports = (index, game) => {
  const commands = new Collection();
  const files = fs.readdirSync('./commands/admin').filter(f => f !== 'index.js' && f.endsWith('.js'));
  for(const file of files) {
    const c = require(`./${file}`)(index, game);
    commands.set(c.meta.name, c);
  }
  return {
    meta: {
      name: 'admin',
      description: `All administrative related commands.`,
    },
    commands: commands,
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      this.commands.get(interaction.options.getSubcommand()).execute(interaction);
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     */
    parseArgs(message, ...args) {
      if(!this.commands.has(args[0])) {
        message.reply('Sorry, that is not a valid subcommand.');
        return;
      }

      this.commands.get(args[0]).parseArgs(message, ...args);
    },
  };
}