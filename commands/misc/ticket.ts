import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { timeLog } from '../../utils/functions';
import { stripIndents } from 'common-tags';
import { getInitTicketChannel, getTicketCategory, getTicketMessageContent } from '../../config';
import { MESSAGES } from '../../utils/constants';
import { onTicketCreate } from '../../handlers/reportChannels';

export default class Report extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'ticket',
            group: 'misc',
            aliases: [ 'new' ],
            memberName: 'ticket',
            description: MESSAGES.COMMANDS.TICKET.DESCRIPTION,
            args: [
                {
                    key: 'reason',
                    prompt: 'A short description for you ticket.',
                    type: 'string',
                    default: ''
                }
            ],
            examples: [
                `${client.commandPrefix}ticket I'd like to internally discuss something.`
            ]
        });
    }

    public async run(message: CommandoMessage, { reason }: { reason: string }) {
        const ticketCategory = getTicketCategory(message.guild);
        if (!ticketCategory) {
            timeLog('Could not find ticket category, therefore, I cannot create new tickets.');
            return undefined;
        }

        if (message.channel.id !== getInitTicketChannel(message.guild).id) {
            return undefined;
        }

        const messageContent = getTicketMessageContent(message.guild);

        let ticketChannel = await message.guild.channels.create(`${message.author.username}-${message.author.discriminator}_ticket`, {
            parent: ticketCategory
        });

        ticketChannel = await ticketChannel.lockPermissions();
        ticketChannel.updateOverwrite(message.author, {
            VIEW_CHANNEL: true
        });

        if (messageContent) {
            ticketChannel.send(stripIndents(messageContent));
        }

        ticketChannel.send(`<@${message.author.id}>, use this channel to communicate.`);

        onTicketCreate(ticketChannel, message, reason);

        return message.delete();
    }
}
