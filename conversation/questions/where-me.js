module.exports = {
  question: ['where are we', `where're we`, 'wherere we',
             'where am i'],
  asked: new Map(),
  answer(message) {
    if(!this.asked.has(message.author.id)) {
      this.asked.set(message.author.id, {
        author: message.author,
        answered: false,
      });
    }
    const info = this.asked.get(message.author.id);
    const player = game.resolvePlayer(message.author);
    if(!info.answered) {
      if(player?.divineRoll()) {
        message.channel.send(`The Play Box, of course!`);
        info.answered = true;
      } else {
        message.channel.send(`That's a pretty strange question to ask me, don't you think?`);
      }
    } else {
      message.channel.send(`The Play Box, did you forget?`);
    }
  }
}