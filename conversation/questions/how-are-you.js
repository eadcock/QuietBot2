module.exports = {
  question: ['how are you', 'howre you', `how're you`],
  asked: [],
  answer(message, game) {
    if(!this.asked.find(a => message.user.id)) {
      this.asked.push(message.user.id);
      game.resolvePlayer(message.user).goatFavor += 1;
    }
    message.channel.send(`Oh! Incredible! I love running this game, thanks for asking!`);
  }
}