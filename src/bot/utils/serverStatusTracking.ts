import { TextChannel, MessageEmbed, EmbedField, Channel } from 'discord.js';
import { client } from '../bot';
import * as request from 'request';
import * as moment from 'moment';
import '../lib/env';
import { timeLog, getAuthLevelByAcronym, isDevelopmentBuild } from './functions';
import { settings } from '../config';

/*
let runTasks: boolean = true;

export function toggleTasks(state: boolean): boolean {
    runTasks = state;
    return runTasks;
}

export const allowedTypeTasks: string[] = [
    'pcount',
    'alvlchange'
];

const activeTasks: {
    [key: string]: {
        active: boolean,
        value: string
    }
} = {};

export function prototypeTaskSetter(type: string, value: string): [ string, string ] {
    activeTasks[type] = {
        active: true,
        value
    };
    return [ type, value ];
}
*/

const ignoredErrors = [
    'ETIMEDOUT',
    'ESOCKETTIMEDOUT'
];

let serverQueryTime = 6000;

const serverData: any = {};
const playerData: any = {};

let probablyOfflineTick = 0;
let isProbablyOffline: boolean;

function getServerInfoData(): void {
    // don't run if the status is false, obviously
    if (!settings.logStatus) {
        return;
    }

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object' || settings.statusChannels.length === 0) {
        return;
    }

    // iteration
    for (const channel of settings.statusChannels) {
        let guildChannel: Channel|undefined;

        // get channel from client's channel collection
        guildChannel = client.channels.cache.find(ch => ch.id === channel);

        // if channel couldn't be found in collection, return
        if (guildChannel === undefined || !(guildChannel instanceof TextChannel)) {
            return timeLog(`Could not find channel (${channel}) in bot\'s collection.`, isDevelopmentBuild());
        }

        // if there is no topic, there is no endpoint, and no request
        if (!guildChannel.topic) {
            return timeLog('the channel had no topic', isDevelopmentBuild());
        }

        const topicDeliminator = guildChannel.topic.split(/ +\| +/);
        const IP = topicDeliminator[0];

        // request for hostname and stuff with a timeout of 10000ms to stop hangs
        request.get(`http://${IP}/dynamic.json`, {
            timeout: 10000
        }, (err: Error, response: request.Response, body) => {
            if (err || response.statusCode === 404) {
                probablyOfflineTick++;
                if (err && !ignoredErrors.includes(err.toString())) {
                    timeLog(err.stack);
                }
                serverData[channel] = {
                    state: 'offline'
                };
                return;
            }

            // /!\ IMPORTANT /!\
            // we must parse the data before we can begin to display it. if it cannot be
            // parsed, there is something wrong and we need to check it

            // also, this crashes app if it's not caught
            try {
                serverData[channel].dynamic = JSON.parse(body);
            } catch (e) {
                probablyOfflineTick++;
                return;
            }
        });

        request.get(`http://${IP}/info.json`, {
            timeout: 2000
        }, (err: Error, response, body) => {
            if (err || response.statusCode === 404) {
                probablyOfflineTick++;
                serverData[channel] = {
                    state: 'offline'
                };
                return;
            }

            try {
                serverData[channel].info = JSON.parse(body);
            } catch (e) {
                probablyOfflineTick++;
                return;
            }
        });

        // run code again if data for this channel (or ip) was not found
        if (serverData[channel] === undefined) {
            timeLog(`serverData[${channel}] was undefined, running again...`, isDevelopmentBuild());
            serverData[channel] = {
                state: 'offline'
            };
            probablyOfflineTick++;
        } else {
            // every minute
            serverQueryTime = 60000;
        }
    }
}
const getServerInfoThread: NodeJS.Timeout = setInterval(getServerInfoData, serverQueryTime);

