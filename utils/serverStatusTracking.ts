import { TextChannel, MessageEmbed, EmbedField, Channel, Message } from 'discord.js';
import { client } from '../bot';
import * as request from 'request';
import moment from 'moment';
import fetch from 'node-fetch';
import '../lib/env';
import { getAuthLevelByAcronym, embedAuthIcon, IPlayerDataExtensive, IPlayerDataStruct } from './functions';
import { Logger } from 'tslog';
import { collectAllStatusChannels, ADMIN_KEY } from '../config';

const logger = new Logger({ name: 'Status Tracking', displayFunctionName: false, displayFilePath: 'hidden' });

let serverQueryTime = 6000;
const offlineEmbed: {
    [key: string]: MessageEmbed
} = {};

let sentUpdated = false;

let useExtensiveData = false;

const isOffline = (channel: string): boolean => {
    if (!(playerData[channel] || serverData[channel])) {
        return true;
    }

    return !!offlineEmbed[channel];
};

const logResponseDetails = false;

export interface IDynamicData {
    clients: number;
    gametype: string;
    hostname: string;
    iv: string;
    mapname: string;
    sv_maxclients: string;
}

const SUCCESS_COLOR = '#28A35C';
const FAILURE_COLOR = '#CF3430';

export interface IServerData {
    enhancedHostSupport: boolean;
    icon: string;
    resources: string[];
    vars: {
        [key: string]: string;
    };
    banner_connecting: string;
    banner_detail: string;
    gamename: string;
    onesync_enabled: boolean;
    sv_enhancedHostSupport: boolean;
    sv_lan: boolean;
    sv_licenseKeyToken: boolean;
    sv_maxClients: number;
    sv_scriptHookAllowed: boolean;
    tags: string;
    version: number;
}

const serverData: any = {};
const playerData: {
    [key: string]: {
        reg?: IPlayerDataStruct[],
        extensive?: IPlayerDataExtensive[]
    }
} = {};

const getOfflineEmbed = (
    title: string = 'HighSpeed-Gaming Server 1',
    iconUrl: string = embedAuthIcon,
    footer: string = 'HighSpeed-Gaming 2020',
    img: string = 'https://i.imgur.com/aNO0fZX.png',
    port: string
): MessageEmbed => {
    const embed = new MessageEmbed()
        .setColor(FAILURE_COLOR)
        .setTitle(`Server Offline :(`)
        .setDescription(`Last checked at ${moment(Date.now()).format('h:mm:ss on MM/DD/YYYY')} (UTC)`)
        .setFooter(footer);

    if (port || (0 && title)) {
        let evaluatedServerName: string = 'HighSpeed-Gaming ';
        switch (port) {
            case '7272':
                evaluatedServerName += 'Development Server';
                break;
            case '7045':
                evaluatedServerName += 'Server 2';
                break;
            case '704':
            default:
                evaluatedServerName += 'Server 1';
                break;
        }

        embed.setAuthor(evaluatedServerName, iconUrl);
    }

    if (img) {
        embed.setImage(img);
    }

    return embed;
};

export class ServerStatus {
    /**
     * Returns true if something is missing from the data expected for the server.
     */
    public IsOffline: boolean = false;

    /**
     * The endpoint of the server.
     */
    private EndPoint: string;

    private readonly Channel: TextChannel;

    /**
     * An array containing all players.
     */
    private Players: IPlayerDataStruct[] | IPlayerDataExtensive[];

    private ServerData: {
        Static: object,
        Dynamic: object
    };

    /**
     * A
     * @param channelId The ID of the channel.
     */
    constructor(channelId: string) {
        const channel = client.channels.cache.get(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
            return;
        }

        const topicDelim = channel.topic.split(/ +\| +/);
        const [ IP ] = topicDelim;

        this.Channel = channel;
        this.EndPoint = IP;
    }

    public async BeginUpdates(): Promise<void> {
        if (!this.ShouldRun) {
            return void 0;
        }

        const path = `http://${this.EndPoint}/info.json`;
        const req = await fetch(path, {
            timeout: 4000
        });

        if (!req.ok) {
            return this.NullifyAllData();
        }
    }

