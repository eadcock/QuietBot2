const { CommandInteraction, Message } = require("discord.js");
const { parseTag } = require('../../helpers');

let index;
/**
 * 
 * @param {import('discord.js').Client} index 
 * @param {import('../../tanktactics/game.js').Game} game 
 * @returns 
 */
module.exports = (index, game) => {
  this.index = index;
  return {
    meta: {
      name: 'start',
      description: 'Start a new game!',
      type: 1,
      requiresStart: false,
      options: [
        {
          name: 'logging',
          description: 'The channel to log game events to',
          type: 7,
          required: false,
        },
        {
          name: 'board',
          description: 'The channel to post and update the board',
          type: 7,
          required: false,
        }
      ]
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      interaction.reply(this.command(interaction, interaction.options.getChannel('logging channel', false), interaction.options.getChannel('board channel', false)));
    },
    /**
     * 
     * @param {Message} message 
     * @param {string} logChannel 
     * @param {string} boardChannel 
     */
    parseArgs(message, logChannel, boardChannel) {
      index.client.channels.fetch(parseTag.parseTag(logChannel)).then(l => {
        index.client.channels.fetch(parseTag.parseTag(boardChannel)).then(b => {
          message.reply(this.command(message, l, b));
        });
      });
    },
    /**
     * 
     * @param {CommandInteraction|Message} interaction 
     * @param {Channel} logChannel 
     * @param {Channel} boardChannel 
     * @returns 
     */
    command(interaction, logChannel, boardChannel) {
      if(game.admin.state !== 'sleep') {
        return { content: 'There is already a game in progress.', ephemeral: true };
      }

      return game.newGame(interaction.channel, interaction instanceof Message ? interaction.author : interaction.user, logChannel, boardChannel);
    }
  }
}