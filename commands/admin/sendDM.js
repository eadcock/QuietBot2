const { getPlayers } = require('../../helpers');
console.log(require('../../helpers'));
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { CommandInteraction, Message } = require('discord.js')
let game;
module.exports = (index, g) => {
  game = g;
  return {
    meta: {
      name: 'send_dm',
      description: 'Speak through me',
      type: 1,
      requiresStart: true,
      options: [
        {
          name: 'message',
          description: 'The message you wish to send',
          type: ApplicationCommandOptionType.String,
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
      interaction.reply({ content: this.command(interaction, { message: interraction.options.getString('message') }), ephemeral: true });
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
     * @param {CommandInteraction} interaction 
     * @param {{message: string}} options 
     */
    async command(interaction, options) {
      const ephemeral = interaction.channel === 'DM';
      const targets = await getPlayers.call(interaction.channel, `Who would you like to send the message to (you can select multiple players.)`, game.players, ephemeral).map(p => p.author);
      targets.forEach(user => sender.sendDM(user, `You've got an incoming message! I, uh, can't quite figure out where it's coming from though...\n\nMessage: ${options.message}`).then(_ => {}).catch(e => {
        channel.send({ content: 'Sorry, there was a problem sending your dm to ' + user, ephemeral: true });
        console.log('Someone tried sending a dm and failed');
        console.log(e);
      }));
    }
  }
}