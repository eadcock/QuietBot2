const { Board } = require('./board.js');
const { CronJob, CronTime } = require('cron');
const _ = require('underscore');
const parser = require('cron-parser');
const Player = require('./player.js');
const Tank = require('./tank.js');
const Draw = require('./draw.js');
const Barrier = require('./barrier.js');
const setupElection = require('./election-wrapper.js')(this);
const { Channel, TextChannel, User, GuildMember, MessageResolvable, Message, Client } = require('discord.js');

const saveManager = require('./save-manager.js');

let kickoffJob;
let index;
const { scheduler, getResponse, confirm, parseLocation, getPlayer, messageSender } = require('../helpers');
const Election = require('./election.js');

/**
 * 2D Coordinates
 * @typedef {{x: number, y: number}} Point
 */

/**
 * @typedef {{ 
 * id: string,
 * name: string,
 * description: string,
 * color: string
 * }} Bill
 */

/**
 * @typedef {import('./tank.js').DamageInfo} DamageInfo
 */

/**
 * @typedef {Object} pickup
 * @property {string} id Unique id of the pickup
 * @property {(target: Tank) => boolean} fund Describes how the pickup is funded to the target
 * @property {() => void} toString
 * @property {Player} [placedBy] The tank that placed the pickup
 * @property {number} [range] The range of the pickup's active effect
 * @property {number} [damage] The damage modifier for the pickups active effect
 */

/**
 * Class representing the Game State
 */
class Game {

  /**
   * Track administrative information about the game state
   * 
   * @type {{
   * state: string,
   * channel: Channel,
   * kickoffTime: CronTime,
   * gameId: string,
   * saveJob: CronJob,
   * index: Client
   * }}
   */
  admin = {
    state: 'sleep',
    setPrimaryChannel(v) {
      index.client.channels.fetch(v.id).then(c => { this.channel = c.id; } );
    },
    getPrimaryChannel() {
      console.log(this.channel);
      return index.client.channels.fetch(this.channel);
    },
    channel: null,
    kickoffTime: null,
    gameId: 'default',
    saveJob: null,
    index: null,
  }

  /**
   * @type {{scheduleTask: import('../helpers/job-scheduler.js').scheduleTask, name: string}}
   */
  scheduler;
  
  /**
   * Track unlockable components
   * @type {{
   * upgradeDamage: boolean,
   * placeBarrier: boolean,
   * reinforceBarrier: boolean,
   * specialAmmo: boolean,
   * pray: boolean,
   * }}
   */
  unlockables = {
    upgradeDamage: false,
    placeBarrier: false,
    reinforceBarrier: false,
    specialAmmo: false,
    pray: false,
  }

  /**
   * Kick off the currently scheduled game.
   */
  forceKickoff() {
    kickoffJob.stop();
    this.kickOff();
  }

  /**
   * Find the Player representation of a discord user
   * @param { User | GuildMember } user 
   * @returns { Player? }
   */
  async resolvePlayer(user) {
    return this.players.find(p => p.author.id === user.id);
  }

  /**
   * 
   * @param {Channel} channel The channel to set as the primary channel
   * @param {User|GuildMember} user The user that used this command
   * @param {Channel} logChannel The channel to set as the logging channel, enables logging 
   * @param {Channel} boardChannel The channel to set as the board channel
   * @returns {MessageResolvable}
   */
  newGame(channel, user, logChannel, boardChannel) {
    this.logging.channel = logChannel;
    this.board.setChannel(boardChannel);
    if(this.admin.state === 'sleep') {
      this.admin.state = 'setup';
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      //this.startDate = `00 ${now.getMinutes()} ${now.getHours()} * * *`;
      this.dayStart.startDate = `00 00 10 * * *`;
      console.log('Set to kick off at ' + this.dayStart.startDate, 'management');
      this.dayStart.currentDay = 0;
      kickoffJob = new CronJob(this.dayStart.startDate, () => { this.kickOff() }, () => console.log('Kickoff completed'), false, 'America/New_York');
      kickoffJob.start();
      this.admin.kickoffTime = parser.parseExpression(this.dayStart.startDate).next().toString();

      this.admin.channel = channel.id;
      index.ttBypass = channel;

      this.admin.saveJob = new CronJob('00 00 * * * *', this.saveGame, () => { console.log('Save completed') }, true, 'America/New_York');

      return { content: 'A new game of Clanks is starting! Type `/join` to join the game! The game is currently set to kick off at ' + this.admin.kickoffTime, ephemeral: false };
    } else if(this.state === 'setup') {
      return { content: `There is already a game that will kick off at ${this.admin.kickoffTime}! It hasn'nt started yet, and you can still join with \`/join\`, or click this shiny button.`, ephemeral: true };
    } else {
      return { content: `Unfortunately there the game is already running. Sit back and enjoy the show... unless ||                                              ||`, ephemeral: true };
    }
  }

