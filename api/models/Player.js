const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  emoji: String,
  object: {
    type: String,
  },
});

PlayerSchema.statics.findByUser = function(user, cb) {
  return this.find({ user: user }, cb);
};

PlayerSchema.statics.findByEmoji = function(emoji, cb) {
  return this.find({ emoji: emoji }, cb);
};

module.exports = mongoose.model('Player', PlayerSchema);