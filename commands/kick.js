module.exports = {
    name: 'kick',
    description: 'Pretends to kick a user',
    args: true,
    usage: '<user>',
    execute(message, args) {
        const taggedUsers = message.mentions.users;

        if(message.mentions.users.size) {
            message.channel.send(`You wanted to kick: ${taggedUsers.first().username}`);
        }
        else {
            message.reply('you didn\'t tag any users');
        }
    }
}