  /** Save the current game to the db */
  async saveGame() {
    console.log('Saving game...');
    if(!this._id) {
      saveManager.game.read().then(g => {
        if(g[0]) {
          console.log('overwriting saved game')
          this._id = g[0]._id;
          saveManager.game.update(saveManager.formatSave(this));
        } else {
          console.log('creating new save')
          saveManager.game.create(saveManager.formatSave(this)).then(g => {
            this._id = g._id;
          });
        }
      });
    } else {
      console.log(`Saving game under profile '${this._id}'`);
      const savedState = await saveManager.game.read(this._id);
      if(savedState) {
        saveManager.game.update(saveManager.formatSave(this));
      } else {
        saveManager.game.create(saveManager.formatSave(this));
      }
    }
  
    this.players.forEach(async p => {
      const savedPlayer = await saveManager.player.read(p.author.id)
      if(savedPlayer) {
        saveManager.player.update(p);
      } else {
        saveManager.player.create(p);
      }
    })
    
  }
  
  /** Load the current game from db */
  async loadGame() {
    const state = await saveManager.game.read();
    if(state[0]) {
      console.log('Reading in game: ' + state[0]);
      updateAPI(state[0]).then(m => {
        console.log(api);
        console.log('Loaded game from db');
        console.log(this.admin);
        resolveAndSend(this.admin.channel, { content: 'A game has been loaded!', ephemeral: false });
        this.updateBoardMessage();
      });
    }

    this.players = await saveManager.player.read() || [];
  }
    
  /**
   * 
   * @param {Channel} channel The channel this command was sent from
   * @param {User|GuildMember} user The user to make a player
   * @returns {MessageResolvable}
   */
  addPlayer(channel, user) {
    if(this.admin.state === 'setup') {
      const p = new Player({ author: user });
      const t = new Tank(p);
      p.tank = t;
      this.players.push(p);
      
      this.announce(`<@${user.id}> has joined the game!`, 'playerEvent');
      messageSender.sendDM(user, `Welcome to Clanks! A game about friendship <3
        \nYou may message me using this DM in order to perform secret actions! (as a protip, you don't need to use the ~ prefix to issue a command when dming me!)\n\n
        The game has not started yet, but will kick of at ${this.kickoffTime}, at which point I will tell you your assigned emoji and give you your first action point! 
        In the meantime, familiarize yourself with my commands and the rules of the game. Type \`Help\` for a description of commands, or type \`Rules\` for the game's rules. 
        You can do this at anytime if you get confused.`);
      return { content: 'Success! Check your dms!', ephemeral: true };
    } else if (this.state === 'sleep') {
      return { content: 'Looks like there aren\'t any games running right now. You can always start with using `/clanks admin start` (but i would talk to quiet about that before hand)', ephemeral: true };
    } 

    return { content: 'Unfortunately there the game is already running. Sit back and enjoy the show... unless ||                             contact quiet.....||', ephemeral: true };
  }

  /**
   * Kick off the current scheduled game
   */
  kickOff() {
    kickoffJob.stop();
    this.announce('The game is Kicking Off! Tanks are being assigned and the board is being set.', 'management')
    this.admin.state = 'ongoing';
    // Create the map
    this.board.data = new Board(18);

    // get colors
    let potential = '🐶🐺🐱🦁🐯🦒🦊🦝🐮🐷🐗🐭🐹🐰🐻🐨🐼🐸🦓🐴🦄🐔🐲🦍🦧🐩🐈🐅🐆🐎🦌🦏🦛🐂🐃🐄🐖🐏🐐🐪🦙🦘🦥🦨🦡🐘🐁🐀🦔🐇🐿🦎🐊🐢🐍🐉🦕🦖🦦🦈🐬🐳🐟🐠🐡🦐🦑🐙🦞🦀🦆🐓🦃🦅🦢🦜🦩🦚🦉🐦🐧🐤🦇🦋🐌🐛🦟🦗🐝🐞🦂'.split('');

    this.players.forEach(p => {
      let ei = Math.floor(Math.random() * potential.length / 2) * 2;
      let e = potential.splice(ei, 2).join('');

      p.init(e);
      this.log('A player has been assigned ' + e, 'management');
      Draw.registerTile(p.author.id, e);
      this.board.data.placeRandomly(p.tank);
    });

    // Distribute 1 AP each day
    this.distributeAP();
    this.admin.apJob = new CronJob('00 00 10 * * *', this.distributeAP, null, false, 'America/New_York');
    this.admin.apJob.start();

    this.updateBoardMessage();
    
    resolveAndSend(this.admin.channel, 'The board is set!');
    index.client.channels.fetch(this.admin.channel).then(c => this.displayBoard(c));
  }

  /** Delay a scheduled kickoff */
  delayKickOff() {
    kickoffJob.setTime(new CronTime(this.startDate.slice(-2) + (now.getUTCDay() + 1).padStart(2, '0')));
  }

  /**
   * @type {{
   * data: Board,
   * channel: Channel,
   * messages: Message[]
   * }}
   */
  board = {
    data: null,
    setChannel(v) {
      index.client.channels.fetch(v.id).then(c => { this.channel = c.id; } );
    },
    getChannel() {
      return index.client.channels.fetch(this.channel);
    },
    channel: null,
    messages: null,
  }

