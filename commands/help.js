const { CommandInteraction, Message, CommandInteractionOptionResolver } = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

/**
 * 
 * @param {string} string 
 */
const capitalize = (string) => {
  if(string) {
    string.replace(string.charAt(0), string.charAt(0).toUpperCase());
  }
  return string;
}

/**
 * 
 * @param {{options: import('discord.js').ApplicationCommandOption[]}} meta
 */
const getUsage = (meta) => {
  let usage = '';
  if(!meta.options) {
    return '';
  }

  meta.options.forEach(option => {
    let arg = '';
    arg += ` <${option.name}>`;
    if(!option.required) {
      arg.concat(['[', arg, ']']);
    }
    usage += arg;
  });

  return usage.trim();
}

module.exports = function(index) {
  return {
    meta: {
      name: 'help',
      description: 'Get help. If abridged, display a command list.',
      /**@type {import('discord.js').ApplicationCommandOption[]} */
      options: [
        {
          name: 'abridged',
          description: 'Mark as true to get a short command list',
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        }
      ],
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {

      this.command(interaction, {abridged: interaction.options.getBoolean('abridged')});
    },
    /**
     * 
     * @param {Message} message 
     * @param {...string} args 
     */
    parseArgs(message, ...args) {
      this.command(message, {abridged: !!args[0]});
    },
    /**
     * 
     * @param {Message|CommandInteraction} interaction 
     * @param {{abridged: boolean}} options 
     */
    command(interaction, options) {
      let message = ``;
      interaction.reply('Getting help.');
      if(options.abridged) {
        for(const command of index.client.commands) {
          if(command[1].commands) {
            message += `**${capitalize(command[0])}**\n`;
            for(const sCommand of command[1].commands) {
              message += `\t- \`/admin ${sCommand[0]} ${getUsage(sCommand[1].meta)}\``
            }
          } else {
            message += `/${command[0]} ${getUsage(command[1].meta)}`
          }
        }
        interaction.reply({ content: message, ephemeral: interaction.channel === 'DM'});
      }
    }
  }
}