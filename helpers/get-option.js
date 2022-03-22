const { MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports.call = (channel, question, options) => {
  const select = new MessageSelectMenu()
    .setCustomId('options select')
    .setPlaceholder(options.placeholder ?? 'Option')
    .setMinValues(options.min ?? 1)
    .setMaxValues(options.max ?? 1);

  select.addOptions(options.choices);

  const row = new MessageActionRow().addComponents(select);

  return new Promise((resolve, reject) => {
    channel.send({ content: question, components: [row], ephemeral: options.ephemeral }).then(m => {
      const choices = { time: 10000, errors: ['time'] };
      m.awaitMessageComponent(choices)
        .then(interaction => {
          resolve(interaction.options.values);
        }).catch(err => {
          reject();
        });
    })
  });
}

module.exports.name = 'getOption';