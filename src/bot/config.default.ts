import { ColorResolvable, GuildChannel, Guild, Channel, TextChannel, MessageEmbed, CategoryChannel } from 'discord.js';
import { doesXExistOnGuild, embedAuthIcon, getEnvironmentVariable } from './utils/functions';
import { client } from './bot';

interface IChannelCfg {
    guildId: string;
    channelId: string;
}

export const settings: {
    logStatus: boolean,
    statusChannels: string[],
    customTaskResponse: string,
    waitTime: number,
    playerReports: {
        logs: IChannelCfg[],
        category: IChannelCfg[],
        newEmbed: {
            color: ColorResolvable
        },
        deleteEmbed: {
            color: ColorResolvable
        }
    }
} = {
    logStatus: getEnvironmentVariable('AUTO_STATUS', 'false') === 'true',
    statusChannels: [
        'CHANNEL_ID_HERE'
    ],
    customTaskResponse: 'CHANNEL_ID_HERE',
    waitTime: 5000,
    playerReports: {
        logs: [
            {
                guildId: 'GUILD_ID',
                channelId: 'CHANNEL_ID_RELATIVE_TO_GUILD'
            }
        ],
        category: [
            {
                guildId: 'GUILD_ID',
                channelId: 'CATEGORY_ID_RELATIVE_TO_GUILD'
            }
        ],
        newEmbed: {
            color: '#0B71A6'
        },
        deleteEmbed: {
            color: '#CA9148'
        }
    }
};

export function getReportLogsChannel(guild: Guild): GuildChannel {
    for (const [ _, val ] of Object.entries(settings.playerReports.logs)) {
        if (val.guildId === guild.id) {
            const reportLogs: Channel = guild.channels.cache.get(val.channelId);
            if (doesXExistOnGuild(reportLogs, guild)) {
                return reportLogs as GuildChannel;
            }
        }
    }

    return undefined;
}

export function getReportCategory(guild: Guild): CategoryChannel {
    for (const [ _, val ] of Object.entries(settings.playerReports.category)) {
        if (val.guildId === guild.id) {
            const reportCategory: GuildChannel = guild.channels.cache.get(val.channelId);
            if (reportCategory instanceof CategoryChannel) {
                return reportCategory as CategoryChannel;
            }
        }
    }

    return undefined;
}

client.on('channelDelete', (channel) => {
    if (!(channel instanceof TextChannel)) {
        return;
    }

    if (channel.parent.id === getReportCategory(channel.guild).id && channel.id !== getReportLogsChannel(channel.guild).id) {
        if (channel.messages.cache.size > 0 && channel.lastMessage?.author.id !== client.user.id) {
            const embed: MessageEmbed = new MessageEmbed()
                .setAuthor('Alert | Report Deletion', embedAuthIcon)
                .setColor('#FF4E00')
                .setDescription(`Channel \`#${channel.name}\` (${channel.id}) was unexpectedly deleted. The last message was not sent by the bot and therefore wasn't properly processed.`)
                .setTimestamp();

            if (channel.lastMessage !== null) {
                embed.addField('Last Message Author', channel.lastMessage.author.username);
                embed.addField('Last Message Content', channel.lastMessage.content);
            }

            const logs: GuildChannel = getReportLogsChannel(channel.guild);
            if (logs instanceof TextChannel) {
                logs.send(embed);
                return;
            }
        }
    }
});