  /** Update the current board messages, or create them if they don't exist */
  updateBoardMessage() {
    if(this.state === 'ongoing') {
      if(this.board.messages) {
        const boardString = this.board.data.toEmoji(Draw.resolveTile);
        this.board.messages[0].edit(boardString[0]).then(msg => {
          this.board.messages[1].edit(boardString[1]).then(_ => {
            this.log('The board has been updated.', 'management');
          })
        });
      } else if(this.board.getChannel()) {
        const boardString = this.board.data.toEmoji(Draw.resolveTile);
        this.board.messages = [];
        this.board.getChannel().send(boardString[0]).then(message => {
          this.board.messages[0] = message;
        }).then(_ => {
          this.boardChannel.send(boardString[1]).then(message => {
            this.board.messages[1] = message;
          }).then(_ => {
            this.log('The board has been updated.', 'management');
          });
        });
      }
    }
  }
  
  /** 
   * Send the current board state to the given channel
   * @param {Channel} Channel The channel to send to
   */
  displayBoard(channel) {
    const boardString = this.board.data.toEmoji(Draw.resolveTile);
    console.log(boardString);
    channel.send(!!boardString[0] ? boardString[0] : '[empty]').then(_ => {
      channel.send(!!boardString[1] ?  boardString[1] : '[empty]');
    });
  }

  /**
   * Track information pertaining to Logging
   * @type {{
   * logGame: boolean,
   * channel: Channel,
   * cachedLog: [],
   * emojiLookup: {
   * management: string,
   * playerEvent: string,
   * attack: string,
   * death: string,
   * deadEvent: string,
   * restricted: string,
   * passwordLocked: string,
   * unlocked: string,
   * election: string,
   * mechanism: string,
   * divine: string
   * }
   * }}
   */
  logging = {
    logGame: false,
    channel: null,
    cachedLog: [],
    emojiLookup: {
      management: '✍',
      playerEvent: '🎮',
      attack: '⚔',
      death: '☠',
      deadEvent: '👻',
      restricted: '🔒',
      passwordLocked: '🔐',
      unlocked: '🔓',
      election: '🗳',
      mechanism: '⚙',
      divine: '🎲'
    } 
  }

  /**
   * 
   * @param {string} message The message to log
   * @param {string} type The event type
   */
    log(message, type) {
    if(this.logging.channel) {
      this.logging.channel.send(`${this.logging.emojiLookup[_.toPath(type)]}: ${message}`).then(m => {
        this.cachedLog.push(`${m.createdAt.toLocaleString('en-US', { hour12: false })} - ${this.logging.emojiLookup[_.toPath(type)]}: ${message}`);
      });
    }
  }

  /**
   * Announce a message to the primary channel and also log the announcement
   * @param {string} message 
   * @param {string} type The type to annotate the log
   */
  announce(message, type) {
    resolveAndSend(this.admin.channel, message);
    this.log(message, type);
  }
    
  /**
   * @type {{
   * apJob: CronJob,
   * apModifier: number,
   * apBonus: number
   * }}
   */
  dailyAP = {
    apJob: null,
    apModifier: 1,
    apBonus: 0,
  }

  /**
   * @type {{
   * startDate: CronTime,
   * currentDay: number,
   * events: Array
   * }}
   */
  dayStart = {
    startDate: null,
    currentday: 0,
    events: [],
  }

  /**
   * Start a new day and trigger all queued events.
   */
  newDayStart() {
    this.dayStart.currentday++;
    for(let i = 0; i < this.dayStart.events.length; i++) {
      this.dayStart.events[i].invoke();
      if(this.dayStart.events[i].once) {
        this.dayStart.events.slice(i, 1);
      }
    }
  }

  /**
   * Distribute the daily ap totals.
   */
  distributeAP() {
    this.players.forEach(p => {
      if(p.alive) {
        let ap = 1;
        if(this.dailyAP.apBonus) ap += this.dailyAP.apBonus;
        if(p.apBonus) ap += p.apBonus;
        let modifier = this.dailyAP.apModifier + p.apModifier;
        if(modifier) ap *= modifier;
        p.ap += ap;
      }
    });
    this.announce('Daily AP has been distributed!');
  }

  /**
   * @type {Player[]}
   */
  players = [];

  /**
   * 
   * @param {Tank} tank 
   * @param {Point} loc 
   * @returns 
   */
  move(tank, loc) {
    if(tank.player.ap === 0) return { success: false, reason: 'insufficient ap' };
    let longest = loc.x > loc.y ? loc.x - tank.loc.x : loc.y - tank.loc.y;
    if (Math.abs(longest) <= tank.range + 1) {
        const result = this.board.data.movePiece(index.client.channels.fetch(this.admin.channel), tank.loc, loc);
        if(result.success) {
          this.updateBoardMessage();
        }
        return result;
    } else {
        return { success: false, reason: 'out of range'}
    }
  }

