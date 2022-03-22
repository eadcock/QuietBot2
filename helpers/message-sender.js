


module.exports = {
  getDM: async function(user) {
    if(!user.dmChannel) {
      await user.createDM();
    }
    return user.dmChannel;
  },
  sendDM: async function(user, message) {
    if(!user.dmChannel) {
      await user.createDM();
    }
    return user.dmChannel.send(message);
  },
  name: 'messageSender',
}