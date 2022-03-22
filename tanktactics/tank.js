//@ts-check
//@ts-ignore
const { sender } = require('../helpers');
const _ = require('underscore');
const Player = require('./player.js');

/**
 * A structure representing the various tenses of a verb
 * @typedef {Object} verb
 * @property {string} past
 * @property {string} pastPerfect
 * @property {string} present
 * @property {string} presentContinuous
 * @property {string} pastContinuous
 * @property {string} future
 */

/**
 * @typedef {Object} DamageInfo
 * @property {number} amount Amount of damage dealt
 * @property {string} attack Descriptor of the attack
 * @property {verb} verb The verbs to use when describing the attack
 * @property {string} flavor Flavor text
 * @property {Tank} source The Tank that dealt the damage
 */

/**
 * @callback onDeath
 * @param {Tank} tank The tank that died
 * @param {DamageInfo} info How the tank died
 */

/**
 * Represents a player piece
 */
class Tank {
  /**
   * 
   * @param {import('./player.js')|Tank} options 
   */
  constructor(options) {
    if(options instanceof Player) {
      this.health = 3;
      this.range = 2;
      this.damage = 1;
      this.player = options;
      this.loc = { x: 0, y: 0 };
      this.movable = false;
      this.damagable = true;
      this.tileID = options.author.id;
      this.currentRounds = 'regular';
    } else {
      // @ts-ignore
      _.pairs(options).forEach(t => this[t[0]] = t[1]);
    }
  }

  /**
   * 
   * @param {DamageInfo} info 
   */
  takeDamage(info) {
    this.health -= info.amount;
    sender.sendDM(this.player.author, `You lost ${info.amount} Hearts from ${info.source.player} ${info.verb.presentContinuous} ${info.attack}!`);
    return this.health <= 0;
  }

  /**
   * 
   * @param {string} newRound 
   */
  swapRounds(newRound) {
    this.currentRounds = newRound;
  }

  roundToFlavor() {
    switch(this.currentRounds) {
      case 'regular':
        return 'a regular round';
      case 'explosive':
        return 'an explosive round';
      case 'piercing':
        return 'a piercing round';
      case 'bouncing':
        return 'a bouncing round';
    }
  }

  /**
   * 
   * @param {import('discord.js').TextBasedChannels} channel 
   * @param {(message: string, type: string) => void} announce
   * @param {*} pickups 
   */
  pickup(channel, announce, pickups) {
    pickups.forEach(p => {
      announce(`${this.player} found ${p}`, 'playerEvent');
      if(p.fund(this)) {
        announce(`${this.player} died to ${p}!`, 'death');
        return;
      }
    });
  }

  toString() {
    return this.player.toString();
  }
}

module.exports = Tank;