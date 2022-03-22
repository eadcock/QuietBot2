const { me, ono, mongo } = require('../../config.json');
const fs = require('fs');
const Sequelize = require('sequelize');
const { Collection, Application } = require('discord.js');
const { Console } = require('console');

const databaseManager = require('../../tanktactics/database/index.js');

let game;
const commands = new Collection();
const overhead = [];

module.exports = (index) => {
  // const g = await db.get('savedGame');
  // if(g) {
  //   game = require('../../tanktactics/game.js')(index, g);
  // } else {
  //   game = require('../../tanktactics/game.js')(index);
  // }
  game = require('../../tanktactics/game.js')(index, 'default');
  const options = new Collection();

  const dir = fs.readdirSync('./commands/clanks', { withFileTypes: true }).filter(f => (f.name.endsWith('.js') || f.isDirectory()) && f !== 'index.js').map(f => f.name);
  for(const file of dir) {
    if(file === 'index.js' || file === 'locked') continue;
    const c = require(`./${file}`)(index, game);
    if(c) {
      console.log(c);
      if(c.commands === undefined) {
        commands.set(c.meta.name, c);
        overhead.push({
          name: c.meta.name,
          description: c.meta.description,
          type: c.meta.type,
          require: !!c.meta.require,
          options: c.meta.options,
        });
      } else {
        const subOptions = [];
        for(const s of c.commands) {
          console.log(s);
          if(s) {
            commands.set(s.meta.name, s);
            subOptions.push({
              name: s.meta.name,
              description: s.meta.description,
              type: s.meta.type,
              required: !!s.meta.required,
              options: s.meta.options,
            });
          }
        }
        overhead.push({
          name: c.meta.name,
          description: c.meta.description,
          type: c.meta.type,
          options: subOptions,
        });
      }
    }
  }


  return {
    name: 'clanks',
    description: 'The landing point for all Clanks related commands.',
    options: overhead,
    execute(interaction) {
      if(interaction.options.getSubcommandGroup(false) === 'admin' && interaction.user.id !== me) {
        interaction.reply({ content: `You need admin privilages to use that command.`, ephemeral: true });
        return;
      }
      
      commands.get(interaction.options.getSubcommand(true))?.execute(interaction);
    }
  }
}