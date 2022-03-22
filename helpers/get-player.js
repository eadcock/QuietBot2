const { MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports.call = (channel, message, players, ephemeral, alive) => {
  const select = new MessageSelectMenu()
    .setCustomId('player select')
    .setPlaceholder('Player')
    .setMinValues(1)
    .setMaxValues(players.length);
  players.forEach(p => {
    if(alive === undefined || p.alive === alive) {
      const options = {
        value: p,
        label: p.toString(),
      };
      if(p.anon) {
        options.emoji = p.emoji;
      } 
      select.addOptions(options);
    }
  });

  const row = new MessageActionRow().addComponents(select);

  return new Promise((resolve, reject) => {
    channel.send({ content: message, components: [row], ephemeral: ephemeral }).then(m => {
      const options = { max: 1, time: 10000, errors: ['time'] };
      m.awaitMessageComponent(options)
        .then(interaction => {
          resolve(interaction.options.values);
        }).catch(err => {
          reject();
        });
    })
  });
}

module.exports.name = 'getPlayer';