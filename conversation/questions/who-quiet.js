module.exports = {
  question: ['who is quiet', 'who\'s quiet', 'whos quiet'],
  answer(message) {
    const player = game.resolvePlayer(message.author);
    if(player.divinityLevel === 'entry') {
      message.channel.send('A member of The Divinity.');
    } else {
      message.channel.send(`Don't you mean *what* is quiet?`);
    }
  }
}