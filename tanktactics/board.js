//@ts-check

const Barrier = require("./barrier.js");
const Tank = require("./tank.js");

/**
 * @typedef {Object} Tile
 * @property {string} occupiable
 * @property {Tank|Barrier} occupiedBy
 * @property {import('./game.js').pickup[]} pickups
 * @property {import('./game.js').pickup[]} cloacked
 * @property {() => string} getID
 */

/**
 * @typedef {import('./game.js').Point} Point
 */

/** Holds information about tile/positional info */
class Board {
  /**
   * 
   * @param {number} length 
   */
    constructor(length, grid) {
      this.length = length;
      if(!grid) {
        this.grid = new Array(length);
        for(let i = 0; i < length; i++) {
          this.grid[i] = new Array(length);
          for(let j = 0; j < length; j++) {
            this.grid[i][j] = { 
              occupiable: true,
              occupiedBy: null,
              pickups: [],
              cloaked: [],
            }
          }
        }
      } else {
        this.grid = grid;
      }
      
    }

    /**
     * 
     * @param {Tank} tank 
     * @returns {Tile} The tile the tank has been placed on
     */
    placeRandomly(tank) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.length);
        y = Math.floor(Math.random() * this.length);
      } while(this.grid[x][y].occupiedBy !== null);

      this.grid[x][y].occupiedBy = tank;
      tank.loc.x = x;
      tank.loc.y = y;
      return this.grid[x][y];
    }

    /**
     * 
     * @param {import("discord.js").TextBasedChannels} channel 
     * @param {Point} oldLoc 
     * @param {Point} newLoc 
     * @returns 
     */
    movePiece(channel, oldLoc, newLoc) {
        const oldTile = this.grid[oldLoc.x][oldLoc.y];
        const newTile = this.grid[newLoc.x][newLoc.y];
        console.log(oldTile);
        if (oldTile?.occupiedBy.movable) {
            return { success: false, reason: 'piece not movable'};
        }    
        else if (newTile !== null && !newTile.occupiable) {
            return { success: false, reason: 'tile not occupiable'};
        }
        
        newTile.occupiedBy = oldTile.occupiedBy;
        newTile.occupiedBy.loc = newLoc;
        newTile.occupiable = false;
        oldTile.occupiedBy = null;
        newTile.occupiable = true;

        if(newTile.pickups.length && typeof(newTile.occupiedBy) === typeof(Tank)) {
          newTile.occupiedBy.pickup(channel, newTile.pickups);
          newTile.pickups = [];
        }

        return { success: true, loc: newLoc }
    }

    /**
     * 
     * @param {Point} loc 
     * @returns 
     */
    removePiece(loc) {
      if(this.grid[loc.x][loc.y]) {
        this.grid[loc.x][loc.y].occupiedBy = null;
        this.grid[loc.x][loc.y].occupiable = true;

        return { success: true };
      } 
      return { success: false, reason: 'no piece at loc'};
    }

    resolveID(obj) {
      console.log('??')
      if(obj.occupiedBy) {
        console.log('?')
        return obj.occupiedBy.tileID;
      }
      if(obj.pickups && obj.pickups.length) {
        return 'pickup'
      }
      return 'empty';
    }

    /**
     * 
     * @param {(id: string) => string} resolveTile Get the emoji representation from a code.
     * @returns {string[]} The string representation of the board split in half between index 0 and 1
     */
    toEmoji(resolveTile) {
      console.log(this.length);
      let string = ['', ''];
      string[0] += '⚙   1 | 2 |  3 | 4 |  5 | 6 |  7 | 8 | 9 | 10| 11 | 12|13 |14| 15| 16| 17| 18|\n';
      for(let i = 0; i < this.length; i++) {
        string[i < 9 ? 0 : 1] += `:regional_indicator_${String.fromCharCode(97 + i)}:`;
        for(let j = 0; j < this.length; j++) {
          const id = this.resolveID(this.grid[i][j]);
          console.log(id);
          if(id !== 'empty') {
            console.log(id);
          }
          string[i < 9 ? 0 : 1] += resolveTile(id);
        }
        string[i < 9 ? 0 : 1] += '\n';
        resolveTile('empty');
      }
      
      return string;
    }

    /**
     * 
     * @param {Point} centerLoc 
     * @param {number} radius 
     * @returns {Tile[]}
     */
    getTilesInRadius(centerLoc, radius) {
      const tiles = [];
      for(let i = -radius; i <= radius; i++) {
        if(centerLoc.x + i < 0 || centerLoc.x + i >= this.length) continue;
        for(let j = -radius; j <= radius; j++) {
          if(centerLoc.y + j < 0 || centerLoc.y + j >= this.length) continue;
          tiles.push(this.grid[centerLoc.x + i][centerLoc.y + j]);
        }
      }
      return tiles;
    }
}

module.exports.Board = Board;