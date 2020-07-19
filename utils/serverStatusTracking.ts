import { TextChannel, MessageEmbed, EmbedField, Channel } from 'discord.js';
import { client } from '../bot';
import * as request from 'request';
import * as moment from 'moment';
import '../lib/env';
import { timeLog, getAuthLevelByAcronym, LogGate, embedAuthIcon, LogState, IPlayerDataExtensive, IPlayerDataStruct } from './functions';
import { collectAllStatusChannels, ADMIN_KEY } from '../config';

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

function getServerInfoData(): void {
    // if no channels then no endpoints
    if (collectAllStatusChannels().length === 0) {
        return;
    }

    // iteration
    for (const channel of collectAllStatusChannels()) {
        let guildChannel: Channel;

        // get channel from client's channel collection
        guildChannel = client.channels.cache.find(ch => ch.id === channel);

        // if channel couldn't be found in collection, return
        if (!guildChannel || !(guildChannel instanceof TextChannel)) {
            return timeLog(`Could not find channel (${channel}) in bot\'s collection.`, LogGate.Development);
        }

        // if there is no topic, there is no endpoint, and no request
        if (!guildChannel.topic) {
            return timeLog('the channel had no topic', LogGate.Development);
        }

        const topicDelim = guildChannel.topic.split(/ +\| +/);
        const [ IP, serverName, iconUrl ] = topicDelim;

        // request for hostname and stuff with a timeout of 10000ms to stop hangs
        request.get(`http://${IP}/dynamic.json`, {
            timeout: 10000
        }, (err: Error, response: request.Response, body) => {
            if (logResponseDetails) {
                timeLog(`GET request to http://${IP}/dynamic.json, got response code ${response?.statusCode ?? 'UNK'}.`,
                    LogGate.Development,
                    !response ? LogState.Error : LogState.Debug
                );
            }

            if (err || response.statusCode === 404) {
                let footer = `${serverName} 2020`;
                if (serverData[channel] && serverData[channel].info && serverData[channel].info.server) {
                    footer = serverData[channel].info.server;
                }
                offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, footer, null, IP.split(':')[1]);
                timeLog(`There was an error with /dynamic.json request.`, LogGate.Development, LogState.Error);
            }

            if (logResponseDetails) {
                timeLog(`isOffline state @ dynamic.json: ${isOffline(channel)}`, LogGate.Development);
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
                    timeLog(`Caught error when trying to parse dynamic.json response: ${e.toString()}`, LogGate.Development);
                }
            }
        });

        request.get(`http://${IP}/info.json`, {
            timeout: 2000
        }, (err: Error, response, body) => {
            if (logResponseDetails) {
                timeLog(`GET request to http://${IP}/info.json, got response code ${response?.statusCode ?? 'UNK'}.`, LogGate.Development);
            }
            if (err || response.statusCode === 404) {
                offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, `${serverName} 2020`, null, IP.split(':')[1]);
                timeLog(`There was an error with /info.json request: ${err.toString()}`, LogGate.Development, LogState.Error);
            }

            if (logResponseDetails) {
                timeLog(`isOffline state @ info.json: ${isOffline(channel)}`, LogGate.Development);
            }

            if (!isOffline(channel)) {
                try {
                    serverData[channel].info = JSON.parse(body);
                } catch (e) {
                    serverData[channel] = {};
                    timeLog(`Caught error when trying to parse info.json response: ${e.toString()}`, LogGate.Development);
                }
            }
        });

        // run code again if data for this channel (or ip) was not found
        if (serverData[channel] === undefined && sentUpdated) {
            timeLog(`serverData['${channel}'] was undefined, running again...`, LogGate.Development);
            offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, `${serverName} 2020`, null, IP.split(':')[1]);
        } else {
            // every minute
            serverQueryTime = 60000;
        }
    }
}
setInterval(getServerInfoData, serverQueryTime);

const prevServerData: any = {};
const prevPlayerData: any = {};
// let taskSent: boolean = false;
function setServerStatusInfoThread(): void {
    // if no channels then no endpoints
    if (collectAllStatusChannels().length === 0) {
        return;
    }

    for (const channel of collectAllStatusChannels()) {
        let guildChannel: TextChannel;

        guildChannel = <TextChannel> client.channels.cache.find(ch => ch.id === channel);

        // if the channel doesn't exist in the client's collection, we stop the code
        if (guildChannel === undefined) {
            return timeLog(`Could not find channel (${channel}) in bot\'s collection.`, LogGate.Development);
        }

        // in order to request data, we use channel topics for ip and port, if there is no channel topic, there is no request
        // therefore, no code can be run
        if (!guildChannel.topic) {
            return timeLog('No IP found, returning', LogGate.Development);
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
            return timeLog('No IP found...', LogGate.Development);
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
            timeLog(`Preparing request to ${IP}/players.json.`, LogGate.Development);
            request.get(`http://${IP}/players.json`, {
                timeout: 4000
            }, (err: Error, _, body) => {
                if (err) {
                    let footer = `${serverName} 2020`;
                    if (serverData[channel] && serverData[channel].info && serverData[channel].info.server) {
                        footer = serverData[channel].info.server;
                    }

                    offlineEmbed[channel] = getOfflineEmbed(serverName, iconUrl, footer, null, IP.split(':')[1]);

                    timeLog(`An error occured with /players.json request: ${err.toString()}`, LogGate.Development, LogState.Error);
                }

                if (!isOffline(channel)) {
                    try {
                        playerData[channel].reg = JSON.parse(body);
                    } catch (e) {
                        timeLog(`An error occurred when parsing data for /players.json: ${e.toString()}`, LogGate.Development);
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
            return timeLog(`Some information regarding player data, dynamic server data or static server data was undefined and could not be obtained: ${whatIsInvalid.map(x => `'${x}'`).join(', ')}`, LogGate.Development);
        }

        let plrData: any[] = [];
        if (playerData[channel].extensive || playerData[channel].reg) {
            plrData = useExtensiveData ? playerData[channel].extensive : playerData[channel].reg;
            timeLog(`Using ${useExtensiveData ? 'extensive' : 'regular'} playerData.`, LogGate.Development);
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
                    timeLog(`There were no messages in the channel (${guildChannel.name}), so I am sending the initial embed now...`, LogGate.Always);

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
                        return timeLog('I found a null message object, running again.', LogGate.Development);
                    }

                    if (indexedMessage.author.id !== client.user?.id) { return indexedMessage.delete(); }

                    if (indexedMessage.embeds.length) {
                        timeLog(`I found a message (${indexedMessage.id}) in the channel (${guildChannel.name}) with embeds, editing this message with the updated information.`, LogGate.Development);

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

                        if (embed.author.name !== title) {
                            embed.author.name = title;
                        }

                        if (embed.author.iconURL !== topicDelim[2]) {
                            embed.author.iconURL = topicDelim[2];
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
            .catch(e => timeLog(`An error occured for message iteration with channel ${channel}: ${e.toString()}`, LogGate.Development, LogState.Error));
    }
}
setInterval(setServerStatusInfoThread, 30 * 1000);