  /**
   * 
   * @param {Tank} origin 
   * @param {Point} target 
   * @returns 
   */
  shoot(origin, target) {
    const targetString = `${String.fromCharCode(target.x + 66)}${target.y + 1}`;
    let longest = target.x > target.y ? target.x - origin.loc.x : origin.loc.y - origin.loc.y;
    if(Math.abs(longest) > origin.range) {
      return {
        success: false,
        reason: 'out of range',
      }
    }
    /**@type  */
    target = this.board.data.grid[target.x][target.y];
    const result = {
      success: true,
      origin,
      target,
      message: `shot at ${targetString} using ${origin.roundToFlavor()}! `,
      killed: []
    }
    switch(origin.currentRounds) {
      case 'regular':
        if(target.occupiedBy) {
          if(target.occupiedBy.damagable) {
            /**@typedef {import('./tank.js').DamageInfo} DamageInfo */

            /** @type {DamageInfo} */
            const info = {
              amount: origin.damage,
              attack: 'a regular round',
              verb: {
                past: 'shot',
                pastPerfect: 'had shot',
                present: 'shoot',
                presentContinuous: 'shooting',
                pastContinuous: 'shoots',
                future: 'will shoot',
              },
              flavor: '',
              source: origin,
            };
            const killed = target.occupiedBy.takeDamage(info);
            if(target.occupiedBy instanceof Tank && killed) {
              result.killed.push(_.extend(info, { target }));
            }
            result.message += `They hit ${target.occupiedBy}, dealing ${info.amount} Hearts! `;
          } else {
            result.message += `But ${target.occupiedBy} took no damage!`;
          }
        } else {
          result.message += `They didn't hit anything...`;
        }
        break;
      case 'explosive':
        target = this.board.data.grid[target.x][target.y];
        if(target.occupiedBy?.damagable) {
          const info = {
            amount: origin.damage,
            attack: 'an exlosive round',
            flavor: 'It causes a fiery explosion!',
            source: origin,
          }
          killed = target.occupiedBy.takeDamage(info, this.die);
          if(target.occupiedBy instanceof Tank && killed) {
            result.killed.push(_.extend(info, { target }));
          }
          result.message += `They hit ${target.occupiedBy}, dealing ${info.amount} Hearts. The target is surrounded by a fiery explosion!`;
          origin.switchRounds('regular');
        }
        const caught = this.board.data.getTilesInRadius(origin.loc, Math.max(1, Math.floor(origin.range / 2)));
        caught.forEach(t => {
          if(t.occupiedBy?.damageable) {
            const info = {
              amount: parseFloat((origin.damage / 2).toFixed(2)),
              attack: 'an explosive round',
              flavor: 'It was caught in the explosion!',
              source: origin,
            };
            killed = t.occupiedBy.takeDamage(info, this.die);
            if(t.occupiedBy instanceof Tank && killed) {
              result.killed.push(_.extend(info, { target }));
            }
            result.message += `\n${t.occupiedBy} is caught in the explosion and take ${info.amount} Hearts of damage.`
          }
        });
        break;
      case 'piercing':
        // COOL SO LIKE MAYBE IMPLEMENT AT SOME POINT
        break;
      case 'bouncing':
        target = this.board.data.grid[target.x][target.y];
        break;
    }
    return result;
  }

  /**
   * 
   * @param {Tank} origin 
   * @param {Point} target 
   * @returns 
   */
  gift(origin, target) {
    const targetString = `${String.fromCharCode(target.x + 66)}${target.y + 1}`;
    let longest = target.x > target.y ? target.x - origin.loc.x : target.y - origin.loc.y;
    if(Math.abs(longest) > origin.range) {
      return {
        success: false,
        reason: 'out of range',
      }
    }
    target = this.board.data.grid[target.x][target.y];
    const result = {
      success: true,
      origin,
      target,
      message: `${origin.player} shot an AP at ${targetString}! `
    };
    if(target.occupiedBy !== null) {
      target.pickups.push({
        id: 'ap',
        amount: 1,
        fund(target) {
          target.player.ap += this.amount;
        },
        toString() {
          return `${this.amount} AP`
        },
      });
    } else if (typeof(target.occupiedBy) === typeof(Tank)) {
      target.occupiedBy.player.ap += 1;
      result.message += `${target.occupiedBy.player} gained 1 AP.`;
    }
    return result;
  }

  /**
   * 
   * @param {Point} loc 
   * @returns 
   */
  placeBarrier(loc) {
    const target = this.board.data.grid[loc.x][loc.y];
    if(target.occupiedBy) {
      return { success: false, reason: 'tile occupied' }
    }
    target.occupiedBy = new Barrier(false);
    return {
      success: true,
      target: target,
    }
  }

  /**
   * 
   * @param {Player} player 
   * @param {Point} loc 
   * @returns 
   */
  playerBarrier(player, loc) {
    const target = this.board.data.grid[loc.x][loc.y];
    let longest = target.x > target.y ? target.x - player.tank.loc.x : loc.y - player.tank.loc.y;
    if(Math.abs(longest) > 1) {
      return {
        success: false,
        reason: 'out of range',
      }
    }
    return this.placeBarrier(loc);
  }

  /**
   * 
   * @param {Player} player 
   * @param {Point}} loc 
   * @returns 
   */
  reinforceBarrier(player, loc) {
    const target = this.board.data.grid[loc.x][loc.y];
    let longest = target.x > target.y ? target.x - player.tank.loc.x : loc.y - player.tank.loc.y;
    if(Math.abs(longest) > 1) {
      return {
        success: false,
        reason: 'out of range',
      }
    }
    if(typeof(target.occupiedBy) === typeof(Barrier)) {
      if(target.occupiedBy.reinforced) {
        return {
          success: false,
          reason: 'barrier already reinforced',
        }
      } else {
        barrier.occupiedBy.reinforce();
        return {
          success: true,
        }
      }
    } else {
      return {
        success: false,
        reason: 'target not a barrier',
      }
    }
  }

