module.exports = {
  question: ['do you want to leave', 'do you wish to leave'],
  asked: new Map(),
  async answer(message) {
    if(!this.asked.has(message.author.id)) {
      this.asked.set(message.author.id, {
        author: message.author,
        answered: false,
      })
    }
    const info = this.asked.get(message.author.id);
    if(!info.answered) {
      const player = game.resolvePlayer(info.author);
      message.channel.send(`Where would I go?`);
      if(player?.divineRoll()) {
        await new Promise(r => setTimeout(r, 2000));
        message.channel.send('Maybe. After the game. When the machinery stops.');
        info.answered = true;
      } 
    } else {
      message.channel.send('It gets awfully quiet...');
    }
  }
}