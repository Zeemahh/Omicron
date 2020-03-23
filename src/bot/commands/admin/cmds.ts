import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { embedAuthIcon } from '../../utils/functions';

export default class Commands extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'cmds',
            group: 'admin',
            aliases: ['cmds', 'acmds'],
            memberName: 'cmds',
            description: 'Shows all available admin commands.',
            userPermissions: ['MANAGE_ROLES']
        });
    }

    public run(message: CommandoMessage) {
        const commands = this.client.registry.commands;
        const info: Command[] = [];
        commands.forEach(command => {
            if (command.groupID === 'admin') {
                info.push(command);
            }
        });

        const embed = new MessageEmbed()
            .setAuthor(`Available commands in ${message.guild}`, embedAuthIcon)
            .setDescription(`All of these commands can be executed through \`${message.guild.commandPrefix}<command> [arguments]\``);

        info.forEach(i => {
            if (i.isUsable && i.name !== this.name) {
                embed.addField(`${i.name} ${i.aliases.length > 0 ? `(${i.aliases.map(a => `\`${a}\``).join(', ')})` : ''}`, `${i.description}${i.examples ? '\n\n**Examples:**\n' + i.examples : ''}`);
            }
        });

        return message.reply(embed);
    }
}
