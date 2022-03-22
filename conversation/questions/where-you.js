module.exports = {
  question: ['where are you', `where're you`, `wherere you`],
  asked: new Map(),
  inside: false,
  globalAnswered: false,
  answer(message) {
    if(!this.asked.has(message.author.id)) {
      this.asked.set(message.author.id, {
        author: message.author,
        answered: false,
      })
    }

    const info = this.asked.get(message.author.id);
    const player = game.resolvePlayer(message.author);
    if(!info.answered) {
      if(player?.divineRoll()) {
        if(this.globalAnswered && !this.inside) {
          message.channel.send(`Below the Play Box.`);
        } else {
          message.channel.send(`In the Machinery.`);
        }
        info.answered = true;
      } else {
        message.channel.send(`With you, silly!`);
      }
    } else {
      confirm(message.channel, `Well, more like a part of? Can you be in something you are? Would you say your brain is in you?`, true).then(result => {
        if(result) {
          message.channel.send(`Then yeah! Inside!`);
        } else {
          message.channel.send(`Yeah, that makes sense, I think. I'm not the Machinery, but it's kinda of me.`);
        }
      });
    }
  }
}