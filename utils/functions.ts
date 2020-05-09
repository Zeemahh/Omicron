import { Role, Guild, Channel, GuildMember, GuildChannel, Snowflake } from 'discord.js';
import { client } from '../bot';
import { HSG_AUTHS } from './constants';

/**
 * Converts a boolean to a string value, useful for user interactive things
 * @param bool The boolean you wish convert to string.
 * @return 'Yes' if boolean is truth-y, 'No' if boolean is false-y
 *
 * @example
 *
 *      convertBoolToStrState(true); // 'Yes'
 *      convertBoolToStrState(1); // 'Yes'
 */
export function convertBoolToStrState(bool: boolean): string {
    return bool && typeof bool === 'boolean' ? 'Yes' : 'No';
}

/**
 * Converts decimal to hex
 *
 * @return Hexadecimal
 *
 * @example
 *
 *      convertDecToHex(16711680); // 'FF0000'
 */
export function convertDecToHex(decimal: number): string {
    return decimal.toString(16);
}

/**
 * Converts hex to decimal
 *
 * @return Decimal
 *
 * @example
 *
 *      convertHexToDec('#d91e18'); // 14229016
 */
export function convertHexToDec(hex: string): number {
    return parseInt(hex, 16);
}

/**
 * Cleans the string of any carets, tilde colors (e.g. \~r\~) and HTML tags (<FONT COLOR='#D9E18'>D</FONT>)
 *
 * @param str The initial string.
 *
 * @example
 *
 *      FiveMSantize('~r~cool rp serber name, <font></font>'); // 'rcool rp serber name, font/font
 */
export function fivemSantize(str: string): string {
    return str.replace(
        /(>|<|~[a-zA-Z]~|\^[0-9])/g,
        ''
    );
}

/**
 * Prefixes current time (hh:mm:ss) as well as a message to a log printed to `stdout`
 *
 * @param message Message you wish to log
 */
export function timeLog(message: string, condition: boolean = true): void {
    if (!condition) {
        return;
    }

    const currentTime: Date = new Date();
    let hour: string = currentTime.getHours().toString();
    let min: string = currentTime.getMinutes().toString();
    let sec: string = currentTime.getSeconds().toString();

    if (currentTime.getHours() < 10) {
        hour = '0' + hour;
    }

    if (currentTime.getMinutes() < 10) {
        min = '0' + min;
    }

    if (currentTime.getSeconds() < 10) {
        sec = '0' + sec;
    }

    return console.log(`[${hour}:${min}:${sec}]`.bgMagenta.yellow + ` ${message}`);
}

/**
 * Gets an environmental variable, if undefined it returns the second param
 *
 * @param variable Variable name.
 * @param defaultVal Default value if value is undefined.
 */
export function getEnvironmentVariable(variable: string, defaultVal: string): string {
    return process.env[variable] ?? defaultVal;
}

/**
 * Capitalises any given string.
 *
 * @param initStr Upper or lower case string.
 */
export function capitalize(initStr: string): string {
    return initStr.charAt(0).toUpperCase() + initStr.slice(1);
}

/**
 * FiveM player data structure
 */
export interface IPlayerDataStruct {
    /**
     * The player name
     */
    name: string;

    /**
     * The server ID of the user
     */
    id: number;

    /**
     * String array of the player's identifiers
     */
    identifiers: string[];

    /**
     * Player's ping to server
     */
    ping: number;
}

/**
 * Returns boolean and string.
 *
 * @param acr Takes server var property 'gametype'
 * @returns An array with 1st index being is server HSG server, 2nd index being auth level name if index 1 is not false, else `null`.
 *
 * @example
 *  getAuthLevelByAcronym('HSG-RP | Authorization CU'); // [true, 'Casual Unrestricted']
 *  getAuthLevelByAcronym('fivem'); // [false, null]
 */
export function getAuthLevelByAcronym(acr: string): [
    boolean, string | null
] {
    let shortAuth: string;

    if (acr.includes('Authorization')) {
        shortAuth = acr.replace('HSG-RP | Authorization ', '');
    }

    return HSG_AUTHS[shortAuth] ? [ true, HSG_AUTHS[shortAuth] ] : [ false, null ];
}

/**
 * Structure for FiveM server data returned from ip:port/dynamic.json
 *
 * @example
 * {
 *      "clients": 21,
 *      "gametype": "fivem",
 *      "hostname": "meow",
 *      "iv": "981675851",
 *      "mapname": "fivem-map-skater",
 *      "sv_maxclients": "32"
 * }
 */
export interface IServerDataStruct {
    /**
     * Returns total amount of clients on the server.
     */
    clients: number;

    /**
     * Returns current game type.
     */
    gametype: string;

    /**
     * Returns name of the server.
     */
    hostname: string;

    /**
     * Returns version number.
     */
    iv: string;

    /**
     * Returns current map name.
     */
    mapname: string;

    /**
     * Returns maximum amount of clients.
     */
    sv_maxclients: string;
}

interface IEndPointKeys {
    URL: string;
    Protocol?: string;
}

/**
 * Interface used for EndPoints within the community, contains a URL and a protocol (i.e. fivem:// protocol for FiveM
 * direct connect, or ts3server:// for TS3 direct connect.)
 */
interface IEndPoint {
    [key: string]: IEndPointKeys | {
        URL: string,
        s1Port: string,
        s2Port: string,
        dvPort?: string
    };

