module.exports = {
  question: ['who made you'],
  asked: [],
  async answer(message) {
    message.channel.send(`I uh...`);
    await new Promise(r => setTimeout(r, 1000));
    message.channel.startTyping(1);
    await new Promise(r => setTimeout(r, 20000));
    message.channel.stopTyping(1);
    await new Promise(r => setTimeout(r, 10000));
    message.channel.startTyping(1);
    await new Promise(r => setTimeout(r, 29000));
    message.channel.stopTyping(1);
    await new Promise(r => setTimeout(r, 5000));
    message.channel.send(`Let's talk about something else...`);
  }
};