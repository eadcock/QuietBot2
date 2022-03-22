const { CommandInteraction, Client } = require('discord.js')

module.exports = {
  name: 'interactionCreate',
  /**
   * 
   * @param {CommandInteraction} interaction 
   * @param {Client} client 
   * @returns 
   */
  async execute(interaction, client) {
    console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction`);
    if(!interaction.isCommand()) return;

    if(!client.commands.has(`${interaction.commandName}`)) return;
    try {
      client.commands.get(interaction.commandName).execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
}