const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { MessageSelectMenu, MessageActionRow, CommandInteraction, Message, TextBasedChannels, SelectMenuInteraction } = require('discord.js');
const _ = require('underscore');
const Player = require ('../../tanktactics/player.js');
const { Game } = require('../../tanktactics/game.js');
const { messageSender, refreshCommands } = require('../../helpers');
const { refresh } = require('../../helpers/refresh-commands.js');
/** @type {Game} */
let game;

/**
 * @param {TextBasedChannels} channel
 * @param {Player} player
 */
function scheduleAmmoElection(channel, player) {
  game.log('The gears begin turning.', 'mechanism');
  game.scheduler.scheduleTask('check for ammo', 'in 3 minutes 21 seconds', async (/** @type {any} */ _) => {
    game.log('The gears spin faster.', 'mechanism');
    channel.send('You win.');
    await new Promise(r => setTimeout(r, 600));
    channel.send('I hope you know what you are getting yourself into. See you tomorrow.');
    game.log('For but a moment, steam hisses as pistons pulse.', 'mechanism');

    game.scheduleElection(`Thanks to ${player}, I've got some... exciting news for you all. We are having an election. Take a voting slip. Think about this carefully.`,
      true,
      () => {
        this.log('Loud metal clanks.', 'mechanism');
      },
      (/** @type {any} */ results) => {
        this.primaryChannel.send(`The election is over. The votes have been tallied. I didn't tell you, but the archives dictate this election works a little different. Every bill passes. Don't shoot your eye out.`);
        this.unlockables.specialAmmo = true;
        refreshCommands.refresh(this.index.client);
        if(this.logging.channel) {
          for(let [key, value] of this.election.current.currentBills) {
            value.voters.forEach((/** @type {{ hasExplosive: boolean; hasPiercing: boolean; hasBouncing: boolean; }} */ p) => {
              switch(key) {
                case 'explosive':
                  p.hasExplosive = true;
                  this.log(`${p} has received access to Explosive Rounds.`, 'election');
                  break;
                case 'piercing':
                  p.hasPiercing = true;
                  this.log(`${p} has received access to Piercing Rounds.`, 'election');
                  break;
                case 'bouncing':
                  p.hasBouncing = true;
                  this.log(`${p} has received access to Bouncing Rounds.`, 'election');
                  break;
              }
            })
          }
        } else {
          for(let [key, value] of game.election.current.currentBills) {
            value.voters.forEach((/** @type {{ hasExplosive: boolean; author: any; hasPiercing: boolean; hasBouncing: boolean; }} */ p) => {
              switch(key) {
                case 'explosive':
                  p.hasExplosive = true;
                  messageSender.sendDM(p.author, `You have received access to Explosive Rounds.`);
                  break;
                case 'piercing':
                  p.hasPiercing = true;
                  messageSender.sendDM(p.author, `You have received access to Piercing Rounds.`)
                  break;
                case 'bouncing':
                  p.hasBouncing = true;
                  messageSender.sendDM(p.author, `You have received access to Bouncing Rounds.`)
                  break;
              }
            })
          }
        }
      },
      {
        id: 'explosive',
        name: 'Explosive Round',
        description: 'Allow access to exploding rounds. Load this into your tank, and the next time you shoot will be *real* exciting.',
        color: '#BE5B2D',
      },
      {
        id: 'piercing',
        name: 'Piercing Round',
        description: 'Allow access to piercing rounds. Load this into your tank, and the next time you shoot, nothing will stand in your way. Well, they can try, I suppose.',
        color: '#AFAFAF',
      },
      {
        id: 'bouncing',
        name: 'Bounding Round',
        description: 'Allow access to bouncing rounds. Load this into your tank, and your opponents better hope they aren\'t standing too close together.',
        color: '#7AC6E4'
      })
  })
}

const command = {
  meta: {
    name: 'load',
    description: 'Load your tank with a special type of ammo.',
    type: ApplicationCommandOptionType.Subcommand,
    requiresAlive: true,
    requiresStart: true,
    cost: 1,
    used: [],
    deadlock: false,
    unlocked: null,
  },
  /**
   * @param {CommandInteraction} interaction
   */
  execute(interaction) {
    this.command(interaction);
  },
  /**
   * @param {Message} message
   * @param {...string} args
   */
  parseArgs(message, ...args) {
    this.command(message);
  },
  /**
   * @param { CommandInteraction | Message } interaction
   */
  async command(interaction) {
    const user = interaction instanceof Message ? interaction.author : interaction.user;

    const player = game.resolvePlayer(user);
    if(this.meta.deadlock) interaction.reply({ content: `Haha. Funny. Go talk to ${this.meta.unlocked}. They beat you to it. See you tomorrow.`, ephemeral: true });
    if(!game.unlockables.specialAmmo) {
      if(this.meta.used.includes(user.id)) {
        interaction.channel.send({ content: 'I thought I told you not to use this command again.', ephemeral: true });
        if(player.divineRoll(game.dayStart.currentDay)) {
          this.deadlock = true;
          this.unlocked = player;
          this.used = {};
          scheduleAmmoElection(interaction.channel, player);
        } else {
          game.log('The gears shift. Metal grinds. Everything remains still.', 'mechanism');
        }
      } else {
        this.used.push(user.id);
        interaction.channel.send({ content: 'H-', ephemeral: true });
        interaction.channel.send({ content: 'How did you know about this command?', ephemeral: true });
        if(player.divineRoll(this.used.length)) {
          this.deadlock = true;
          this.unlocked = player;
          await new Promise(r => setTimeout(r, 800));
          interaction.reply({ content: `I'm really not happy you asked me to do this. But I have a job. So.`, ephemeral: true });
          scheduleAmmoElection(interaction.channel, player);
        } else {
          interaction.channel.sendTyping();
          await new Promise(r => setTimeout(r, 1200));
          interaction.reply({ content: 'Hey, listen, I like you, ok? I like all of you! So, don\'t do that again. Forget I said anything. I\'m sorry.', ephemeral: true });
        }
      }
    } else {
      const select = new MessageSelectMenu()
        .setCustomId('ammo type')
        .setPlaceholder('Round type')
        .setMinValues(1)
        .setMaxValues(1);
      if(player.unlockedAmmo.expolosive) {
        select.addOptions({
          label: 'Explosive Round',
          value: 'explosive',
          description: 'Creates an aoe explosion at target tile',
        });
      }
      if(player.unlockedAmmo.piercing) {
        select.addOptions({
          label: 'Piercing Round',
          value: 'piercing',
          description: 'Travels farther than your range. Pierces through the first target, dealing reduced damage to a second object',
        });
      }
      if(player.unlockedAmmo.bouncing) {
        select.addOptions({
          label: 'Bouncing Round',
          value: 'bouncing',
          description: 'Bounces off of anything it hits, dealing reduced damage with each bounce',
        });
      }
      const row = new MessageActionRow().addComponents(select);
      interaction.reply({ content: 'So, which round would you like to load?', ephemeral: true, components: [row] });
      interaction.channel.awaitMessageComponent({ max: 1, componentType: 'SELECT_MENU'}).then((result) => {
        player.tank.currentRounds = result.values[0];
        interaction.channel.send({ content: 'You got it!', ephemeral: true });
      });
    }
  }
}

/**
 * 
 * @param {*} index 
 * @param {Game} game 
 * @returns 
 */
module.exports = (index, game) => {
  this.game = game;
  if(!game.unlockables.specialAmmo) return _.omit(command, 'meta');
  return command;
}