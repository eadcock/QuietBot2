module.exports = {
  question: ['what is your favorite color', `what's your favorite color`, 'whats your favorite color',
             'what is your favourite color', `what's your favourite color`, 'whats your favourite color',
             'what is your favorite colour', `what's your favorite colour`, 'whats your favorite colour',
             'what is your favourite colour', `what's your favourite colour`, 'whats your favourite colour'],
  asked: [],
  answer(message) {
    if(!this.asked.find(a => message.user.id)) {
      this.asked.push(message.user.id);
      game.resolvePlayer(message.user).goatFavor += 1;
    }
    
    if(roles[message.author.id]) {
      message.channel.send(`Oh, um... probably... ${message.client.guilds.resolve(ono).roles.resolve(role[message.author.id]).color}! I hope that's not too specific...`);
    } else {
      message.channel.send(`Oh, um... probably... gray! Gray is pretty nice.`);
    }
  }
}