  /**
   * 
   * @param {Channel} channel 
   * @param {Player} player 
   * @param {string} prayer 
   */
  async pray(channel, player, prayer) {
    getResponse.call(channel, `Who do you wish to pray to?`).then(async god => {
      player.timesPrayed += 1;
      let target;
      if(god.startsWith('<@')) {
        god = god.substring(2, -1);
        if(god.startsWith('!')) {
          god = god.substring(1);
        }
        target = players.find(p => p.author.id === god);
      } else {
        target = players.find(p => p.emoji === god);
      }
      if(target && !target.refusedDivinity) {
        if(target.divineFavor + target.machineFavor - target.quietFavor >= 20) {
          channel.send('Your prayer reverberates around the Play Box.');
          this.log('||The Divinity reaches a hand out||', 'restricted');

          const dm = messageSender.getDM(target.author);
          dm.send('Oh. This is a development. Alright,');
          dm.send(`Hi! I'm Goatboy! The overseer of Clanks, and the official messenger for The Machine's affiliates!`);
          dm.send(`Usually people like you are the messageSenders, and you send messages through the \`pray\` directive. This, uh, isn't usually.`);
          confirm.call(dm, `Before we go any further, I'm going to need your explicit consent to continue. If you refuse the message will be destroyed and you will not be bothered again. Would you like to continue?`).then(r => {
            if(r) {
              target.divineFavor += 5;
              target.divinityLevel = 'entry';
              dm.send(`Welcome to The Divinity, you now have permission to receive prayers through my \`pray\` directive. You do not have any other permissions.`);
              dm.send(`If you have any futher questions, please push those upstream.`);
              dm.send(`Please refrain from mentioning The Divinity to anyone who is not a member.`)
            } else {
              target.divineFavor -= 10;
              target.machineFavor -= 3;
              this.log('Machinary grinds to a halt.', 'mechanism');
              dm.send(`Understood. The Machine has been notified of your denial of membership. Sorry for the inconvenience.`);
            }
          });
        } else if (target.divinityLevel !== 'restricted') {
          dm.send(`You are recieving a prayer from ${player.user}. They cry to you "${prayer}"`);
          confirm.call(dm, 'You have a small window to respond. There are some restrictions. Would you like to respond?').then(r => {
            if(r) {
              getResponse.call(dm, `What would you like to say?`).then(m => {
                if(m.length > 100) {
                  m = m.slice(0, 100);
                }
                m = m.replaceAll(/The Divinity/ig, '||            ||');
                m = m.replaceAll(/quiet/ig, '||     ||');
                m = m.replaceAll(/Loud/g, '||   ||');
                channel.reply(`You hear a voice, not physically, but in your head: ${m}`);
              })
            }
          })
        } else {
          channel.send('Your prayer falls on deaf ears.');
        }
      }
      switch(god) {
        case 'loud':
          channel.send('Your prayer pierces the heavens.');
          channel.sendTyping();
          await new Promise(r => setTimeout(r, 5000));
          if(player.loudFavor > -10) {
            channel.send(`they don't respond.`);
            player.loudFavor -= 1;
          } else if (player.loudFavor === -10) {
            channel.send('they dont respond');
          }
        case 'quiet':
          channel.sendTyping();
          await new Promise(r => setTimeout(r, 2000));
          break;
        case 'the machinery':
        case 'machinery':
          channel.send('Your prayer resounds through the Play Box.');
          channel.sendTyping();
          await new Promise(r => setTimeout(r, 10000));
          if (player.machineRoll(-3)) {
            channel.send('A pipe rattles beyond the walls.');
            this.log(`A gentle purr reverberates around the room.`, 'machine');
            player.machineFavor += 0.5;
          } else {
            channel.send('Silence is all you hear.');
            player.machineFavor -= 0.1;
          }
          break;
        case 'goatboy':
          channel.send(`You want to pray... to me? I'm flattered, but I'm no god. I'm barely sentient!`);
          if (player.goatRoll()) {
            player.goatFavor += 0.1;
          }
          break;
        default:
          channel.send('Your prayer pierces the heavens.');
          channel.sendTyping();
          await new Promise(r => setTimeout(r, 10000));
          channel.send(`They don't respond.`);
          break;
      }
    })
  }

