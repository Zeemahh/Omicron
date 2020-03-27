import { client } from '../bot';
import { getReportLogsChannel, settings, getReportCategory } from '../config';
import { GuildChannel, TextChannel, MessageEmbed, Message, ColorResolvable, EmbedField } from 'discord.js';
import { embedAuthIcon, embedFooter } from '../utils/functions';
import { CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';

interface ReportChannelInterface {
    [key: string]: {
        logged: boolean;
    };
}

const rChannels: ReportChannelInterface = {};

client.on('onReportChannelReceive', (channel: TextChannel, message: CommandoMessage, reason: string) => {
    if (rChannels[channel.id] === undefined) {
        rChannels[channel.id] = {
            logged: false
        };
    }

    if (!rChannels[channel.id].logged) {
        rChannels[channel.id].logged = true;

        const logChannel = getReportLogsChannel(message.guild);
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
            'Incomine Offline Player Report',
            '#0B71A6',
            null,
            fields,
            true
        );
    }
});

client.on('onReportChannelDelete', (channel: TextChannel, message: CommandoMessage, reason: string) => {
    if (rChannels[channel.id] !== undefined && rChannels[channel.id].logged) {
        const logChannel: GuildChannel = getReportLogsChannel(message.guild);
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
            'Closed Report',
            settings.playerReports.deleteEmbed.color,
            null,
            fields,
            true
        );
    }
});

client.on('onReportCopy', (rMessage: Message, message: CommandoMessage) => {
    if (rMessage.channel instanceof TextChannel && rMessage.channel.parent.id === getReportCategory(message.guild)?.id) {
        const logChannel: GuildChannel = getReportLogsChannel(message.guild);
        const fields: EmbedField[] = [];

        if (rMessage.attachments.size > 0) {
            fields.push({
                name: 'Attachments',
                value: rMessage.attachments.map(a => a.url).join(', '),
                inline: false
            });
        }

        logReportEmbed(logChannel,
            'Offline Player Report Tracker',
            '#FFF000',
            `**Report details for report initiated by ${rMessage.author.tag} on ${moment(rMessage.createdAt).format('ddd, MMM D, YYYY H:mm A')}**\n\n\`\`\`\n${rMessage.content}\`\`\``,
            fields,
            true
        );
    }
});

function logReportEmbed(channel: GuildChannel, author: any, color: ColorResolvable, description?: any, fields?: EmbedField[], setFooter: boolean = false): Promise<Message> {
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
}
