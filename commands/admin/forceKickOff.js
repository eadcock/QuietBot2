const { ApplicationCommandOptionType, CommandInteraction, Message } = require('discord.js');
let game;
module.exports = (i, g) => {
  game = g;
  return {
    meta: {
      name: 'kickoff',
      description: 'Force the queued game to kick off',
      requiresStart: false,
      type: 1,
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      interaction.reply({content: 'Kick off launched!', ephemeral: true});
      this.command();
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     */
    parseArgs(message, ...args) {
      this.command();
    },
    command() {
      game.forceKickoff();
    }
  }
}