import { Command } from 'discord-akairo';
import { CategoryChannel, GuildChannel, TextChannel } from 'discord.js';
import { MESSAGES } from '../../utils/constants';
import { onTicketCopy } from '../../handlers/reportChannels';
import { HGuild } from '../../utils/classes/HGuild';
import { HMessage } from '../../utils/classes/HMessage';

export default class Copy extends Command {
    public constructor() {
        super('copy', {
            aliases: [ 'copy', 'rcopy', 'rcop' ],
            description: {
                content: MESSAGES.COMMANDS.COPY.DESCRIPTION,
                usage: '<msg>',
                examples: [ '800878081974992916' ]
            },
            category: 'staff',
            channel: 'guild',
            args: [
                {
                    id: 'msg',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.COPY.PROMPT.START(message.author)
                    },
                    type: 'message'
                }
            ],
            userPermissions: [ 'KICK_MEMBERS' ],
        });
    }

    public exec(message: HMessage, { msg }: { msg: HMessage }) {
        const guild = new HGuild(message.guild);
        const logsChannel = guild.Tickets?.Logging;
        if (msg instanceof CategoryChannel || !(msg.channel instanceof GuildChannel) || (msg.channel.parent.id !== guild.Tickets?.Category.id)) {
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
