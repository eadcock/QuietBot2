//@ts-check
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { CommandInteraction, Message } = require('discord.js');
//@ts-ignore
const { getPlayer } = require('../../helpers');
const { Game } = require('../../tanktactics/game');
let game;
module.exports = (_, /** @type {Game} */g) => {
  game = g;
  return {
    meta: {
      name: 'stats',
      description: 'View your current stats, or the stats of another player',
      type: ApplicationCommandOptionType.Subcommand,
      requiresStart: true,
      options: [
        {
          name: 'me',
          description: 'Whether to display your own stats',
          type: 5,
          require: false
        }
      ],
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
      this.command(interaction, { self: interaction.options.getBoolean('me', false) })
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     */
    parseArgs(message, ...args) {
      let self = false;
      if(args.length) {
        if(args[0] === 'me') {
          self = true;
        } else if(args[0] === 'true') {
          self = true;
        }
      }
      this.command(message, { self });
    },
    /**
     * 
     * @param {Message|CommandInteraction} interaction 
     * @param {{self: boolean}} options 
     */
    async command(interaction, options) {
      let player;
      const self = options.self;
      if(self) {
        player = game.players.find(p => p.emoji === (interaction instanceof Message ? interaction.author : interaction.user).id);
      } else {
        player = getPlayer.call(interaction.channel, `Who's stats would you like to see?`, game.players);
      }
      
      if(!player) interaction.reply('You currently aren\'t a regestered player! Use `/join` to join a game, if it\'s accepting players.');

      const embed = {
        color: '#0099ff',
        title: `${player.emoji}`,
        fields: [
          {
            name: 'Status', 
            value: player.alive ? 'You are currently alive' : 'You are a member of The Jury',
            inline: false,
          }
        ],
        footer: {
          text: 'Times prayed: ' + player.timesPrayed,
        }
      }

      if(!player.anon || (interaction.channel.type === 'DM' && self)) {
        embed.author = {
          name: player.author.username,
          icon_url: player.author.avatarURL({ dynamic: true, size: 32 })
        }
      }

      if(player.alive) {
        embed.fields.push({ name: 'Action Points', value: `${player.ap} AP`, inline: true });
      } else {
        embed.fields.push({ name: 'Jury Ballots', value: `${player.juryBallots} ballots`, inline: true });
      }

      embed.fields.push({ name: 'Voting Slips', value: `${player.votingSlips} slips`, inline: true });

      embed.fields.push({ name: '\u200b', value: '\u200b', inline: false });

      embed.fields.push([
        { name: 'Hearts', value: player.tank.health, inline: true },
        { name: 'Range', value: player.tank.range, inline: true },
        { name: 'Damage', value: player.tank.damage, inline: true }
      ]);

      //@ts-ignore
      interaction.reply({ embed: embed });
    }
  }
}