module.exports = {
    name: 'cmd-info',
    description: 'Command Info',
    args: true,
    usage: '<literaly anything>',
    execute(message, args) {
        if (args[0] === 'foo'){
            return message.channel.send('bar');
        }

        message.channel.send(`Command name: ${command}\nArguments: ${args}`);
    }
}