    public async ShouldRun(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const req = await fetch(`http://${this.EndPoint}/info.json`, {
                timeout: 4000
            });

            if (!req.ok) {
                reject({ what: 'Bad request.' });
            }

            resolve(req.ok);
        });
    }

    /**
     * Returns a boolean depending on if the channel exists.
     */
    private get ChannelExists() {
        return !!this.Channel;
    }

    private async StatusEmbed(): Promise<MessageEmbed> {
        return new Promise(async (resolve, reject) => {
            if (!this.ChannelExists) {
                reject({ what: 'Channel does not exist.' });
            }

            try {
                const message = await this.GetStatusMessage();
                resolve(new MessageEmbed(message.embeds[0]));
            } catch (b) {
                reject(b.what);
            }
        });
    }

    private async GetStatusMessage(): Promise<Message> {
        return new Promise(async (resolve, reject) => {
            if (!this.ChannelExists) {
                reject({ what: 'Channel does not exist.' });
            }

            try {
                const allMessages = await this.Channel.messages.fetch();
                if (!allMessages.array().length) {
                    reject({ what: 'No messages to iterate through' });
                }

                for (const [ , message ] of allMessages) {
                    if (message.embeds.length) {
                        resolve(message);
                    }
                }

                reject({ what: 'No message had any embeds' });
            } catch (e) {
                reject({ what: e.toString() });
            }
        });
    }

    private get IsDataValid(): boolean {
        return !!this.Players &&
            !!this.ServerData.Dynamic &&
            !!this.ServerData.Static;
    }

    private NullifyAllData(): void {
        if (0 && this.StatusEmbed && this.IsDataValid) {
            process.exit(0);
        }

        this.ServerData = null;
        this.Players = null;
        this.EndPoint = null;
        this.IsOffline = true;
    }
}

const getServerInfoData: () => void = () => {
    // if no channels then no endpoints
    if (!collectAllStatusChannels().length) {
        return;
    }

    // iteration
    for (const channel of collectAllStatusChannels()) {
        let guildChannel: Channel;

        // get channel from client's channel collection
        guildChannel = client.channels.cache.find(ch => ch.id === channel);

        // if channel couldn't be found in collection, return
        if (!guildChannel || !(guildChannel instanceof TextChannel)) {
            return logger.error(`Could not find channel (${channel}) in bot\'s collection.`);
        }

        // if there is no topic, there is no endpoint, and no request
        if (!guildChannel.topic) {
            return logger.error('the channel had no topic');
        }

        const topicDelim = guildChannel.topic.split(/ +\| +/);
        const [ IP, serverName, iconUrl ] = topicDelim;

        // request for hostname and stuff with a timeout of 10000ms to stop hangs
        request.get(`http://${IP}/dynamic.json`, {
            timeout: 10000
        }, (err: Error, response: request.Response, body) => {
            if (logResponseDetails) {
                logger[!response ? 'error' : 'debug'](`GET request to http://${IP}/dynamic.json, got response code ${response?.statusCode ?? 'UNK'}.`);
            }

            if (err || response.statusCode === 404) {
                let footer = `${serverName} 2020`;
                if (serverData[channel] && serverData[channel].info && serverData[channel].info.server) {
                    footer = serverData[channel].info.server;
                }
                offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, footer, null, IP.split(':')[1]);
                logger.error(`There was an error with /dynamic.json request.`);
            }

            if (logResponseDetails) {
                logger.error(`isOffline state @ dynamic.json: ${isOffline(channel)}`);
            }

            if (!isOffline(channel)) {
                // /!\ IMPORTANT /!\
                // we must parse the data before we can begin to display it. if it cannot be
                // parsed, there is something wrong and we need to check it

                // also, this crashes app if it's not caught
                try {
                    serverData[channel].dynamic = JSON.parse(body);
                } catch (e) {
                    serverData[channel] = {};
                    logger.error(`Caught error when trying to parse dynamic.json response: ${e.toString()}`);
                }
            }
        });

        request.get(`http://${IP}/info.json`, {
            timeout: 2000
        }, (err: Error, response, body) => {
            if (logResponseDetails) {
                logger.info(`GET request to http://${IP}/info.json, got response code ${response?.statusCode ?? 'UNK'}.`);
            }
            if (err || response.statusCode === 404) {
                offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, `${serverName} 2020`, null, IP.split(':')[1]);
                logger.error(`There was an error with /info.json request: ${err.toString()}`);
            }

            if (logResponseDetails) {
                logger.debug(`isOffline state @ info.json: ${isOffline(channel)}`);
            }

            if (!isOffline(channel)) {
                try {
                    serverData[channel].info = JSON.parse(body);
                } catch (e) {
                    serverData[channel] = {};
                    logger.debug(`Caught error when trying to parse info.json response: ${e.toString()}`);
                }
            }
        });

        // run code again if data for this channel (or ip) was not found
        if (serverData[channel] === undefined && sentUpdated) {
            logger.debug(`serverData['${channel}'] was undefined, running again...`);
            offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, `${serverName} 2020`, null, IP.split(':')[1]);
        } else {
            // every minute
            serverQueryTime = 60000;
        }
    }
};
setInterval(getServerInfoData, serverQueryTime);

