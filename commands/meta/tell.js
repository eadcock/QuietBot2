const {getPlayers, confirm} = require('../../helpers');
const { CommandInteraction, Message } = require('discord.js');
let game;
module.exports = (index, g) => {
  game = g;
  return {
    meta: {
      name: 'tell',
      description: 'Send a player a message through me. I\'ll ask if you wish to send it anonymously.',
      type: 1,
      requiresStart: true,
      options: [
        {
          name: 'message',
          description: 'The message you wish to send',
          type: 3,
          required: true,
        }
      ],
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      interaction.deferReply({ ephemeral: true });
      interaction.reply({ content: this.command(interaction.channel, interaction.user, interraction.options.getString('message')), ephemeral: true });
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
      this.command(message.channel, message.user, args.join(' '));
    },
    /**
     * 
     * @param {Channel} channel 
     * @param {User} user 
     * @param {string} dm 
     */
    async command(channel, user, dm) {
      const you = await game.resolvePlayer(user);
      const targets = getPlayers.call(channel, `Who would you like to send the message to (you can select multiple players.)`, game.players).map(p => p.author);
      confirm.call(channel, 'Would you like to send this message anonymously?').then(result => {
        if(result) {
          targets.forEach(user => sender.sendDM(user, `You've got an incoming message! I don't know who it's from though...\n\nMessage: ${dm}`).then(_ => {
            
          }).catch(e => {
            channel.send({ content: 'Sorry, there was a probably sending your dm to ' + user, ephemeral: true });
            console.log('Someone tried sending a dm and failed');
            console.log(e);
          }));
        } else {
          targets.forEach(
            user => sender.sendDM(user, `You've got an incoming message! It's from ${you}.\n\nMessage: ${dm}`)
              .then(_ => {
                
              }).catch(e => {
                channel.send({ content: 'Sorry, there was a probably sending your dm to ' + user, ephemeral: true });
                console.log('Someone tried sending a dm and failed');
                console.log(e);
              })
          );
          return `I've finished sending your dm${targets.length > 0 ? 's' : ''}.`;
        }
      }).catch(err => {
        console.log('Something went wrong using /tell');
        console.error(err);
        return 'Sorry, something went wrong.';
      });
    }
  }
}