const prevServerData: any = {};
const prevPlayerData: any = {};
// let taskSent: boolean = false;
function setServerStatusInfoThread(): void {
    // don't run if state is false, obviously
    if (!settings.logStatus) {
        return;
    }

    // if no channels then no endpoints
    if (!settings.statusChannels || typeof settings.statusChannels !== 'object' || settings.statusChannels.length === 0) {
        return;
    }

    for (const channel of settings.statusChannels) {
        let guildChannel: TextChannel;

        guildChannel = client.channels.cache.find(ch => ch.id === channel) as TextChannel;

        // if the channel doesn't exist in the client's collection, we stop the code
        if (guildChannel === undefined) {
            return timeLog(`Could not find channel (${channel}) in bot\'s collection.`, isDevelopmentBuild());
        }

        // in order to request data, we use channel topics for ip and port, if there is no channel topic, there is no request
        // therefore, no code can be run
        if (!guildChannel.topic) {
            return timeLog('No IP found, returning', isDevelopmentBuild());
        }

        const topic_delim = guildChannel.topic.split(/ +\| +/);
        const IP = topic_delim[0];
        const serverName = topic_delim[1] || 'FiveM';
        const iconUrl = topic_delim[2];

        if (!IP) {
            return timeLog('No IP found...', isDevelopmentBuild());
        }

        // requesting
        request.get(`http://${IP}/players.json`, {
            timeout: 4000
        }, (err: Error, _, body) => {
            if (err) {
                probablyOfflineTick++;
            }

            try {
                playerData[channel] = JSON.parse(body);
            } catch (e) {
                playerData[channel] = {
                    state: 'offline'
                };
                if (probablyOfflineTick >= 5) {
                    isProbablyOffline = true;
                    probablyOfflineTick = 0;
                    return;
                } else {
                    probablyOfflineTick++;
                }
            }
        });

        const validData = (playerData[channel] && serverData[channel] && serverData[channel].dynamic && serverData[channel].info) !== undefined;

        if (!validData) {
            timeLog('Some information regarding player data, dynamic server data or static server data was undefined and could not be obtained', isDevelopmentBuild());
            return;
        }

        const format = playerData[channel].length > 0 ?
            `\`${playerData[channel].map((ply: PlayerDataStruct) => `${ply.name}`).join(', ')}\`` :
            'No players online.';

        const topicDelim = guildChannel.topic.split(/ +\| +/);

        let additionalFields: EmbedField[];

        let rpZoneName: string = serverData[channel].dynamic.mapname;
        let [ isHSG, curAuthLevel ] = [ false, 'Casual Restricted' ];
        if (serverData[channel].dynamic !== undefined) {
            [ isHSG, curAuthLevel ] = getAuthLevelByAcronym(serverData[channel].dynamic?.gametype);
            if (!isProbablyOffline && isHSG) {
                // custom rpz setting
                topicDelim.forEach(el => {
                    const setting = 'rpz';
                    if (el.substring(0, setting.length).match(setting)) {
                        const rpZoneDelim = el.split(':');
                        if (rpZoneDelim.length > 0) {
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
        } else {
            isProbablyOffline = true;
        }

        guildChannel.messages.fetch()
            .then(messages => {
                let statEmbed: MessageEmbed;
                let offlineEmbed: MessageEmbed;
                if (!isProbablyOffline) {
                    statEmbed = new MessageEmbed()
                        .setColor('#7700EF')
                        .setAuthor(serverName, iconUrl)
                        .setTitle(`Here is the updated server status, last updated @ ${moment(Date.now()).format('h:mm:ss')}` +
                            `\n\nTotal players: ${playerData[channel].length}/${serverData[channel].dynamic.sv_maxclients}`)
                        .setDescription(format)
                        .setFooter(`${serverName} 2020`);

                    if (additionalFields.length > 0) {
                        statEmbed.fields = additionalFields;
                    }
                } else {
                    offlineEmbed = new MessageEmbed()
                        .setColor('#7700EF')
                        .setAuthor(serverName, iconUrl)
                        .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'))
                        .setFooter(`${serverName} 2020`);

                    isProbablyOffline = false;
                }
                if (messages.array().length === 0) {
                    timeLog(`There were no messages in the channel (${guildChannel.name}), so I am sending the initial embed now...`);
                    if (isProbablyOffline) {
                        timeLog('I think the server is offline.', isDevelopmentBuild());
                        guildChannel?.send(offlineEmbed);
                    }

                    guildChannel?.send(statEmbed);
                }

                messages.forEach(indexedMessage => {
                    if (indexedMessage === null) {
                        return timeLog('I found a null message object, running again.', isDevelopmentBuild());
                    }

                    if (indexedMessage.author.id !== client.user?.id) { return indexedMessage.delete(); }

                    if (indexedMessage.embeds.length >= 1) {
                        timeLog(`I found a message (${indexedMessage.id}) in the channel (${guildChannel.name}) with embeds, editing this message with the updated information.`, isDevelopmentBuild());

                        if (isProbablyOffline) {
                            const newOfflineEmbed: MessageEmbed = new MessageEmbed(indexedMessage.embeds[0])
                                .setTitle('Server Offline! Last updated @ ' + moment(Date.now()).format('h:mm:ss'));

                            delete newOfflineEmbed.fields;
                            delete newOfflineEmbed.description;

                            indexedMessage.edit(newOfflineEmbed);
                        }

                        const embed: MessageEmbed = new MessageEmbed(indexedMessage.embeds[0])
                            .setDescription(format)
                            .setTitle(`Here is the updated server status, last updated @ ${moment(Date.now()).format('h:mm:ss')}` +
                            `\n\nTotal players: ${playerData[channel].length}/${serverData[channel].dynamic.sv_maxclients}`);

                        if (typeof additionalFields === 'object') {
                            embed.fields = additionalFields;
                        }

                        if (embed.author !== topicDelim[1]) {
                            embed.setAuthor(topicDelim[1], topicDelim[2]);
                            embed.setFooter(topicDelim[1] + ' 2020');
                        }

                        indexedMessage.edit(embed);

                        // FOLLOWING CODE IS NOT USED IN THIS BOT
                        /*
                        if (runTasks && !taskSent) {
                            let taskChannel: TextChannel;
                            taskChannel = client.channels.cache.find(ch => ch.id === settings.customTaskResponse) as TextChannel;
                            for (const [ item, key ] of Object.entries(activeTasks)) {
                                if (item === 'pCount') {
                                    if (key.active) {
                                        if (prevPlayerData[channel] && (prevPlayerData[channel].length !== playerData[channel].length) && playerData[channel].length === key.value) {
                                            taskSent = true;

                                            const taskEmbed: MessageEmbed = new MessageEmbed()
                                                .setTitle('Custom Task Emitter')
                                                .setColor('#37bd75')
                                                .addField('Task Type', item)
                                                .setDescription('Player count is ' + key.value + ', I was told to notify you.');

                                            taskChannel.send(taskEmbed);
                                            break;
                                        }
                                    }
                                } else if (item === 'alvlChange') {
                                    if (key.active) {
                                        if (prevServerData[channel] && (prevServerData[channel].dynamic.gametype !== serverData[channel].dynamic.gametype && curAuthLevel === key.value) && isHSG) {
                                            const [ _, oldAuth ]: [ boolean, string ] = getAuthLevelByAcronym(prevServerData[channel].dynamic.gametype);
                                            const taskEmbed: MessageEmbed = new MessageEmbed()
                                                .setTitle('Custom Task Emitter')
                                                .setColor('#37bd75')
                                                .addField('Task Type', item)
                                                .addField('Change', oldAuth + ' -> ' + curAuthLevel)
                                                .setDescription('Authorization is ' + key.value + ', I was told to notify you of change.');

                                            taskChannel.send(taskEmbed);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        */

                        prevServerData[channel] = serverData[channel];
                        prevPlayerData[channel] = playerData[channel];
                    } else {
                        indexedMessage.delete();
                        timeLog(`I found a message in ${guildChannel?.name} by ${indexedMessage.author.tag} that was not status in #${guildChannel?.name} (${guildChannel?.id})`, isDevelopmentBuild());
                    }
                });
            });
    }
}
const setServerInfoThread: NodeJS.Timeout = setInterval(setServerStatusInfoThread, settings.waitTime || 3000);

/*
setInterval(() => {
    if (runTasks && taskSent) {
        taskSent = false;
    }
}, 3000);
*/

interface PlayerDataStruct {
    name: string;
    id: number;
    identifiers: string[];
    ping: number;
}

// might use sometime in the future
/*
interface serverDataStruct {
    [key: string]: any;
    Data: {
        sv_maxClients: number;
        clients: number;
        gamename: string;
        protocol: number;
        hostname: string;
        gametype: string;
        mapname: string;
        enhancedHostSupport: boolean;
        resources: string[];
        server: string;
        vars: {
            Teamspeak?: string;
            Website?: string;
            locale?: string;
            onesync_enabled: string;
            sv_enhancedHostSupport: string;
            sv_lan: string;
            sv_licenseKeyToken: string;
            sv_maxClients: string;
            sv_scriptHookAllowed: string;
            svn?: string;
            tags: string;
            premium?: string;
        };
        players: object[];
        upvotePower: number;
        svMaxclients: number;
        lastSeen: Date;
        iconVersion: number;
    }
}
*/
