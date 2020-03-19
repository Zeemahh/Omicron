import { Role, Guild, Channel, GuildMember, Message, GuildChannel } from 'discord.js';
import { client } from '../bot';

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

    const current_time: Date = new Date();
    let hour: string = current_time.getHours().toString();
    let min: string = current_time.getMinutes().toString();
    let sec: string = current_time.getSeconds().toString();

    if (current_time.getHours() < 10) {
        hour = '0' + hour;
    }

    if (current_time.getMinutes() < 10) {
        min = '0' + min;
    }

    if (current_time.getSeconds() < 10) {
        sec = '0' + sec;
    }

    return console.log(`[${hour}:${min}:${sec}]`.red + ` ${message}`);
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
 * @param init_str Upper or lower case string.
 */
export function capitalize(init_str: string): string {
    return init_str.charAt(0).toUpperCase() + init_str.slice(1);
}

/**
 * An object where key is shortened auth level and value is full auth level name
 */
export const hsgAuths: {
    [key: string]: string
} = {
    CR: 'Casual Restricted',
    CU: 'Casual Unrestricted',
    M1: 'New Member',
    M2: 'Member',
    GS: 'General Staff',
    A1: 'Administrator',
    A2: 'Senior Administrator',
    A3: 'Lead Administrator',
    DV: 'Developer',
    CD: 'Chief of Development',
    DR: 'Director'
};

/**
 * FiveM player data structure
 */
export interface PlayerDataStruct {
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
 *  get_auth_level_by_acronym('HSG-RP | Authorization CU'); // [true, 'Casual Unrestricted']
 *  get_auth_level_by_acronym('fivem'); // [false, null]
 */
export function getAuthLevelByAcronym(acr: string): [
    boolean, string | null
] {
    let shortAuth: string;

    if (acr.includes('Authorization')) {
        shortAuth = acr.replace('HSG-RP | Authorization ', '');
    }

    return hsgAuths[shortAuth] ? [true, hsgAuths[shortAuth]] : [false, null];
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
export interface ServerDataStruct {
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

interface EndPointKeys {
    URL: string;
    Protocol?: string;
}

/**
 * Interface used for EndPoints within the community, contains a URL and a protocol (i.e. fivem:// protocol for FiveM
 * direct connect, or ts3server:// for TS3 direct connect.)
 */
interface EndPoint {
    [key: string]: EndPointKeys | {
        URL: string,
        s1Port: string,
        s2Port: string
    };

    /**
     * TeamSpeak3 EndPoint Information
     */
    teamSpeak: EndPointKeys;

    /**
     * FiveM Server EndPoint Information
     */
    fiveM: {
        URL: string,
        Protocol: string,
        s1Port: string,
        s2Port: string
    };

    /**
     * Website EndPoint Information
     */
    website: EndPointKeys;
}

export const endPoints: EndPoint = {
    teamSpeak: {
        URL: 'ts3.highspeed-gaming.com',
        Protocol: 'ts3server'
    },
    fiveM: {
        URL: 'fivem.highspeed-gaming.com',
        Protocol: 'fivem',
        s1Port: '704',
        s2Port: '7045'
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
    return array.find(i => i.toLowerCase() === value.toLowerCase()) !== undefined;
}

/**
 * Checks if X is present in the current guild, where X is a channel, role or guild member.
 *
 * @param ctx A channel, role or guild member
 * @param guild A guild object
 */
export function doesXExistOnGuild(ctx: Channel|Role|GuildMember, guild: Guild): boolean {
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
export const embedColor: [ number, number, number ] = [119, 0, 239];

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
    if (process.env.BUILD !== 'dev') {
        return undefined;
    }

    return client.channels.cache.get('521069746368806922') as GuildChannel ?? undefined;
}
