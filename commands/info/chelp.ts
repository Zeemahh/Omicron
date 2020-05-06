import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, Message } from 'discord.js';
import { stripIndents } from 'common-tags';
import { MESSAGES } from '../../utils/constants';

export default class CommandHelp extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'chelp',
            group: 'information',
            aliases: [ 'command', 'cmd' ],
            memberName: 'chelp',
            description: MESSAGES.COMMANDS.C_HELP.DESCRIPTION,
            args: [
                {
                    key: 'command',
                    type: 'string',
                    prompt: 'What command would you like to show information for?'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { command }: { command: string }) {
        let fCommand: Command;
        const noFound = 'I could not find any command matching your search.';
        this.client.registry.findCommands(command, false, message).forEach(cmd => {
            if (cmd.name === command || cmd.aliases.includes(command)) {
                fCommand = cmd;
            }
        });

        if (!fCommand || !fCommand.isUsable(<any> message)) {
            return message.reply(noFound);
        }

        let description = `**Description:** ${fCommand.description}`;
        if (fCommand.aliases && fCommand.aliases.length > 0) {
            description += `\n**Aliases:**\n${fCommand.aliases.map(a => `\`${a}\``).join('\n')}`;
        }

        if (fCommand.examples && fCommand.examples.length > 0) {
            description += `\n**Examples:**\n${fCommand.examples.join('\n')}`;
        }

        const embed = new MessageEmbed()
            .setTitle(`Command: ${this.client.commandPrefix}${fCommand.name}`)
            .setDescription(stripIndents(description));

        return message.reply(embed);
    }
}
