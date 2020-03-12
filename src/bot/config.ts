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
        logs: '687441523972767785',
        category: '686624560086253646',
        newEmbed: {
            color: '#0B71A6'
        },
        deleteEmbed: {
            color: '#CA9148'
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