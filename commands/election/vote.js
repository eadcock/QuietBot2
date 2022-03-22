const { CommandInteraction, Message } = require("discord.js");
const { getOption, confirm } = require('../../helpers');


let game;
module.exports = (index, game) => {
  this.game = game;
  return {
    meta: {
      name: 'vote',
      description: 'Submit a valid Voting Slip to vote in an Election',
      type: 1,
      requiresStart: false,
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      this.command(interaction);
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     */
    parseArgs(message, ...args) {
      this.command(message);
    },
    /**
     * 
     * @param {CommandInteraction|Message} interaction 
     * @param {*} options 
     * @returns 
     */
    command(interaction, options) {
      const ephemeral = interaction.channel === 'DM';
      const player = game.resolvePlayer(interaction.user);

      if(!player.votingSlips.length) {
        interaction.reply({ content: `I'm sorry, but you need a Voting Slip to vote in an Election.`, ephemeral });
        return;
      }

      let bills = game.election.current.getBills();

      if(!bills.success) {
        console.log('Voted without an election');
        interaction.reply({ content: `Sorry, there currently doesn't seem to be any Bills to vote on!`, ephemeral });
        return;
      }

      getOption.call(interaction.channel, `Which bill would you like to vote for?`, {
        placeholder: 'Bill',
        ephemeral,
        choices: bills.map(bill => {
          return {
            value: bill.id,
            label: bill.name,
          }
        })
      }).then(option => {
        if(options.length > 1) {
          interaction.reply({ content: `Wowowow, slow down there. I can't process more than one vote at a time. How did you even select multiple bills?`, ephemeral });
          return;
        } else if (option.length === 0) {
          interaction.reply({ content: 'Now how am I suppose to submit a vote if you don\'t select a bill?', ephemeral });
          return;
        }

        option = option[0];

        confirm.call(interaction.channel, `Would you like your vote to be anonymous?`).then(result => {
          const slip = player.votingSlips.shift();
          slip.value = option;
          game.vote(slip);

          if(result) {
            interaction.reply({ content: `Your vote has been successfully submitted and the announcement will be anonymous. Thank you for your participation.`, ephemeral });
            game.announce(`A player has submitted a voting slip.`);
            game.log(`${game.elections.current.totalVotes} Votes have been counted.`, 'election');
          } else {
            interaction.reply({ content: `Your vote has been successfully submitted and the announcement will mention you. Thank you for your participation.`, ephemeral });
            if(player.alive) {
              game.announce(`${player} has submitted a voting slip.`);
            } else {
              game.announce(`A player has submitted a voting slip.`);
            }
            game.log(`${game.elections.current.totalVotes} Votes have been counted.`, 'election');
          }
        })
      });
    }
  }
}