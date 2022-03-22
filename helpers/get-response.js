const getResponse = async (channel, wording) => {
  const options = { max: 1, time: 10000, errors: ['time'] };
  if(oneShot) options.maxProcessed = 1;
  return new Promise((resolve, reject) => {
    channel.send(wording).then(message => {
      message.channel.awaitMessages(m => {
        return true;
      },
      options)
      .then(collected => {
        if(!collected.first()) resolve(false);
        let c = collected.first().content;
        if(c.charAt(0) === '~') {
          c = c.substring(2);
        }
        c.trim().toLowerCase();
        console.log(c);
        resolve(c);
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}

module.exports.call = getResponse;
module.exports.name = 'getResponse';