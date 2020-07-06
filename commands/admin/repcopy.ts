import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, CategoryChannel, GuildChannel, TextChannel } from 'discord.js';
import { getTicketCategory, getTicketLogsChannel } from '../../config';
import { MESSAGES } from '../../utils/constants';
import { onTicketCopy } from '../../handlers/reportChannels';

export default class Copy extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'copy',
            group: 'admin',
            aliases: [ 'rcopy', 'rcop' ],
            memberName: 'repcopy',
            description: MESSAGES.COMMANDS.COPY.DESCRIPTION,
            args: [
                {
                    key: 'msg',
                    prompt: 'The message you want to copy.',
                    type: 'message'
                }
            ],
            userPermissions: [ 'KICK_MEMBERS' ],
            examples: [
                `${client.commandPrefix}repcopy 691446412419923968`
            ]
        });
    }

    public run(message: CommandoMessage, { msg }: { msg: Message }) {
        const logsChannel = getTicketLogsChannel(message.guild);
        if (msg instanceof CategoryChannel || !(msg.channel instanceof GuildChannel) || (msg.channel.parent.id !== getTicketCategory(message.guild)?.id)) {
            return message.reply('that is an invalid ticket message.');
        }

        if (logsChannel === undefined || !(logsChannel instanceof TextChannel)) {
            return message.reply('could not find ticket category for this guild, please report this.');
        }

        if (msg.author.bot) {
            return message.reply('please copy a message ID from an actual user, not a bot.');
        }

        onTicketCopy(msg, message);
        return message.delete();
    }
}
