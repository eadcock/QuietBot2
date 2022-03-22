const _ = require('underscore');
_.mixin({
  sanitize: (string) => string.trim().toLowerCase()
})

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if(message.channel.type !== 'DM' || message.author.bot) return;

    let args, commandName;
    args = message.content.split(/ +/);
    commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if(!command) {
      const q = _.find(client.questions, q => _(q.question).contains(_(message.content).sanitize()));
      if(q) {
        q.answer(message);
      } else {
        console.log('Not a question');
      }

      return;
    }

    if(command.args && !args.length) {
      let reply = `You didn't provide any arguments.`;
      if(command.usage) {
        reply += `\n${commandName} ${command.usage}`;
      }

      return message.reply(reply);
    }
    
    try {
      (command.parseArgs(message, ...args));
    } catch (error) {
      console.error(error);
      message.channel.send('Go yell at quiet, something went wrong.');
    }
  }
}