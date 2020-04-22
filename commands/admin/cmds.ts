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

    public run(message: CommandoMessage, { cmd }: { cmd: string }) {
        const commands = this.client.registry.commands;

        const embed = new MessageEmbed()
            .setAuthor(`Available commands in ${message.guild}`, embedAuthIcon)
            .setDescription(`All of these commands can be executed through \`${message.guild.commandPrefix}<command> [arguments]\``);

        commands.forEach((commands: Command) => {
            if (commands.isUsable && commands.name !== this.name) {
                embed.addField(`${commands.name} ${commands.aliases.length > 0 ? `(${commands.aliases.map(a => `\`${a}\``).join(', ')})` : ''}`, `${commands.description}`);
            }
        });

        return message.reply(embed);
    }
}