const prevServerData: any = {};
const prevPlayerData: any = {};

const setServerStatusInfoThread: () => void = () => {
    // if no channels then no endpoints
    if (!collectAllStatusChannels().length) {
        return;
    }

    for (const channel of collectAllStatusChannels()) {
        let guildChannel: TextChannel;

        guildChannel = <TextChannel> client.channels.cache.find(ch => ch.id === channel);

        // if the channel doesn't exist in the client's collection, we stop the code
        if (guildChannel === undefined) {
            return logger.error(`Could not find channel (${channel}) in bot\'s collection.`);
        }

        // in order to request data, we use channel topics for ip and port, if there is no channel topic, there is no request
        // therefore, no code can be run
        if (!guildChannel.topic) {
            return logger.error('No IP found, returning');
        }

        const topicDelim = guildChannel.topic.split(/ +\| +/);
        const [ IP, serverName, iconUrl ] = topicDelim;

        let title: string = 'HighSpeed-Gaming ';
        switch (IP.split(':')[1]) {
            case '7272':
                title += 'Development Server';
                break;
            case '7045':
                title += 'Server 2';
                break;
            case '704':
            default:
                title += 'Server 1';
                break;
        }

        if (!IP) {
            return logger.error('No IP found...');
        }

        if (!playerData[channel]) {
            playerData[channel] = {};
        }

        if (useExtensiveData) {
            // requesting
            request.get(`http://${IP}/hsg-rp/extensive-data.json`, {
                timeout: 4000,
                headers: {
                    token: ADMIN_KEY
                }
            }, (err: Error, res, body) => {
                if (!res || res.statusCode === 404) {
                    useExtensiveData = false;
                }
                if (err) {
                    useExtensiveData = false;

                    let footer = `${serverName} 2020`;
                    if (serverData[channel] && serverData[channel].info && serverData[channel].info.server) {
                        footer = serverData[channel].info.server;
                    }
                    offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, footer, null, IP.split(':')[1]);
                }

                if (!isOffline(channel)) {
                    try {
                        playerData[channel].extensive = JSON.parse(body);
                    } catch (e) {
                        playerData[channel].extensive = [];
                    }
                }
            });
        } else {
            logger.info(`Preparing request to ${IP}/players.json.`);
            request.get(`http://${IP}/players.json`, {
                timeout: 4000
            }, (err: Error, _, body) => {
                if (err) {
                    let footer = `${serverName} 2020`;
                    if (serverData[channel] && serverData[channel].info && serverData[channel].info.server) {
                        footer = serverData[channel].info.server;
                    }

                    offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, footer, null, IP.split(':')[1]);

                    logger.error(`An error occured with /players.json request: ${err.toString()}`);
                }

                if (!isOffline(channel)) {
                    try {
                        playerData[channel].reg = JSON.parse(body);
                    } catch (e) {
                        logger.error(`An error occurred when parsing data for /players.json: ${e.toString()}`);
                        playerData[channel].reg = [];
                    }
                }
            });
        }

        const validData = (playerData[channel] &&
            serverData[channel] &&
            serverData[channel].dynamic &&
            serverData[channel].info
        );

        if (!validData && !isOffline(channel)) {
            const whatIsInvalid = [];
            let validSvData = true;
            if (!playerData[channel]) { whatIsInvalid.push('Player Data'); }
            if (!serverData[channel]) { whatIsInvalid.push('Server Data'); validSvData = false; }
            if (validSvData && !serverData[channel].dynamic) { whatIsInvalid.push('Server Data **Dynamic**'); }
            if (validSvData && !serverData[channel].info) { whatIsInvalid.push('Server Data **Info**'); }
            return logger.debug(`Some information regarding player data, dynamic server data or static server data was undefined and could not be obtained: ${whatIsInvalid.map(x => `'${x}'`).join(', ')}`);
        }

        let plrData: any[] = [];
        if (playerData[channel].extensive || playerData[channel].reg) {
            plrData = useExtensiveData ? playerData[channel].extensive : playerData[channel].reg;
            logger.debug(`Using ${useExtensiveData ? 'extensive' : 'regular'} playerData.`);
        }

        sentUpdated = false;
        let hasPlayers = true;
        let format: string;
        let additionalFields: EmbedField[] = [];
        if (!isOffline(channel)) {
            if (!plrData || !plrData.length) {
                format = 'No players online.';
                hasPlayers = false;
            }

            if (hasPlayers) {
                logger.debug(`Server ${URL} has players (${plrData.length})`);
                if (useExtensiveData) {
                    format = `\`${playerData[channel].extensive.map((plr: IPlayerDataExtensive) => `${plr.name} | ${plr.serverId} (${plr.authLvl})`).join('\n')}\``;
                } else {
                    format = `\`${playerData[channel].reg.map((ply: IPlayerDataStruct) => `${ply.name} | ${ply.id}`).join('\n')}\``;
                }
            }

            let rpZoneName: string = serverData[channel].dynamic.mapname;
            let [ isHSG, curAuthLevel ] = [ false, 'Casual Restricted' ];
            if (serverData[channel].dynamic !== undefined) {
                [ isHSG, curAuthLevel ] = getAuthLevelByAcronym(serverData[channel].dynamic?.gametype);
                if (isHSG) {
                    // custom rpz setting
                    topicDelim.forEach(el => {
                        const setting = 'rpz';
                        if (el.substring(0, setting.length).match(setting)) {
                            const rpZoneDelim = el.split(':');
                            if (rpZoneDelim.length) {
                                rpZoneName = rpZoneDelim[1];
                            }
                        }
                    });

                    additionalFields = [
                        {
                            name: 'Authorization',
                            value: curAuthLevel,
                            inline: true
                        },
                        {
                            name: 'Roleplay Zone',
                            value: rpZoneName,
                            inline: true
                        }
                    ];
                }
            }
        }

        guildChannel.messages.fetch()
            .then(messages => {
                let statEmbed: MessageEmbed;
                if (!isOffline(channel)) {
                    statEmbed = new MessageEmbed()
                        .setAuthor(title, iconUrl)
                        .setTitle(`Total players: ${plrData.length}/${serverData[channel].dynamic.sv_maxclients}`)
                        .setDescription(format)
                        .setColor(SUCCESS_COLOR)
                        .setFooter(serverData[channel]?.info?.server ?? `${serverName} 2020`)
                        .setImage('https://i.imgur.com/aNO0fZX.png')
                        .setTimestamp();

                    if (additionalFields.length) {
                        statEmbed.fields = additionalFields;
                    }
                }

                if (!messages.array().length) {
                    logger.error(`There were no messages in the channel (${guildChannel?.name ?? URL}), so I am sending the initial embed now...`);

                    if (isOffline(channel)) {
                        guildChannel?.send(offlineEmbed[channel]);
                        offlineEmbed[channel] = null;
                        sentUpdated = true;
                        return;
                    }

                    guildChannel?.send(statEmbed);
                }

                messages.forEach(indexedMessage => {
                    if (!indexedMessage) {
                        return logger.error('I found a null message object, running again.');
                    }

                    if (indexedMessage.author.id !== client.user?.id) { return indexedMessage.delete(); }

                    if (indexedMessage.embeds.length) {
                        logger.debug(`I found a message (${indexedMessage.id}) in the channel (${guildChannel?.name ?? URL}) with embeds, editing this message with the updated information.`);

                        if (offlineEmbed[channel] instanceof MessageEmbed) {
                            indexedMessage.edit(offlineEmbed[channel]);
                            offlineEmbed[channel] = null;
                            sentUpdated = true;
                            return;
                        }

                        const embed: MessageEmbed = new MessageEmbed(indexedMessage.embeds[0])
                            .setDescription(format)
                            .setTitle(`Total players: ${plrData.length}/${serverData[channel]?.dynamic?.sv_maxclients ?? '32'}`)
                            .setTimestamp();

                        if (additionalFields.length) {
                            embed.fields = additionalFields;
                        }

                        if (!embed.image) {
                            embed.setImage('https://i.imgur.com/aNO0fZX.png');
                        }

                        if (embed.author?.name !== title || embed.author?.iconURL !== topicDelim[2]) {
                            embed.setAuthor(title, iconUrl);
                        }

                        const serverVersion = serverData[channel]?.info?.server ?? `${serverName} 2020`;
                        if (embed.footer !== serverVersion) {
                            embed.setFooter(serverVersion);
                        }

                        if (embed.hexColor !== SUCCESS_COLOR) {
                            embed.setColor(SUCCESS_COLOR);
                        }

                        indexedMessage.edit(embed);
                        sentUpdated = true;

                        prevServerData[channel] = serverData[channel];
                        prevPlayerData[channel] = playerData[channel];
                    }
                });
            })
            .catch(e => logger.error(`An error occured for message iteration with channel ${channel}: ${e.toString()}`));
    }
};
setInterval(setServerStatusInfoThread, 10 * 1000);
