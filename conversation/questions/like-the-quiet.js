module.exports = {
  question: ['do you like the quiet', 'do you like the silence', 'do you like silence', 'do you want silence', 'how is the quiet', 'how is the silence'],
  asked: new Map(),
  async answer(message) {
    if(!this.asked.has(message.author.id)) {
      this.asked.set(message.author.id, {
        author: message.author,
        answered: false,
      });
    }

    const info = this.asked.get(message.author.id);
    const player = game.resolvePlayer(message.author);
    if(player?.divineRoll() || this.globalAnswered) {
      this.globalAnswered = true;
      message.channel.send('No');
      message.channel.send(`Well, I did, for a while, but then it became too much. But now it\'s gone!${game.hasSpecialAmmo ? ' I just fear it might be getting too loud... Anyway, ' : ''} Thanks for being here.`);
    } else {
      message.channel.send('I... did.');
      message.channel.startTyping();
      await new Promise(r => setTimeout(r, 5000));
      message.channel.stopTyping();
    }
  }
}