const { MessageButton, MessageActionRow } = require("discord.js");

const confirm = async (channel, wording, oneShot) => {
  const options = { max: 1, time: 10000, errors: ['time'] };
  if(oneShot) options.maxProcessed = 1;
  return new Promise((resolve, reject) => {
    const responseRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel('Yes')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel('No')
        .setStyle('DANGER')
    );
    channel.send({ content: wording, ephemeral: channel.type === 'dm', components: [responseRow] }).then(message => {
      message.channel.awaitMessageComponent(options)
        .then(interaction => {
          resolve(interaction.customId === 'yes');
        }).catch(err => {
          reject(err);
        });
    }).catch(err => {
      reject(err);
    });
  });
}

module.exports.call = confirm;
module.exports.name = 'confirm';