const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  object: {
    type: String,
  },
});

GameSchema.statics.findById = function(id, cb) {
  return this.find({ _id: id }, cb);
};

module.exports = mongoose.model('Game', GameSchema);