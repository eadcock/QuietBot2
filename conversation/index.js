const fs = require('fs');
module.exports = () => {
  const questions = [];
  for (const file of fs.readdirSync('./conversation/questions')) {
    questions.push(require(`./questions/${file}`));
  }

  return questions;
}