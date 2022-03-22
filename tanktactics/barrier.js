
class Barrier {
    constructor(reinforced = false) {
      this.health = reinforced ? 2 : 0.5;
      this.reinforced = reinforced;
      this.loc = { x: 0, y: 0 };
      this.movable = false;
      this.damagable = true;
      this.tileID = 'barrier';
      this.currentRounds = 'regular';
    }

    takeDamage(info, callback) {
      this.health -= info.amount;
      if(this.health <= 0) {
        callback(info);
        return true;
      } 
      return false;
    }

    getID() {
      return this.reinforced ? 'reinforced barrier' : 'barrier';
    }

    toString() {
      return this.getID();
    }

    reinforce() {
      this.health += 1.5;
      this.reinforced = true;
    }
}

module.exports = Barrier;