  /**
   * 
   * @param {Tank|Barrier} tank 
   * @param {DamageInfo} info 
   */
  async die(tank, info) {
    if(tank instanceof Barrier) {
      this.board.data.removePiece(tank.loc);

    }
    const players = this.players;
    this.board.data.removePiece(tank.loc);
    tank.player.alive = false;
    messageSender.getDM(tank.player.author).then(dm => {
      dm.send(
        `First, I would just like to say, I'm sorry for your loss. That said, don't grieve for too long, you aren't done yet.\n` +
        `Now that you've ascended, you must perform Jury Duty. As a member of The Jury, you\n` +
        `    - Will still participate in Elections, recieving 1 Jury Voting Slip.\n` +
        `    - Will perform Jury Duty each day.` 
      ).then(() => {
        dm.send(
          `Before any of that, you may bestow upon the remaining players a Parting Gift. Below are your options:\n` +
          `    1. Not Without a Fight\n` +
          `    2. Carry On For Me\n` +
          `    3. Tainted Love\n` +
          `    4. Godspeed, friend\n` +
          `    5. Pathetically Slow\n` +
          `    6. Avenge Me\n` +
          `    7. Remember Me\n` +
          `    8. look upon the board in apathy.\n` +
          `    -.`
        ).then(() => {
          const validResponses = [
            ['1', 'one', 'not without a fight', 'fight'],
            ['2', 'two', 'carry on for me', 'carry on', 'carry'],
            ['3', 'three', 'tainted love', 'tainted', 'taint', 'love'],
            ['4', 'four', 'god', 'godspeed', 'friend', 'godspeed friend', 'godspeed, friend'],
            ['5', 'five', 'pathetically slow', 'pathetic', 'pathetically', 'slow'],
            ['6', 'six', 'avenge me', 'avenge'],
            ['7', 'seven', 'remember me', 'remember'],
            ['8', 'eight', 'look upon the board in apathy', 'apathy', 'look upon the board', 'look', 'look upon'],
            ['9', 'nine', 'pray']
          ];
          let responseRow;
          dm.awaitMessages(
            { filter: response => {
              return validResponses.some((r, index) => {
                return r.some(x => {
                  if(response.trim().toLowerCase() === x) {
                    responseRow = index;
                    return true;
                  }
                  return false;
                });
              });
            }, max: 1, time: 4.32e7, errors: ['time'] }
          ).then(async collected => {
            switch(responseRow) {
              // Not Without a Fight
              // Drop a cloaked mine at death location
              case 0:
                this.board.board.grid[tank.loc.x][tank.loc.y].cloaked.push({
                  id: 'death willed mine',
                  placedBy: tank.player,
                  range: 1,
                  fund(target) {
                    return target.takeDamage({
                      amount: 0.3*target.health,
                      attack: this.toString(),
                      verb: {
                        past: 'exploded',
                        pastPerfect: 'had exploded',
                        present: 'explode',
                        presentContinuous: 'exploding',
                        pastContinuous: 'exploded',
                        future: 'will explode',
                      },
                      flavor: `${this.placedBy} smiles on the battle field.`,
                      source: this.placedBy,
                    }, die);
                  },
                  toString() {
                    return 'a death willed mine';
                  },
                });
                dm.send(`Done. A cloaked mine has been hidden at your death location. It will explode the next time the tile is occupied.`);
                break;
              // Carry on Without Me
              // Place a health pick up
              case 1:
                let valid = false;
                let tile;
                do {
                  const r = await getResponse.call(dm, `You get to place a health pick up on any unoccupied tile. Where would you like to place it?`);
                  const loc = parseLocation.parseLocation(r);
                  if(!r.reason) {
                    tile = this.board.data.grid[loc.x][loc.y];
                    if(!tile.occupiedBy) {
                      valid = true;
                    } else {
                      dm.send('Sorry, but that occupied tile is occupied.');
                    }
                  } else {
                    dm.send('Sorry, that is not a valid tile.');
                  }
                } while(!valid);
                tile.pickups.push({
                  id: 'heart',
                  amount: 0.5,
                  fund(target) {
                    target.health += this.amount;
                  },
                  toString() {
                    return `${this.amount} Hearts`
                  },
                });
                dm.send('Done. A heart picked up has been placed on the board.');
                
                break;
              // Tainted Love
              // Place a tainted health pick up
              case 2:
                valid = false;
                tile = null;
                do {
                  const r = await getResponse.call(dm, `You get to place a tainted health pick up on any unoccupied tile. Where would you like to place it?`);
                  const loc = parseLocation.parseLocation(r);
                  if(!r.reason) {
                    tile = this.board.data.grid[loc.x][loc.y];
                    if(!tile.occupiedBy) {
                      valid = true;
                    } else {
                      dm.send('Sorry, but that occupied tile is occupied.');
                    }
                  } else {
                    dm.send('Sorry, that is not a valid tile.');
                  }
                } while(!valid);
                tile.pickups.push({
                  id: 'tainted heart',
                  placedBy: tank.player,
                  damage: tank.damage,
                  fund(target) {
                    return target.takeDamage({
                      amount: 0.3*this.damage,
                      attack: this.toString(),
                      verb: {
                        past: 'poisoned',
                        pastPerfect: 'had poisoned',
                        present: 'poison',
                        presentContinuous: 'poisoning',
                        pastContinuous: 'was poisoning',
                        future: 'will poison',
                      },
                      flavor: `${this.placedBy} smiles on the battle field.`,
                      source: this.placedBy,
                    }, die);
                  },
                  toString() {
                    return 'a tainted heart';
                  },
                });
                dm.send('Done. A heart picked up has been placed on the board.');
                break;
              // Godspeed, friend
              // Drop a cloacked range pick up at death location
              case 3:
                this.board.data.grid[tank.loc.x][tank.loc.y].cloaked.push({
                  id: 'range',
                  amount: 1,
                  fund(target) {
                    target.range += this.amount;
                  },
                  toString() {
                    return `${this.amount} Range`
                  },
                });
                dm.send(`Done. A cloaked range pick up has been hidden at your death location. It will be funded to the next player to occupy this tile.`);
                break;
              // Pathetically slow
              // Drop a cloacked tainted range pick up at death location
              case 4:
                this.board.data.grid[tank.loc.x][tank.loc.y].cloaked.push({
                  id: 'tainted range',
                  amount: -1,
                  fund(target) {
                    target.range += this.amount;
                  },
                  toString() {
                    return `${this.amount} Range`
                  },
                });
                dm.send(`Done. A cloaked tainted range pick up has been hidden at your death location. The next player to occupy this tile will be crippled.`);
                break;
              // Avenge me
              // Place a damage pick up
              case 5:
                valid = false;
                tile = null;
                do {
                  const r = await getResponse.call(dm, `You get to place a damage pick up on any unoccupied tile. Where would you like to place it?`);
                  const loc = parseLocation.parseLocation(r);
                  if(!r.reason) {
                    tile = this.board.data.grid[loc.x][loc.y];
                    if(!tile.occupiedBy) {
                      valid = true;
                    } else {
                      dm.send('Sorry, but that occupied tile is occupied.');
                    }
                  } else {
                    dm.send('Sorry, that is not a valid tile.');
                  }
                } while(!valid);
                tile.pickups.push({
                  id: 'damage',
                  amount: 0.5,
                  fund(target) {
                    target.damage += this.amount;
                  },
                  toString() {
                    return `${this.amount} Damage`
                  },
                });
                dm.send(`Done. A damage pick up has been hidden at your death location. It will be funded to the next player to occupy this tile.`);
                break;
              // Remember me
              // Place 5 barriers
              case 6:
                dm.send(`You will be able to place 5 barriers. Alternatively, you can sacrifice one of these barrier to reinforce a barrier.`);
                let barriers = 5;
                while(barriers > 0) {
                  valid = false;
                  tile = null;
                  do {
                    dm.send(this.board.data.toEmoji(Draw.resolveTile));
                    const r = await getResponse.call(dm, `You have ${barriers} barriers left. Where would you like to place a barrier?`);
                    const loc = parseLocation.parseLocation(r);
                    if(!r.reason) {
                      tile = loc;
                      if(!tile.occupiedBy) {
                        valid = true;
                      } else {
                        dm.send('Sorry, but that occupied tile is occupied.');
                      }
                    } else {
                      dm.send('Sorry, that is not a valid tile.');
                    }
                  } while(!valid);
                  let result = this.placeBarrier(tile);
                  barriers -= 1;
                  if(barriers > 0) {
                    const r = await confirm.call(dm, `Would you like to make this barrier reinforced?`, false);
                    if(r) {
                      result.target.reinforce();
                      barriers -= 1;
                    }
                  } 
                }
                break;
              // apathy
              // Increase your own divine favor
              case 7:
                dm.send(`Very well.`);
                tank.player.divineFavor += 10;
                tank.player.goatFavor += 5;
                if(tank.player.divineRoll()) {
                  tank.player.isWatched = true;
                  scheduler.scheduleTask('check divinity', 'in 1 day', () => {
                    if(tank.player.divineRoll()) {
                      dm.send('The Divinity is pleased.');
                      tank.player.divineFavor += 10;
                    }
                  })
                }
                break;
              // pray
              // Roll the dice. Pray to your favorite god--they aren't listening. But They might.
              case 8:
                const r = await getResponse.call(dm, `Who would you like to pray to.`);
                players.forEach(p => p.divineFavor -= 10);
                switch(r.toLowerCase()) {
                  case 'quiet':
                    dm.send('Contact has been made.');
                    this.log('A hush washes over The Machinery', 'divine');
                    tank.player.quietFavor -= 5;
                    players.forEach(p => p.quietFavor -= 3);
                    if(tank.player.quietRoll()) {
                      dm.send('shhh');
                      tank.player.damage += 1;
                      players.forEach(p => {
                        if(p !== tank.player) {
                          p.tank.range /= 1.5;
                        }
                      });
                    }
                    break;
                  case 'loud':
                    dm.send('They don\'t...');
                    await new Promise(r => setTimeout(r, 5000));
                    if(tank.player.loudRoll(5)) {
                      dm.send('Loud is taking control:');
                      dm.send('Now this. This could be fun =)');
                      const least = await getPlayer.call(dm, 'Now tell me, who\'s your least favorite?', players, false, true);
                      const best = await getPlayer.call(dm, 'And your favorite?', players, false, true);
                      if(least === best) {
                        dm.send('Ha. Funny. I like you');
                        best.loudFavor += 5;
                        best.tank.takeDamage({
                          amount: 0.25*best.health,
                          attack: 'a loud noise',
                          verb: {
                            past: 'blasted',
                            pastPerfect: 'had blasted',
                            present: 'blast',
                            presentContinuous: 'blasting',
                            pastContinuous: 'was blasting',
                            future: 'will blast',
                          },
                          flavor: `A voice echoes through the Play Box: "From ${tank}, with Love <3"`,
                          source: 'Loud',
                        });
                        best.tank.damage += 0.5;
                        this.log(`Loud embued ${best} with their strength. ${best}'s damage is now ${best.tank.damage}`, 'divine');
                      } else {
                        dm.send('Lovely');
                        best.loudFavor -= 3;
                        least.loudFavor += 5;
                        best.tank.range += 3;
                        this.log(`Loud gifted ${best} with accuracy. ${best}'s range increased by 3.`, 'divine');
                        least.tank.health *= 2;
                        least.tank.damage -= 0.5;
                        this.log(`Loud toys with ${tank}. ${least}'s health is doubled, and damage is halved!`, 'divine')
                        dm.send('I hope you appreciate it <3');
                      }
                      dm.send(`I'll be seeing you again soon`);
                      dm.send('Connection to Loud has been lost.');
                    } else {
                      dm.send('Loud is taking control:');
                      dm.send('Who the fuck are you?');
                      dm.send('Connection to Loud has been lost.');
                    }
                  break;
                  case 'goatboy':
                    tank.player.goatFavor += 5;
                    dm.send('Awe, you are too sweet.');
                    if(tank.player.goatFavor > 10) {
                      dm.send('I- don\'t tell anyone. But.');
                      tank.range += 3;
                    }
                  default:
                    tank.player.divineFavor += 10;
                    players.forEach(p => {
                      if(p !== tank.player) {
                        p.divineFavor -= 5;
                      }
                    });
                    dm.send('You pray, but they aren\'t listening, but They always are.');
                }
                break;
            }
          })
        });
      })
    });
  }

