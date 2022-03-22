//@ts-check
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { Client, CommandInteraction, Message } = require('discord.js');
//@ts-ignore
const { getPlayer, confirm, sender } = require('../../helpers');
const { Game } = require('../../tanktactics/game');
const { me } = require('../../config.json');
let index;
module.exports = (index, /**@type {Game} */ game) => {
  this.index = index;
  return {
    meta: {
      name: 'upgrade',
      description: 'Upgrade your stat! Use `upgrade range` to increase your range!',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'stat',
          description: 'The stat you would like to upgrade',
          type: ApplicationCommandOptionType.String,
          required: false,
        }
      ],
      requiresStart: true,
      cost: 1,
      potency: 1,
      validStats: ['range', 'damage'],
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
      try {
        this.command(interaction, { stat: interaction.options.getString('stat', game.unlockables.upgradeDamage) });
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * 
     * @param {Message} message 
     * @param  {...string} args 
     */
    parseArgs(message, ...args) {
      let stat = args.length ? args[0] : undefined;
      this.command(message, {stat});
    },
    /**
     * 
     * @param {Message|CommandInteraction} interaction 
     * @param {{stat: string}} options 
     * @returns 
     */
    command(interaction, options) {
      let stat = options.stat;
      const ephemeral = interaction.channel.type === 'DM';
      if(stat && !this.meta.validStats.find(s => s === stat.toLowerCase())) {
        interaction.reply({ content: `Oh, I'm sorry. That's not a valid stat.`, ephemeral });
        return;
      }

      if(!stat) {
        if(game.unlockables.upgradeDamage) {
          // @ts-ignore
          interaction.reply({ conent: `Well, I can't upgrade anything if you don't tell me what you want upgraded`, ephemeral });
          return;
        } else {
          stat = 'range';
        }
      }
      const player = game.resolvePlayer(interaction instanceof Message ? interaction.author : interaction.user);
      switch(stat.toLowerCase()) {
        case 'range':
          if(player.ap >= this.meta.cost) {
            confirm.call(interaction.channel, 'Upgrading your range will cost you 1 AP. Is this ok? (y/n)').then(result => {
              if(result) {
                player.tank.range += 1 * this.potency;
                interaction.reply({ content: `Awesome! Your range is now ${player.tank.range}`, ephemeral });
                game.log('A player upgraded their range.', 'playerEvent');
              } else {
                interaction.reply({ content: `That's alright, we can do something else.`, ephemeral });
              }
            }).catch(err => {
              console.log(err);
              interaction.reply({ content: 'Sorry, something went wrong.', ephemeral });
            });
          } else {
            interaction.reply({ content: `You don't have enough AP for that action`, ephemeral });
          }
          break;
        case 'damage':
          if(!game.unlockables.upgradeDamage) {
            game.unlockables.upgradeDamage = true;
            interaction.reply(`wait... you want me to upgrade... your damage? H- hold on...`);
            interaction.channel.sendTyping();
            game.log('Goatboy enters the archives...', 'unlocked');
            game.scheduler.scheduleTask('check archive', 'in 20 seconds', async () => {
              interaction.channel.send('Ok, ok, there is something here!');
              interaction.channel.sendTyping();
              await new Promise(r => setTimeout(r, 5000));
              interaction.channel.send('Yeah, yeah, you are totally, right, I can do that! The cost is pretty steep though, 3 AP.');
              sender.sendDM(interaction.client.users.resolve(me), 'Unredact Damage Upgrade in the book');
              game.log('The archives come to life.', 'unlocked');
              await new Promise(r => setTimeout(r, 500));
              interaction.channel.send(`Ah, what the heck, I'm in control here. Don't tell anyone, but I'll give you it free, just this time. For finding it!`);
              await new Promise(r => setTimeout(r, 500));
              interaction.channel.send(`Or, I suppose you could give this to another player, but that's entirely up to you. No one is truly your friend in this game, afterall.`);
              confirm.call(interaction.channel, 'Would you like to give this upgrade to another player?').then(async result => {
                if(result) {
                  interaction.channel.send(`You are nicer than I... Well actually I'm the one giving you the free upgrade, so that's debatable. Either way, hope this doesn't come back to bite you!`);
                  const target = getPlayer.call(interaction.channel, `Now, who would you like to give this upgrade?`, player, ephemeral, true);
                  target.tank.damage += 0.5;
                  interaction.channel.send(`Very well. ${target}'s damage is now ${target.tank.damage}.`);
                  game.log(`${target}'s damage has increased to ${target.tank.damage}!`, 'playerEvent');
                } else {
                  player.tank.damage += 0.5;
                  interaction.channel.send(`Wise choice. I can't help but feel this makes you a target, though. Oh well. Your damage is now ${player.tank.damage}`);
                  game.log(`${player}'s damage has increased to ${player.tank.damage}`, 'playerEvent');
                }
              });
            })
          } else {
            if(player.ap >= 3) {
              interaction.reply({ content: 'Upgrading your damage will cost you 3 AP.', ephemeral });
              confirm.call(interaction.channel, 'Is this ok?').then(result => {
                if(result) {
                  player.tank.damage += 0.5 * this.potency;
                  interaction.channel.send(`Your damage has been upgraded to ${player.tank.damage}`);
                  game.log('A player has upgraded their Damage.', 'playerEvent');
                }
              });
            } else {
              interaction.reply('Sorry, but you need 3 AP to perform this action.');
            }
          }
          break;
        case 'hearts':
          interaction.reply({ content: 'You want me to upgrade... your Hearts? No, I don\' think I can do that.', ephemeral });
          break;
      }
    }
  }
}