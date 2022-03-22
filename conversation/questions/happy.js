module.exports = {
  question: ['are you happy'],
  asked: [],
  answer: message => {
    message.channel.send(`Oh, uh, I guess?`);
  } 
};