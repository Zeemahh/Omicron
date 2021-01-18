import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as request from 'request';
import { IServerDataStruct, endPoints, embedColor, embedFooter, getAuthLevelByAcronym, Delay } from '../../utils/functions';
import { MessageEmbed, Message } from 'discord.js';
import { MESSAGES } from '../../utils/constants';

let serverData: IServerDataStruct = {
    clients: 0,
    gametype: 'unknown',
    hostname: 'unknown',
    iv: '0000',
    mapname: 'unknown',
    sv_maxclients: '0'
};

let internalData: string[];

export default class Sinfo extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'sinfo',
            group: 'information',
            memberName: 'sinfo',
            description: MESSAGES.COMMANDS.SINFO.DESCRIPTION
        });
    }

    public run(message: CommandoMessage) {
        message.delete();

        let probablyOffline = false;
        const data = endPoints.fiveM;
        const showPolicies = message.channel.type === 'dm' ? this.client.owners.find(c => c.id === message.author.id) : message.member.roles.cache.has('625068930485977138');

        request.get(`http://${data.URL}:${data.s1Port}/dynamic.json`, {
            timeout: 2000
        }, (dErr, _, body) => {
            if (dErr) {
                probablyOffline = true;
                return message.reply('something went wrong when obtaining information, try again later.');
            }

            request.get(`https://policy-live.fivem.net/api/server/${data.URL}:${data.s1Port}`, {
                timeout: 4000
            }, async (__, ___, pBody) => {
                try {
                    serverData = JSON.parse(body);
                } catch (e) {
                    probablyOffline = true;
                    return message.reply(`something went wrong when parsing information with IP ${data.URL}`);
                }

                if (showPolicies) {
                    try {
                        internalData = JSON.parse(pBody);
                    } catch (e) {
                        return message.reply('there was an issue with parsing the policy response.');
                    }
                }

                const embed = new MessageEmbed()
                    .setAuthor(`Server Information`, message.guild?.iconURL())
                    .addField('Server IP', `${data.URL}:${data.s1Port}`)
                    .addField('Players', `${serverData.clients} | ${serverData.sv_maxclients}`)
                    .setFooter(embedFooter)
                    .setColor(embedColor)
                    .setTimestamp();

                if (showPolicies) {
                    embed.addField('Server Policies', `\`\`\`json\n${pBody}\`\`\` ${!internalData.find(a => a === 'subdir_file_mapping') ? 'EUP could potentially be having issues currently.' : ''}`);
                }

                const [ isHSG, authLevelLong ] = getAuthLevelByAcronym(serverData.gametype);
                if (isHSG) {
                    embed.addField('Authorization', authLevelLong, true);
                    embed.addField('Roleplay Zone', serverData.mapname, true);
                }

                const retMessage = await message.reply(embed);

                if (message.channel.type === 'dm' || message.member.permissions.has('MANAGE_MESSAGES')) {
                    return;
                }

                if (retMessage instanceof Message) {
                    await Delay(5000);
                    await retMessage.delete();
                }
            });
        });

        if (probablyOffline) {
            return message.reply('server is probably offline.');
        }
    }
}