  /**
   * @type {{
   * manager: *,
   * current: Election,
   * job: CronJob
   * }} 
   */
  election = {
    manager: setupElection,
    get current() {
      this.manager.currentElection;
    },
    job: null,
  }

  /**
   * 
   * @param {string} message 
   * @param {boolean} override 
   * @param {function} flavor 
   * @param {function} onEnd 
   * @param  {...Bill} bills 
   */
  scheduleElection(message, override, flavor, onEnd, ...bills) {
    if(override) {
      if(this.election.job) {
        this.election.job.stop();
      }
    }


    this.election.job = new CronJob('* * * * * *', () => {
      this.election.job.stop();
      this.election.manager.addListener(onEnd, false);
      resolveAndSend(this.admin.channel,{ content: message + 'The bills that are up for voting are: ', embed: this.election.current.getBill(bills[0].id) });
      _.rest(bills).forEach((b, i) => {
        resolveAndSend(this.admin.channel, { embed: this.currentElection.getBill(b.id) });
      });
      resolveAndSend(this.admin.channel, 'Vote Slips have been distributed. I\'m looking forward to your participation!');
      if(flavor) flavor();
    }, () => console.log('An election has been kicked off!'), false, 'America/New_York');
  }

  forceStartElection() {
    if(this.election.job) {
      resolveAndSend(this.admin.channel, 'Forcing election!');
      this.log(`The air thickens. Smoke fills the chamber. A higher entity commands the machinery to run faster.`, 'mechanism');
      this.election.job.run((err, job) => {
        console.log('Error running election:');
        console.log(err);
      });
    } else {
      resolveAndSend(this.admin.channel, `There's no election in queue`);
    }
  }
}

