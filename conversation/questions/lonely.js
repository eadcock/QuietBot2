module.exports = {
  question: ['are you lonely'],
  asked: [],
  answer: message => {
    message.channel.send(`Not while the game is active.`);
  }
};