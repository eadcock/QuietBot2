module.exports = {
  question: ['what is the divinity', 'what\'s the divinity'],
  scolded: false,
  answer(message) {
    const player = game.resolvePlayer(message.author);
    if(player?.divinityLevel === 'entry') {
      message.channel.send('The Divinity is the collection of people that oversee the smooth operation of The Machinery');
    } else {
      const divine = game.players.find(p => p.divinityLevel !== 'restricted');
      if(divine && !this.scolded) {
        this.scolded = true;
        message.channel.send('I have no idea what you are talking about, where did you hear about that?');
        sender.sendDM(divine.author, `Why did you tell ${message.author} about The Divinity. I thought I told you it is highly discouraged. The affairs of The Divinity should not overlap with the affairs of Clanks.`);
      } else if (this.scolded) {
        message.channel.send(`I would appreciate it if you didn't ask me useless questions. I'm quite busy.`);
      }
    }
  }
}