import { Command } from 'discord-akairo';
import { timeLog } from '../../utils/functions';
import { stripIndents } from 'common-tags';
import { MESSAGES } from '../../utils/constants';
import { onTicketCreate } from '../../handlers/reportChannels';
import { HGuild } from '../../utils/classes/HGuild';
import { HMessage } from '../../utils/classes/HMessage';

export default class Report extends Command {
    // constructor(client: CommandoClient) {
    //     super(client, {
    //         name: 'ticket',
    //         group: 'misc',
    //         aliases: [ 'new' ],
    //         memberName: 'ticket',
    //         description: MESSAGES.COMMANDS.TICKET.DESCRIPTION,
    //         args: [
    //             {
    //                 key: 'reason',
    //                 prompt: 'A short description for you ticket.',
    //                 type: 'string',
    //                 default: ''
    //             }
    //         ],
    //         examples: [
    //             `${client.commandPrefix}ticket I'd like to internally discuss something.`
    //         ]
    //     });
    // }

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
            timeLog('Could not find ticket category, therefore, I cannot create new tickets.');
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
