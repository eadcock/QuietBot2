const _ = require('underscore');

const extractMeta = (object) => {
  _.pairs(object.meta).forEach(p => {
    object[p[0]] = p[1];
  });
  return object;
}

module.exports.call = (command) => {
  if (command.commands === undefined) {
    if(_.has(command, 'meta')) {
      extractMeta(command);
      return command;
    } 
    return null;
  } else {
    const sub = [];

    command.commands.forEach(s => {
      if(s) {
        if(_.has(s, 'meta')) {
          sub.push(extractMeta(s));
        }
      }
    });
    extractMeta(command);
    command.options = sub;
    return command;
  }
}

module.exports.name = 'transformCommand';