import { Command } from 'discord-akairo';
import { Logger } from 'tslog';
import { stripIndents } from 'common-tags';
import { MESSAGES } from '../../utils/constants';
import { onTicketCreate } from '../../handlers/reportChannels';
import { HGuild } from '../../utils/classes/HGuild';
import { HMessage } from '../../utils/classes/HMessage';

const logger = new Logger({ name: '/ticket', displayFunctionName: false, displayFilePath: 'hidden' });

export default class Report extends Command {
    public constructor() {
        super('ticket', {
            aliases: [ 'ticket', 'new' ],
            description: {
                content: MESSAGES.COMMANDS.TICKET.DESCRIPTION,
                usage: '[reason]',
                examples: [ '', 'I\'d like to internally discuss something.' ]
            },
            category: 'misc',
            channel: 'guild',
            args: [
                {
                    id: 'reason',
                    type: 'string',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.TICKET.PROMPT.START(message.author)
                    },
                    default: '',
                    match: 'content'
                }
            ]
        });
    }

    public async exec(message: HMessage, { reason }: { reason: string }) {
        const guild = new HGuild(message.guild);
        const ticketCategory = guild.Tickets?.Category;
        if (!ticketCategory) {
            logger.error('Could not find ticket category, therefore, I cannot create new tickets.');
            return undefined;
        }

        if (message.channel.id !== guild.Tickets?.InitChannel.id) {
            return undefined;
        }

        const messageContent = guild.Tickets?.MessageContent;

        let ticketChannel = await message.guild.channels.create(`${message.author.username}-${message.author.discriminator}_ticket`, {
            parent: ticketCategory
        });

        ticketChannel = await ticketChannel.lockPermissions();
        await ticketChannel.updateOverwrite(message.author, {
            VIEW_CHANNEL: true
        });

        if (messageContent) {
            await ticketChannel.send(stripIndents(messageContent));
        }

        await ticketChannel.send(`<@${message.author.id}>, use this channel to communicate.`);

        onTicketCreate(ticketChannel, message, reason);

        return message.delete();
    }
}
