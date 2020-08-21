import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TextChannel } from 'discord.js';
import { getTicketLogsChannel, getTicketCategory } from '../../config';
import { MESSAGES } from '../../utils/constants';
import { onTicketDelete } from '../../handlers/reportChannels';
import { LogGate, timeLog } from '../../utils/functions';

export default class DelRep extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'close',
            group: 'admin',
            memberName: 'close',
            description: MESSAGES.COMMANDS.CLOSE.DESCRIPTION,
            args: [
                {
                    key: 'reason',
                    prompt: 'Why are you deleting?',
                    type: 'string',
                    default: ''
                }
            ],
            userPermissions: [ 'KICK_MEMBERS' ],
            examples: [
                `${client.commandPrefix}close Handled.`
            ]
        });
    }

    public async run(message: CommandoMessage, { reason }: { reason: string }) {
        if (!(message.channel instanceof TextChannel)) {
            return;
        }

        const channel = message.channel;
        if (channel.parent.id === getTicketCategory(message.guild).id) {
            if (channel.id !== getTicketLogsChannel(message.guild).id && channel.id !== '686624525911195748') {
                await channel.send(`<@!${message.author.id}>, deleting this channel upon request.`);

                try {
                    onTicketDelete(channel, message, reason);
                    await channel.delete(`User ${message.author.username}#${message.author.discriminator} deleted report with ID ${channel.id}`);
                } catch (e) {
                    timeLog(`Something went wrong when deleting channel. E: ${e}`, LogGate.Development);
                    return;
                }
            }
        }
        return message.reply('that is not a valid report.');
    }
}
