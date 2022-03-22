module.exports = (index, game) => {
  return {
    meta: {
      name: 'join',
      description: 'Join a game before it starts',
      requiresStart: false,
    },
    execute(interaction) {
      interaction.reply(this.command(interaction.channel, interaction.user));
    },
    parseArgs(message, ...args) {
      message.reply(this.command(message.channel, message.author));
    },
    command: (channel, user) => {
      return game.addPlayer(channel, user);
    }
  }
}