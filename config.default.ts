import { ColorResolvable, GuildChannel, Guild, Channel, TextChannel, MessageEmbed, CategoryChannel } from 'discord.js';
import { doesXExistOnGuild, embedAuthIcon, getEnvironmentVariable, IHsgAuthLvl, hsgRoleMap, getAuthLvlFromAcronym } from './utils/functions';
import { client } from './bot';

interface IChannelCfg {
    guildId: string;
    channelId: string;
    msgContent?: string;
}

export interface ISettings {
    /**
     * Identifier for the setting, e.g. 'Setting for [guild]'
     */
    id: string;

    /**
     * The guild ID that these settings apply to.
     */
    guildId: string;

    /**
     * Information regarding the automatic server status updating.
     */
    autoStatus: {
        /**
         * Boolean determining whether to enable the automatic status updating.
         */
        logStatus: boolean;

        /**
         * How long to wait between each update/embed edit.
         */
        waitTime?: number;

        /**
         * A string[] for custom task response results to get posted.
         *
         * @deprecated Not used in this bot.
         */
        customTaskResponse?: string;

        /**
         * A string[] for the status channels.
         */
        statusChannels?: string[];
    };

    /**
     * Information regarding Offline Player Reporting.
     */
    tickets?: {
        /**
         * Where the logs will be posted.
         */
        logs: {
            channelId: string;
        };

        /**
         * The category for all new reports.
         */
        category: {
            channelId: string;
            msgContent?: string;
        };

        /**
         * The channel that the initial command can be entered in.
         */
        initChannel: {
            channelId: string;
        };

        /**
         * Embed color for the log embed for a new report.
         */
        newEmbed: {
            color: ColorResolvable;
        };

        /**
         * Embed color for the log embed for a deleted/handled report.
         */
        deleteEmbed: {
            color: ColorResolvable;
        };
    };
}

export const settings: ISettings[] = [
    {
        id: 'SETTINGS_IDENTIFIER',
        guildId: 'GUILD_ID',
        autoStatus: {
            logStatus: false
        }
    }
];

export const settingsUnused: {
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
        },
        initChannel: IChannelCfg[]
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
        initChannel: [
            {
                guildId: 'GUILD_ID',
                channelId: 'CHANNEL_ID_RELATIVE_TO_GUILD'
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

export function getTicketLogsChannel(guild: Guild): GuildChannel {
    for (const [ , val ] of Object.entries(settings)) {
        if (val.guildId === guild.id) {
            const reportLogs: Channel = guild.channels.cache.get(val.tickets.logs.channelId);
            if (doesXExistOnGuild(reportLogs, guild)) {
                return <GuildChannel> reportLogs;
            }
        }
    }

    return undefined;
}

export function getTicketCategory(guild: Guild): CategoryChannel {
    for (const [ , val ] of Object.entries(settings)) {
        if (val.guildId === guild.id) {
            const reportCategory: GuildChannel = guild.channels.cache.get(val.tickets.category.channelId);
            if (reportCategory instanceof CategoryChannel) {
                return <CategoryChannel> reportCategory;
            }
        }
    }

    return undefined;
}

export function getInitTicketChannel(guild: Guild): GuildChannel {
    for (const [ , val ] of Object.entries(settings)) {
        if (val.guildId === guild.id) {
            const initChannel: GuildChannel = guild.channels.cache.get(val.tickets.initChannel.channelId);
            if (doesXExistOnGuild(initChannel, guild)) {
                return initChannel;
            }
        }
    }

    return undefined;
}

export function getTicketMessageContent(guild: Guild): string {
    const currentSettings = getSettingsForCurrentGuild(guild);
    if (currentSettings && currentSettings.tickets) {
        return currentSettings.tickets.category?.msgContent;
    }

    return undefined;
}

export function getSettingsForCurrentGuild(guild: Guild): ISettings {
    for (const[ , val ] of Object.entries(settings)) {
        if (val.guildId === guild.id) {
            return val;
        }
    }

    return undefined;
}

export function collectAllStatusChannels(): string[] {
    const statusChannels: string[] = [];
    for (const [ , val ] of Object.entries(settings)) {
        if (val.autoStatus.logStatus && val.autoStatus.statusChannels) {
            statusChannels.concat(val.autoStatus.statusChannels);
        }
    }

    return statusChannels;
}

client.on('channelDelete', (channel) => {
    if (!(channel instanceof TextChannel)) {
        return;
    }

    if (channel.parent.id === getTicketCategory(channel.guild).id && channel.id !== getTicketLogsChannel(channel.guild).id) {
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

            const logs: GuildChannel = getTicketLogsChannel(channel.guild);
            if (logs instanceof TextChannel) {
                logs.send(embed);
                return;
            }
        }
    }
});

export const API_ENDPOINT = 'localhost:301';
export const API_TIMEOUT = 5000;

export function isLocalServer(): boolean {
    return API_ENDPOINT.substr(0, 'localhost'.length) === 'localhost';
}

export const ADMIN_KEY = '<< INSERT ADMIN KEY HERE >>';

export const API_KEYS: {
    [key: string]: {
        key: string;
    }
} = {
    GEEK_SQUAD: {
        key: 'blah'
    },

    GS: {
        key: 'blah'
    },

    A1: {
        key: 'blah'
    },

    A2: {
        key: 'blah'
    },

    A3: {
        key: 'blah'
    },

    AD: {
        key: 'blah'
    },

    DR: {
        key: ADMIN_KEY
    },

    DV: {
        key: ADMIN_KEY
    },

    CD: {
        key: ADMIN_KEY
    },
};

const API_WORKAROUND = true;
if (API_WORKAROUND) {
    for (const [ auth ] of Object.entries(API_KEYS)) {
        const currentRank = getAuthLvlFromAcronym(auth).rank;
        if (currentRank && currentRank >= hsgRoleMap.GS.rank) {
            API_KEYS[auth].key = ADMIN_KEY;
        }
    }
}

export function getApiKeyForAuth(authLvl: IHsgAuthLvl): string {
    for (const [ auth, data ] of Object.entries(hsgRoleMap)) {
        if (authLvl.rank === data.rank && API_KEYS[auth].key) {
            return API_KEYS[auth].key;
        }
    }

    return null;
}
