const { MessageButton } = require('discord.js');

module.exports = function(index) {
  return {
    meta: {
      name: 'ping',
      description: 'Ping!',
    },
    
    execute(interaction) {
      interaction.reply({ content: 'Pong.', ephemeral: false });
    },
    parseArgs(message, args) {
      this.execute(message);
    },
  }
}