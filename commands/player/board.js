const { ApplicationCommandOptionType } = require("discord-api-types/v9");
const { CommandInteraction, Message } = require('discord.js');

module.exports = (index, game) => {
  return {
    meta: {
      name: 'board',
      description: 'Display the current state of the board.',
      type: ApplicationCommandOptionType.Subcommand,
      requiresStart: false,
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      this.command(interaction);
    },
    /**
     * 
     * @param {Message} message 
     * @param {..string} args 
     */
    parseArgs(message, ...args) {
      this.command(message);
    },
    /**
     * 
     * @param {CommandInteraction|Message} interaction 
     */
    command(interaction) {
      interaction.reply(`Here's the current state of the board:`);
      game.displayBoard(interaction.channel);
    }
  }
}