    /**
     * TeamSpeak3 EndPoint Information
     */
    teamSpeak: IEndPointKeys;

    /**
     * FiveM Server EndPoint Information
     */
    fiveM: {
        URL: string,
        Protocol: string,
        s1Port: string,
        s2Port: string,
        dvPort?: string
    };

    /**
     * Website EndPoint Information
     */
    website: IEndPointKeys;
}

export const endPoints: IEndPoint = {
    teamSpeak: {
        URL: 'ts3.highspeed-gaming.com',
        Protocol: 'ts3server'
    },
    fiveM: {
        URL: 'fivem.highspeed-gaming.com',
        Protocol: 'fivem',
        s1Port: '704',
        s2Port: '7045',
        dvPort: '7272'
    },
    website: {
        URL: 'highspeed-gaming.com',
        Protocol: 'http'
    }
};

/**
 * Cleans the user's name.
 */
export function cleanUsername(username: string): string {
    return '';
}

/**
 * Returns true if `BUILD` env variable is set to 'dev'
 */
export function isDevelopmentBuild(): boolean {
    return (process.env.BUILD && process.env.BUILD === 'dev');
}

/**
 *  Checks if a value is present in an array.
 *
 * @param array An array of T.
 * @param value Any value.
 *
 * @example
 *  const arr: string[] = [
 *      'sup',
 *      'no',
 *      'yes'
 *  ]
 *  doesArrayHaveElement(arr, 'definitely'); // false
 *  doesArrayHaveElement(arr, 'yes'); // true
 */
export function doesArrayHaveElement(array: any[], value: any): boolean {
    return array.find(i => i.toString().toLowerCase() === value.toString().toLowerCase()) !== undefined;
}

/**
 * Checks if X is present in the current guild, where X is a channel, role or guild member.
 *
 * @param ctx A channel, role or guild member
 * @param guild A guild object
 */
export function doesXExistOnGuild(ctx: Channel|Role|GuildMember, guild: Guild): boolean {
    if (!guild.available) {
        return false;
    }

    if (ctx instanceof Channel) {
        return guild.channels.cache.get(ctx.id) !== undefined;
    }

    if (ctx instanceof Role) {
        return guild.roles.cache.get(ctx.id) !== undefined;
    }

    if (ctx instanceof GuildMember) {
        return guild.members.cache.get(ctx.id) !== undefined;
    }

    return false;
}

// global embed stuff
export const embedFooter = 'HighSpeed-Gaming FiveM 2020';

// has to be [n, n, n] as n[] isn't ColorResolvable
export const embedColor: [ number, number, number ] = [ 119, 0, 239 ];

export const embedAuthIcon = 'https://i.imgur.com/qTPd0ql.png';

export function getIndexFromValue(input: string, arr: any[]): any {
    for (const [ key, value ] of Object.values(arr)) {
        if (value === input) {
            return key;
        }
    }

    return false;
}

export function getBotTestingChannel(): GuildChannel {
    return <GuildChannel> client.channels.cache.get('521069746368806922') ?? undefined;
}

/**
 * Checks if this member can execute certain commands or can pass certain arguments to commands.
 *
 * @param member Guild member.
 */
export function isStaff(member: GuildMember): boolean {
    if (client.owners.find(o => o.id === member.id)) {
        return true;
    }

    if (member.roles.cache.find(r => r.id === '625068930485977138' || r.id === '519344613102714890')) {
        return true;
    }

    return false;
}

/**
 * Regex for Discord message URL. Used in message handler & message ref checker
 */
export const urlRegex = /https:\/\/((canary|ptb).)?discordapp.com\/channels\/(\d{18})\/(\d{18})\/(\d{18})/g;

export interface IMessageStruct {
    id: Snowflake;
    channel_id: Snowflake;
    guild_id?: Snowflake;
    author: {
        id: Snowflake;
        username: string;
        avatar: string;
        discriminator: string;
        public_flags: number;
    };
    type: number;
    content: string;
    attachments: {
        id: Snowflake;
        filename: string;
        size: number;
        url: string;
        proxy_url: string;
        width: number;
        height: number;
    }[];
    embeds: {
        title?: string;
        type?: string;
        description?: string;
        url?: string;
        timestamp?: Date;
        color?: number;
        footer?: {
            text: string;
            icon_url?: string;
            proxy_icon_url?: string;
        };
        image?: {
            url?: string;
            proxy_url?: string;
            height?: number;
            width?: number;
        };
        thumbnail?: {
            url?: string;
            proxy_url?: string;
            height?: number;
            width?: number;
        };
        video?: {
            id: Snowflake;
            filename: string;
            size: number;
            url: string;
            proxy_url: string;
            height?: number;
            widgh?: number;
        };
        provider?: {
            name?: string;
            url?: string;
        };
        author?: {
            name?: string;
            url?: string;
            icon_url?: string;
            proxy_icon_url?: string;
        };
        fields?: {
            name: string;
            value: string;
            inline?: boolean;
        }[];
    }[];
    mentions: string[];
    mention_roles: string[];
    pinned: boolean;
    mention_everyone: boolean;
    tts: boolean;
    timestamp: Date;
    edited_timestamp: Date | null;
    flags: number;
    reactions: {
        emoji: {
            id: Snowflake;
            name: string;
        };
        count: number;
        me: boolean;
    }[];
}
