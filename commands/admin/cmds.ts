import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { embedAuthIcon } from '../../utils/functions';
import { MESSAGES } from '../../utils/constants';

export default class Commands extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'cmds',
            group: 'admin',
            aliases: [ 'cmds', 'acmds' ],
            memberName: 'cmds',
            description: MESSAGES.COMMANDS.CMDS.DESCRIPTION,
            userPermissions: [ 'MANAGE_ROLES' ]
        });
    }

    public run(message: CommandoMessage, { cmd }: { cmd: string }) {
        const commands = this.client.registry.commands;

        const embed = new MessageEmbed()
            .setAuthor(`Available commands in ${message.guild}`, embedAuthIcon)
            .setDescription(`All of these commands can be executed through \`${message.guild.commandPrefix}<command> [arguments]\``);

        commands.forEach((command: Command) => {
            if (command.isUsable && command.name !== this.name) {
                embed.addField(`${command.name} ${command.aliases.length > 0 ? `(${command.aliases.map(a => `\`${a}\``).join(', ')})` : ''}`, `${command.description}`);
            }
        });

        return message.reply(embed);
    }
}
