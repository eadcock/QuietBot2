module.exports = {
  question: ['who is loud', 'who\'s loud', 'whos loud'],
  answer(message) {
    const player = game.resolvePlayer(message.author);
    if(player.divinityLevel === 'entry') {
      message.channel.send('The Divinity has requested all information about Loud be classified.');
    } else {
      message.channel.send(`Don't you meant *what* is loud?`);
    }
  }
}