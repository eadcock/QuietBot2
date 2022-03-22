module.exports.parseTag = (string) => {
  while(!Number.parseInt(string[0])) {
    string = string.slice(0, 1);
  }

  if(string.endsWith('>')) {
    string = string.slice(-1, 1);
  }
  return string;
}

module.exports.name = 'parseTag'