const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { CommandInteraction, Message } = require("discord.js");

let game;
module.exports = (index, game) => {
  this.game = game;
  return {
    meta: {
      name: 'info',
      description: 'Get info about an election',
      type: ApplicationCommandOptionType.Subcommand,
      requiresStart: false,
      options: [
        {
          name: 'election_id',
          description: 'The UUID of an election. Defaults to the current election.',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: 'list_elections',
          description: 'Enter true to get a list of all current and past elections.',
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        }
      ]
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      this.command(interaction, { id: interaction.options.getString('election id'), list: !!interaction.options.getBoolean('list elections') });
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     */
    parseArgs(message, ...args) {
      this.command(message, 
        { 
          id: args.length ? args[0] : null,
          list: args.length && args[0] === 'true'
        });
    },
    /**
     * 
     * @param {Message} interaction 
     * @param {{
     *   id: ?string,
     *   list: boolean
     * }} options 
     * @returns 
     */
    command(interaction, options) {
      const ephemeral = interaction.channel === 'DM';
      const player = game.resolvePlayer(interaction.user);

      if(options.list) {
        if(!game.election.current && game.election.manager.pastElections.length === 0) {
          // Display the election that resulted in the ascendance 
          interaction.reply({ content: `Here's the list of every current and past election:\n\t83cd504c-adf5-444c-8d9b-b7038b872a1c`, ephemeral });
          return;
        }

        const electionList = [];
        if(game.election.current) {
          electionList.push(game.election.current.id);
        }
        electionList.push(game.election.manager.pastElections.map(e => e.id));
        
        electionList = electionList.reverse().map((e, index) => `\tElection #${index + 1}: ${e}`);
        
        interaction.reply({content: `Here's the list of every current and past election:\n${electionList.join('\n')}`, ephemeral});

        return;
      }

      if(!options.id && !game.election.current) {
        interaction.reply({ content: `Sorry, there is not currently an ongoing election. Check back later.`});
        return;
      }

      let election = game.election.current;

      if(!!options.id) {
        if(options.id === '83cd504c-adf5-444c-8d9b-b7038b872a1c') {

        }
        election = game.election.manager.getElection(options.id);
      }

      if(!election) {
        interaction.reply({ content: `There is no ongoing election or that is an invalid id.`, ephemeral });
        return;
      }

      let bills = game.election.manager.getBillEmbedsFor(election);

      bills = _.chunk(bills, 10);

      interaction.reply('Here are the bills for Election ' + election.id);
      bills.forEach(interaction.reply({ embeds: bills, ephemeral }));
    }
  }
}