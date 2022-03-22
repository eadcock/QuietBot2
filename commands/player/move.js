const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { CommandInteraction, Message } = require('discord.js');
//@ts-ignore
const { parseLocation } = require('../../helpers');
const { Game } = require('../../tanktactics/game.js');

/**
 * @type {Game}
 */
let game;
module.exports = (/**@type {any} */_i, /** @type {Game} */ g) => {
  game = g;
  return {
    meta: {
      name: 'move',
      description: 'Move your tank somewhere on the board. Use #L notation (i.e. B12)',
      type: ApplicationCommandOptionType.Subcommand,
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
     */
    async command(interaction, options) {
      const user = interaction instanceof Message ? interaction.author : interaction.user;
      let response = {};
      let original = options.location;
      let parsed = parseLocation.parseLocation(original);
      if(parsed.result) {
        console.log(parsed);
        const player = await game.resolvePlayer(user);
        const result = game.move(player.tank, parsed);
        if(result.success) {
          player.ap -= this.cost;
          response = { content: 'Your tank has been moved to ' + original, ephemeral: interaction.channel.type !== 'DM' };
          if(interaction.channel.type === 'DM') {
            game.admin.primaryChannel.send(`${player} moved to ${original}`);
          }
          response.log = {
            message: `${player} moved to ${original}`,
            type: 'playerEvent',
          }
        } else {
          switch(result.reason) {
            case 'insufficient ap':
              response = { content: `You don't have sufficient AP to perform this action.`, ephemeral: true };
              break;
            case 'out of range':
              response = { content: `The tile you specified is out of your range.`, ephemeral: true };
              break;
            default:
              response = { content: `I could not perform that action for you, sorry.`, ephemeral: true };
              break;
          }
        }
      } else {
        switch(parsed.reason) {
          case 'invalid row':
          case 'row out of range':
            response = { content: 'Sorry, the row you entered is invalid.', ephemeral: true };
            break;
          case 'invalid column':
          case 'column out of range':
            response = { content: 'Sorry, the column you entered is invalid', ephemeral: true };
            break;
          default:
            response = { content: 'Sorry, something went wrong.', ephemeral: true };
            break;
        }
      }

      interaction.reply(response);
      if(response.log) game.log(response.log.message, response.log.type);
    }
  }
}