import { GuildChannel, TextChannel, MessageEmbed, Message, ColorResolvable, EmbedField } from 'discord.js';
import { embedAuthIcon, embedFooter } from '../utils/functions';
import { TIME_FORMAT } from '../utils/constants';
import { HMessage } from '../utils/classes/HMessage';
import * as moment from 'moment';
import { HGuild } from '../utils/classes/HGuild';

interface IReportChannelInterface {
    [key: string]: {
        logged: boolean;
    };
}

const tickets: IReportChannelInterface = {};

export const onTicketCreate = (channel: TextChannel, message: HMessage, reason: string) => {
    if (tickets[channel.id] === undefined) {
        tickets[channel.id] = {
            logged: false
        };
    }

    if (!tickets[channel.id].logged) {
        tickets[channel.id].logged = true;

        const guild = new HGuild(message.guild);
        const logChannel = guild.Tickets?.Logging;
        const fields: EmbedField[] = [
            {
                name: 'Initiator',
                value: `${message.author.tag}`,
                inline: true
            },
            {
                name: 'Channel Name',
                value: `#${channel.name} (<#${channel.id}>)`,
                inline: true
            }
        ];

        if (reason) {
            fields.push({
                name: 'Reason',
                value: reason,
                inline: true
            });
        }

        logReportEmbed(logChannel,
            `New Ticket [${message.author.username}]`,
            '#0B71A6',
            null,
            fields,
            true
        );
    }
};

export const onTicketDelete = (channel: TextChannel, message: HMessage, reason: string) => {
    if (tickets[channel.id] !== undefined && tickets[channel.id].logged) {
        const guild = new HGuild(channel.guild);
        const logChannel: GuildChannel = guild.Tickets?.Logging;
        const fields: EmbedField[] = [
            {
                name: 'Admin',
                value: `${message.author.tag} (${message.author.id})`,
                inline: false
            }
        ];

        if (reason) {
            fields.push({
                name: 'Reason',
                value: reason,
                inline: false
            });
        }

        logReportEmbed(logChannel,
            'Report Closed',
            guild.Settings.tickets.deleteEmbed.color ?? '#D99621',
            null,
            fields,
            true
        );
    }
};

export const onTicketCopy = (rMessage: Message, message: HMessage) => {
    const guild = new HGuild(message.guild);
    if (rMessage.channel instanceof TextChannel && rMessage.channel.parent.id === guild.Tickets?.Category.id) {
        const logChannel: GuildChannel = guild.Tickets?.Logging;
        const fields: EmbedField[] = [];
        let description = `**Report details for report initiated by ${rMessage.author.tag} on ${moment(rMessage.createdAt).format(TIME_FORMAT)}**`;

        if (rMessage.content !== '') {
            description += `\n\n\`\`\`\n${message.content}\`\`\``;
        }

        if (rMessage.attachments.size) {
            fields.push({
                name: 'Attachments',
                value: rMessage.attachments.map(a => a.url).join(', '),
                inline: false
            });
        }

        logReportEmbed(logChannel,
            'Ticket Copy',
            '#FFF000',
            description,
            fields,
            true
        );
    }
};

/**
 * Sends a constructed embed for logging reports
 *
 * @param channel The channel which the report belongs to
 * @param author The author of the report
 * @param color The color of the embed
 * @param description Any additional information
 * @param fields Any fields
 * @param setFooter Set the footer to the standard footer?
 */
const logReportEmbed = (
    channel: GuildChannel,
    author: any,
    color: ColorResolvable,
    description?: any,
    fields?: EmbedField[],
    setFooter: boolean = false
): Promise<Message> => {
    const embed: MessageEmbed = new MessageEmbed()
        .setAuthor(author, embedAuthIcon)
        .setColor(color);

    if (setFooter) {
        embed.setFooter(embedFooter);
    }

    if (description) {
        embed.setDescription(description);
    }

    if (fields && fields.length > 0) {
        embed.fields = fields;
    }

    if (channel instanceof TextChannel) {
        return channel.send(embed);
    }
};
