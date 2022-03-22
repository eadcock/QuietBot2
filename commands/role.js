let roles = require('../roles.json');
module.exports = {
    name: 'role',
    cooldown: 1,
    description: 'Edit your custom role!',
    pagable: false,
    execute(message, args) {
        for(let i = 0; i < roles.length; i++) {
            console.log(`${roles[i]},`);
        }
        let ownerId = message.author.id;
        let role = message.guild.roles.get(roles[ownerId]);
        if(!args.length) {
            console.log('no args');
            if(role === undefined) {
                message.reply('You currently don\'t have a custom role set up');
            }
            else {
                message.channel.send(`You're current role is: <@&${role.id}>`);
            }
        }
        else {
            console.log(`There are ${args.length} args!`);
            if(args[0] === 'setName') {
                if(role !== undefined) {
                    let name = '';
                    for(let i = 1; i < args.length; i++) {
                        name += args[i] + " ";
                    }
                    role.setName(name.substring(0, name.length - 1)).then(message.channel.send(`Updated name to: ${name}`));
                } else {
                    message.reply('Hey, wait a minute, you don\'t have a role yet! Use `~role create \'[name]\' [color]` to create a new role');
                }
            } else if (args[0] === 'setColor') {
                if(role !== undefined) {
                    role.setColor(args[1]).then(message.channel.send(`Updated color to: ${args[1]}`));
                } else {
                    message.reply('Hey, wait a minute, you don\'t have a role yet! Use `~role create \'[name]\' [color]` to create a new role');
                }
            } else if (args[0] === 'create') {
                if(role !== undefined) {
                    message.reply('Stop being greedy, you already have a role :/');
                }
                else {
                    let argsIndex = 1;
                    let name = "";
                    for(let i = 1; i < args.length - 1; i++) {
                        name += `${args[i]} `
                    }
                    let color = args[args.length - 1];
                    message.guild.createRole({name: name, color: color}).then(role => addRole(role)).catch(console.log('uh-oh, something went wrong'));
                }
            }
        }

        function parseName(argsIndex) {
            let name = '';
            for(; true; argsIndex++) {
                let string = args[argsIndex];
                if(string.charAt(0) === '\'') {
                    string = string.substring(1);
                } else if(string.charAt(string.length - 1) === '\'') {
                    name += string.substring(0, string.length - 1);
                    break;
                } else {
                    name += string + " ";
                }
            }
            return [name, argsIndex];
        }

        function addRole(role) {
            message.member.addRole(role);
            roles[ownerId] = role.id;

            const fs = require('fs');
            fs.writeFileSync('roles.json', JSON.stringify(roles));

            message.reply(`Role created! Name: ${role.name}. Color: ${role.color}`);
        }
    }
}