import { ColorResolvable, GuildChannel, Guild, Channel } from "discord.js";
import { doesXExistOnGuild } from "./utils/functions";

export const settings: {
    playerReports: {
        logs: string,
        category: string,
        newEmbed: {
            color: ColorResolvable
        },
        deleteEmbed: {
            color: ColorResolvable
        }
    }
} = {
    playerReports: {
        logs: 'LOG_CHANNEL_ID',
        category: 'CATEGORY_ID',
        newEmbed: {
            color: 'A_COLOR'
        },
        deleteEmbed: {
            color: 'A_COLOR'
        }
    }
};

export function getReportLogsChannel(guild: Guild): GuildChannel {
    const reportLogs: Channel = guild.channels.cache.get(settings.playerReports.logs);
    if (doesXExistOnGuild(reportLogs, guild)) {
        return reportLogs as GuildChannel;
    }
    return undefined;
}