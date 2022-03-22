const { ApplicationCommandOptionType } = require("discord-api-types/v9");

module.exports = (index, game) => {
  return {
    meta: {
      name: 'cping',
      description: 'Make sure I\'m alive',
      type: ApplicationCommandOptionType.Subcommand,
      requiresStart: false,
    },
    execute: (interaction) => interaction.reply('Pong!')
  }
}