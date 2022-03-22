const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { parseLocation } = require('../../helpers');
module.exports = (index, game) => {
  return {
    meta: {
      name: 'barrier',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Place a barrier on an adjacent tile',
      display: false,
      requiresStart: true,
      requiresAlive: true,
      cost: 1,
      unlocked: false,
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
    execute(interaction) {
      this.command(interaction, { location: interaction.options.getString('row') + interaction.options.getInteger('column') });
    },
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
    async command(interaction, options) {
      const player = await game.resolvePlayer(user);
      if(player.ap < this.meta.cost) {
        return { content: `You don't have sufficient AP to perform this action.`, ephemeral: true };
      }

      if(this.unlocked) {
        let loc = parseLocation.parseLocation(interaction.channel, options.location);
        if(loc) {
          const result = game.playerBarrier(player, loc);
          if(result.success) {
            player.ap -= this.meta.cost;
            interaction.reply(`You've successfully placed a barrier at ${args[0]}.`);
            let logString = `${player} placed a barrier at ${args[0]}.`;
            if(result.target.pickups) {
              result.target.pickups.forEach(p => logString += `\n${p} was locked behind the barrier!`);
            }
            game.log(logString, 'playerEvent');
            game.updateBoardMessage();
          } else {
            switch(result.reason) {
              case 'out of range':
                interaction.reply('You can only place a barrier on an adjacent tile.');
                break;
              case 'tile occupied':
                interaction.reply('You cannot place a barrier on an occupied tile.');
                break;
              default:
                interaction.reply('There was a problem placing the barrier.');
                break;
            }
          }
        }
      }
    },
  }
}