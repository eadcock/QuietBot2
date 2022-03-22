const { CommandInteraction, Message } = require('discord.js');
let game;
module.exports = (i, g) => {
  game = g;
  return {
    meta: {
      name: 'save',
      description: 'Save the current game',
      requiresStart: true,
      type: 1,
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      interaction.deferReply().then(_ => {
        game.saveGame().then(_ => {
          console.log(interaction);
          interaction.editReply('Game saved!');
        }).catch(e => {
          interaction.editReply('Game failed to save. Check the log.');
          console.log('Error saving the game: ' + e);
        });
      });
      
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     */
    parseArgs(message, ...args) {
      message.reply('Saving game...').then(m => {
        game.saveGame().then(_ => {
          m.edit({ content: 'Game saved!' });
        });
      })
    },
    command(interaction) {
      
    }
  }
}