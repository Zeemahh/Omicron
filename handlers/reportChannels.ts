import { getTicketLogsChannel, getTicketCategory, getSettingsForCurrentGuild } from '../config';
import { GuildChannel, TextChannel, MessageEmbed, Message, ColorResolvable, EmbedField } from 'discord.js';
import { embedAuthIcon, embedFooter } from '../utils/functions';
import { CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';

interface IReportChannelInterface {
    [key: string]: {
        logged: boolean;
    };
}

const tickets: IReportChannelInterface = {};

export const onTicketCreate = (channel: TextChannel, message: CommandoMessage, reason: string) => {
    if (tickets[channel.id] === undefined) {
        tickets[channel.id] = {
            logged: false
        };
    }

    if (!tickets[channel.id].logged) {
        tickets[channel.id].logged = true;

        const logChannel = getTicketLogsChannel(message.guild);
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

        if (reason !== '') {
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

export const onTicketDelete = (channel: TextChannel, message: CommandoMessage, reason: string) => {
    if (tickets[channel.id] !== undefined && tickets[channel.id].logged) {
        const logChannel: GuildChannel = getTicketLogsChannel(message.guild);
        const currentSettings = getSettingsForCurrentGuild(message.guild);
        const fields: EmbedField[] = [
            {
                name: 'Admin',
                value: `${message.author.tag} (${message.author.id})`,
                inline: false
            }
        ];

        if (reason !== '') {
            fields.push({
                name: 'Reason',
                value: reason,
                inline: false
            });
        }

        logReportEmbed(logChannel,
            'Report Closed',
            currentSettings.tickets.deleteEmbed.color ?? '#D99621',
            null,
            fields,
            true
        );
    }
};

export const onTicketCopy = (rMessage: Message, message: CommandoMessage) => {
    if (rMessage.channel instanceof TextChannel && rMessage.channel.parent.id === getTicketCategory(message.guild)?.id) {
        const logChannel: GuildChannel = getTicketLogsChannel(message.guild);
        const fields: EmbedField[] = [];
        let description = `**Report details for report initiated by ${rMessage.author.tag} on ${moment(rMessage.createdAt).format('ddd, MMM D, YYYY H:mm A')}**`;

        if (rMessage.content !== '') {
            description += `\n\n\`\`\`\n${message.content}\`\`\``;
        }

        if (rMessage.attachments.size > 0) {
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