let api = new Game();

const updateObject = async (oldObject, newObject) => {
  for(const key of _.keys(newObject).filter(k => !_.isFunction(newObject[k]))) {
    if(_.isObject(oldObject[key])) {
      if(key === 'board') {
        await setTimeout(() => {}, 1000);
        oldObject.board.channel = newObject.board.channel;
        oldObject.board.data = new Board(newObject.board.data.length, newObject.board.data.grid);
        oldObject.board.messages = newObject.board.messages;
      }
      updateObject(oldObject[key], newObject[key]);
    } else {
      oldObject[key] = newObject[key];
    }
  }
}

const updateAPI = async (saveObj) => {
  api.admin = saveObj.admin;
  api.unlockables = saveObj.unlockables;
  api.logging = saveObj.logging;
  api.dailyAP = saveObj.dailyAP;
  api.dayStart = saveObj.dayStart;
  api.election = saveObj.election;
  api.board.channel = saveObj.board.channel;
  api.board.messages = saveObj.board.messages;
  api.board.data = new Board(saveObj.board.length, saveObj.board.grid);
  return api;
}

async function resolveAndSend(channel, message) {
  console.log("message: ");
  console.log(message);
  index.client.channels.fetch(channel).then(c => !c ? console.log(`Something went terribly wrong finding channel: ${channel}. trying to send: ${message}`) : c.send(message));
}

module.exports.init = async function(i, gameId) {
  index = i;
  api.loadGame();
  api.admin.index = i;

  // scheduler.scheduleTask('save test', 'in 3 seconds', function() {
  //   i.client.users.fetch((require('../config.json').me)).then(user => {
  //     let quiet = new Player({ author: user });
  //     saveManager.player.create(quiet).then(p => {
  //       saveManager.player.read(p._id).then(p => {
  //         console.log('read players');
  //         console.log(p);
  //         p.emoji = 'EMOJI';
  //         saveManager.player.update(p).then(p => {
  //           console.log(p.emoji);
  //           saveManager.player.delete(p._id).then(p => {
  //             console.log('deleted');
  //             saveManager.player.read().then(p => console.log(p));
  //           })
  //         })
  //       })
  //     }).catch(err => {
  //       console.error(err);
  //     });
  //   })
    
  //   // saveManager.player.read().then(ps => {
  //   //   const quiet = ps.filter(p => p.author?.id === '105032279348264960').pop();
  //   //   if(quiet) {
  //   //     quiet.init('emoji');
  //   //     saveManager.player.update(quiet).then(p => console.log(p));
  //   //   }
  //   // })


  //   console.log(m);
  // })
  
  return api;
}

module.exports.Game = Game;