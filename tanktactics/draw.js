const tileRegistry = {};
const nullTile = ['⬛', '🟥'];
const drawAPI = {
  lastNull: 0x1,
  registerTile: (id, emoji) => {
    if (Object.keys(tileRegistry).includes(id)) console.log('Warning! Overriding tile at ' + id + '!!');
    tileRegistry[id] = { id, emoji, letter: id.charAt(0) };
  },
  resolveTile: (id) => {
    this.lastNull = ~this.lastNull & 0x1;
    return tileRegistry[id]?.emoji ?? nullTile[this.lastNull];
  },
  letterResolve: (id) => {
    return tileRegistry[id]?.letter ?? '-';
  },
  lookupEmoji: (emoji) => {
    return Object.keys(tileRegistry).find((id) => {
      tileRegistry[id].emoji === emoji;
    });
  },
}

drawAPI.registerTile('pickup', '❔');
drawAPI.registerTile('barrier', '⬜');
drawAPI.registerTile('reinforced barrier', '🔳')

module.exports = drawAPI;