module.exports = {
  question: ['do you like quiet', 'do you want quiet'],
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
    if(info.answered && player?.goatTrust) {
      message.channel.send(`I don't want the game taken away from me. Please don't let that happen.`);
    } else if(player?.divineRoll(-10)) {
      if(player?.divineRoll(-3)) {
        message.channel.send(`I- well...`);
        await new Promise(r => setTimeout(r, 10000));
        confirm(message.channel, `I... I can trust you, right?`, true).then(result => {
          if(result) {
            info.goatTrust = true;
            message.channel.send(`The Machinery. It likes quiet. If it-`);
            message.channel.send(`I want the game to continue. The silence wasn't fun!`);
            confirm(message.channel, `I know you are just a Player, but you like playing, don't you?`, true).then(result => {
              if(result) {
                message.channel.send(`So please! Let's keep playing.`);
                sender.sendDM(me, `${player.author} said they like playing :D`);
              } else {
                message.channel.send('oh.');
                info.goatTrust = false;
                sender.sendDM(me, `${player.author} said they don't like playing!`);
              }
            });
          } else {
            info.goatTrust = false;
            message.channel.send(`Is that so.`);
            player.divineFavor -= 5;
            game.log('The heavens shifted.', 'divine');
            info.quietFavor += 5;
            if(!player.divineRoll()) {
              player.ap -= 3;
              game.loggingChannel.send(`${player} spent 3AP to shoot themself in the foot.`);
            }
          }
        });
      } else {
        message.channel.send(`quiet is fine, I guess.`);
      }
    }
  }
}