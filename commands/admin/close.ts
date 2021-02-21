import { Command } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import { MESSAGES } from '../../utils/constants';
import { onTicketDelete } from '../../handlers/reportChannels';
import { Logger } from 'tslog';
import { HGuild } from '../../utils/classes/HGuild';
import { HMessage } from '../../utils/classes/HMessage';

const logger = new Logger({ displayFunctionName: false });

export default class DelRep extends Command {
    public constructor() {
        super('close', {
            aliases: [ 'close' ],
            description: {
                content: MESSAGES.COMMANDS.CLOSE.DESCRIPTION,
                usage: '[reason]',
                examples: [ '', 'Handled' ] // TODO: check-up: unsure if String.empty is valid here, probably not
            },
            category: 'staff',
            channel: 'guild',
            args: [
                {
                    id: 'reason',
                    type: 'string',
                    match: 'content',
                    default: ''
                }
            ],
            userPermissions: [ 'KICK_MEMBERS' ]
        });
    }

    public async exec(message: HMessage, { reason }: { reason: string }) {
        if (!(message.channel instanceof TextChannel)) {
            return;
        }

        const channel = message.channel;
        const guild = new HGuild(message.guild);
        if (channel.parent.id === guild.Tickets?.Category.id) {
            const logs = guild.Tickets?.Logging;
            if (channel.id !== logs.id && channel.id !== '686624525911195748') {
                await channel.send(`<@!${message.author.id}>, deleting this channel upon request.`);

                try {
                    onTicketDelete(channel, message, reason);
                    await channel.delete(`User ${message.author.username}#${message.author.discriminator} deleted report with ID ${channel.id}`);
                } catch (e) {
                    logger.error(`Something went wrong when deleting channel. Stack: ${e}`);
                    return;
                }
            }
        }
        return message.reply('that is not a valid report.');
    }
}
