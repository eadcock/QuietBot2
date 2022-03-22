//@ts-check
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { CommandInteraction, Message, User } = require('discord.js');
// @ts-ignore
const { parseLocation } = require('../../helpers').parseLocation;
const { Game } = require('../../tanktactics/game.js');

module.exports = (/**@type {any} */_index, /** @type {Game} */ game) => {
  return {
    meta: {
      name: 'gift',
      description: 'Shoot an AP at a tile. It deals no damage, but if anyone occupies that tile they will gain the AP',
      type: ApplicationCommandOptionType.Subcommand,
      display: true,
      requiresStart: true,
      cost: 1,
      potency: 1,
      options: [
        {
          name: 'row',
          description: 'The ROW of the tile you\'d like to shoot',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            {
              name: 'A',
              value: 'A',
            },
            {
              name: 'B',
              value: 'B',
            },
            {
              name: 'C',
              value: 'C',
            },
            {
              name: 'D',
              value: 'D',
            },
            {
              name: 'E',
              value: 'E',
            },
            {
              name: 'F',
              value: 'F',
            },
            {
              name: 'G',
              value: 'G',
            },
            {
              name: 'H',
              value: 'H',
            },
            {
              name: 'I',
              value: 'I',
            },
            {
              name: 'J',
              value: 'J',
            },
            {
              name: 'K',
              value: 'K',
            },
            {
              name: 'L',
              value: 'L',
            },
            {
              name: 'M',
              value: 'M',
            },
            {
              name: 'N',
              value: 'N',
            },
            {
              name: 'O',
              value: 'O',
            },
            {
              name: 'P',
              value: 'P',
            },
            {
              name: 'Q',
              value: 'Q',
            },
            {
              name: 'R',
              value: 'R',
            },
            {
              name: 'S',
              value: 'S',
            },
            {
              name: 'T',
              value: 'T',
            },
            {
              name: 'U',
              value: 'U',
            },
            {
              name: 'V',
              value: 'V',
            },
            {
              name: 'W',
              value: 'W',
            },
            {
              name: 'X',
              value: 'X',
            },
          ]
        },
        {
          name: 'column',
          description: 'The COLUMN of the tile you\'d like to shoot',
          type: ApplicationCommandOptionType.Integer,
          required: true,
          choices: [
            {
              name: '1',
              value: 1
            },
            {
              name: '2',
              value: 2
            },
            {
              name: '3',
              value: 3
            },
            {
              name: '4',
              value: 4
            },
            {
              name: '5',
              value: 5
            },
            {
              name: '6',
              value: 6
            },
            {
              name: '7',
              value: 7
            },
            {
              name: '8',
              value: 8
            },
            {
              name: '9',
              value: 9
            },
            {
              name: '10',
              value: 10
            },
            {
              name: '11',
              value: 11
            },
            {
              name: '12',
              value: 12
            },
            {
              name: '13',
              value: 13
            },
            {
              name: '14',
              value: 14
            },
            {
              name: '15',
              value: 15
            },
            {
              name: '16',
              value: 16
            },
            {
              name: '17',
              value: 17
            },
            {
              name: '18',
              value: 18
            },
          ]
        }
      ],
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      this.command(interaction, { location: interaction.options.getString('row') + interaction.options.getInteger('column') });
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     * @returns 
     */
    parseArgs(message, ...args) {
      let location;
      if(args.length === 1) {
        location = args[0];
      } else if (args.length === 2) {
        location = args.join('');
      } else {
        message.reply(`Sorry, but you didn't specify a location`);
        return;
      }

      this.command(message, { location });
    },
    /**
     * 
     * @param {CommandInteraction|Message} interaction 
     * @param {{location: string}} options 
     * @returns 
     */
    command(interaction, options) {
      const user = interaction instanceof Message ? interaction.author : interaction.user;
      const player = game.resolvePlayer(user);
      if(player.ap < 1) {
        return { content: `You don't have sufficient AP to perform this action.`, ephemeral: true };
      }

      let parsed = parseLocation(interaction.channel, options.location);
      if(parsed) {
        const result = game.gift(player.tank, parsed);
        if(result.success) {
          if(interaction.channel.type === 'DM') {
            const response = { content: `You have successfully launched an AP onto the board!`, ephemeral: true };
            interaction.reply(response);
          }
          game.announce(result.message, 'playerEvent');
        } else {
          switch(result.reason) {
            case 'out of range':
              interaction.reply({ content: `${options.location} is out of your range.`, ephemeral: true });
              break;
            case 'insufficient ap':
              interaction.reply({ content: `You don't have sufficient AP to perform this action.`, ephemeral: true });
              break;
          }
        }
      } else {
        interaction.reply('Sorry, something went wrong parsing the location.');
      }
    },
  }
}