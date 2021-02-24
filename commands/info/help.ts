import { Command, PrefixSupplier } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { HMessage } from '../../utils/classes/HMessage';
import { MESSAGES } from '../../utils/constants';

export default class HelpCommand extends Command {
    public constructor() {
        super('help', {
            aliases: [ 'help' ],
            description: {
                content: MESSAGES.COMMANDS.HELP.DESCRIPTION,
                usage: '[command]'
            },
            category: 'info',
            clientPermissions: [ 'EMBED_LINKS' ],
            args: [
                {
                    id: 'command',
                    type: 'commandAlias'
                }
            ]
        });
    }

    public async exec(message: HMessage, { command }: { command: Command }) {
        const prefix = (this.handler.prefix as PrefixSupplier)(message);
        const embed = new MessageEmbed()
        if (!command) {
            embed
                .setColor(3447003)
                .addField('❯ Commands', MESSAGES.COMMANDS.HELP.REPLY(prefix));

            for (const category of this.handler.categories.values()) {
                const allowedCmds: string[] = [];
                const filteredCats = category.filter(cmd => cmd.aliases.length > 0);

                for (const cmd of filteredCats.values()) {
                    if (!cmd.userPermissions ||
                        (Array.isArray(cmd.userPermissions) && cmd.userPermissions.find(permission => message.member.permissions.has(permission))) ||
                        await cmd.handler.runPermissionChecks(message, cmd)
                    ) {
                        allowedCmds.push(`\`${cmd.aliases[0]}\``);
                    }
                }

                if (allowedCmds.length)
                    embed.addField(
                        `❯ ${category.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`,
                        allowedCmds.join(' '));
            }

            return message.util?.send(embed);
        }

        embed
            .setColor(3447003)
            .setTitle(`\`${command.aliases[0]} ${command.description.usage ?? ''}\``)
            .addField('❯ Description', command.description.content ?? '\u200b');

        if (command.aliases.length > 1) embed.addField('❯ Aliases', `\`${command.aliases.join('` `')}\``, true);
        if (command.description.examples?.length)
            embed.addField(
                '❯ Examples',
                `\`${command.aliases[0]} ${command.description.examples.join(`\`\n\`${command.aliases[0]} `)}\``,
                true
            );

        return message.util?.send(embed);
    }
}