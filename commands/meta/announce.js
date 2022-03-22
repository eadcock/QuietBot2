const { CommandInteraction, Message } = require("discord.js");
const {confirm} = require('../../helpers');
let game;
module.exports = (i, g) => {
  game = g;
  return {
    meta: {
      name: 'announce',
      description: 'Send a message to the main channel through me. I will ask if you wish to send it anonymously.',
      type: 1,
      requiresStart: true,
      options: [
        {
          name: 'message',
          description: 'What you would like to announce',
          required: true,
          type: 3,
        },
      ],
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      this.command(interaction, interaction.options.getString('message'));
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     * @returns 
     */
    parseArgs(message, ...args) {
      if(args.length === 0) {
        message.reply(`Sorry, but I'm not going to send a blank message.`);
        return;
      }
      this.command(message, args.join(' '));
    },
    /**
     * 
     * @param {CommandInteraction|Message} interaction 
     * @param {string} message
     */
    async command(interaction, message) {
      interaction.deferReply({ ephemeral: true })
      const you = await game.resolvePlayer(interaction.user);
      if(you.alive) {
        let obscured = [];
        message.split('').forEach(c => {
          if(c !== ' ' && Math.random() < 0.4) {
            obscured.push('||-||');
          } else {
            obscured.push(c);
          }
        });
        message = obscured.join('');
      }
      confirm.call(interaction.channel, 'Would you like to send this message anonymously? (y/n)').then(result => {
        let log = '';
        let type = you.alive ? 'playerEvent' : 'deadEvent';
        if(result) {
          game.admin.primaryChannel.send(`${you.alive ? 'A familiar, lively' : 'An old, haunting' } voice echoes through the air. They scream: ${message}`);
          log += 'Someone screamed.';
        } else {
          game.admin.primaryChannel.send(`${you.alive ? `${you}'s voice echoes through the air.` : 'An old, haunting voice pierces the air. They try to say their name, but can\'t.'} They scream: ${message}`);
          log += `${you.alive ? you : 'Someone'} screamed.`;
        }
        interaction.reply({ content: 'Done.', ephemeral: true });
        game.log(log, type);
      }).catch(e => {
        interaction.reply({ content: 'Sorry, something went wrong', ephemeral: true });
      });
    }
  }
}