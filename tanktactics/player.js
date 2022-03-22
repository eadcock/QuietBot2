//@ts-check
const _ = require('underscore');

class Player {
  _id;
  author;
  emoji;
  alive = true;
  anon = true;
  ap = 0;
  /**@type {import('./tank.js')} */
  tank;
  timesPrayed = 0;
  votingSlips = 0;
  juryBallots = 0;
  favor = {
    divine: 3,
    goat: 0,
    machine: 0,
    quiet: 0,
    loud: 0
  };
  unlockedAmmo = {
    expolosive: false,
    piercing: false,
    bouncing: false,
  };
  divinity = {
    refused: undefined,
    level: 'restricted'
  }

  /**
   * @class
   */
  constructor(properties) {
    const pairs = _.pairs(properties);
    console.log('pairs: ' + pairs.length);
    _.pairs(properties).forEach(p => {
      this[p[0]] = p[1];
    });
  }

  /**
   * 
   * @param {string} emoji 
   */
  init(emoji) {
    this.emoji = emoji;
  }

  toString() {
    return this.anon ? 'Player ' + this.emoji : `<@${this.author}>`;
  }

  /**
   * 
   * @param {number} [mod] increase the roll by this amount
   * @param {number} [favor] decrease the requirement by this amount
   * @returns Whether the roll succeeds
   */
  roll(mod, favor) {
    if(!mod) mod = 0;
    if(!favor) favor = this.favor.divine;
    const roll = Math.floor(Math.random() * 20);
    const result = roll === 20 || roll + mod > (20 - favor);
    console.log(`${this} rolled a ${roll + mod}! They need a ${20 - favor} ${result ? 'They passed!' : 'They failed!' }`);
    return result;
  }

  /**
   * 
   * @param {number} [mod] increase the roll by this amount
   * @returns 
   */
  divineRoll(mod) {
    return this.roll(mod, this.favor.divine);
  }
  
  /**
   * 
   * @param {number} [mod] increase the roll by this amount
   * @returns 
   */
  goatRoll(mod) {
    return this.roll(mod, this.favor.goat);
  }
  
  /**
   * 
   * @param {number} [mod] increase the roll by this amount
   * @returns 
   */
  machineRoll(mod) {
    return this.roll(mod, this.favor.machine);
  }
  
  /**
   * 
   * @param {number} [mod] increase the roll by this amount
   * @returns 
   */
  quietRoll(mod) {
    return this.roll(mod, this.favor.quiet);
  }
  
  /**
   * 
   * @param {number} [mod] increase the roll by this amount
   * @returns 
   */
  loudRoll(mod) {
    this.roll(mod, this.favor.loud);
  }
}

module.exports = Player;