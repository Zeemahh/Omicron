import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as request from 'request';
import { ServerDataStruct, endPoints, embedColor, embedFooter, getAuthLevelByAcronym } from '../../utils/functions';
import { MessageEmbed } from 'discord.js';

let serverData: ServerDataStruct = {
    clients: 0,
    gametype: 'unknown',
    hostname: 'unknown',
    iv: '0000',
    mapname: 'unknown',
    sv_maxclients: '0'
};

export default class Sinfo extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'sinfo',
            group: 'information',
            memberName: 'sinfo',
            description: 'Displays information about the server(s).'
        });
    }

    public run(message: CommandoMessage) {
        message.delete();

        let probablyOffline = false;
        const data: { URL: string, Protocol: string, s1Port: string, s2Port: string } = endPoints.fiveM;

        request.get(`http://${data.URL}:${data.s1Port}/dynamic.json`, {
            timeout: 2000
        }, (err, response, body) => {
            if (err) {
                probablyOffline = true;
                return message.reply('something went wrong when obtaining information, try again later.');
            }

            try {
                serverData = JSON.parse(body);
            } catch (e) {
                probablyOffline = true;
                return message.reply(`something went wrong when parsing information with IP ${data.URL}`);
            }

            const embed: MessageEmbed = new MessageEmbed()
                .setAuthor(`Server Information`, message.guild.iconURL())
                .addField('Server IP', `${data.URL}:${data.s1Port}`)
                .addField('Players', `${serverData.clients} | ${serverData.sv_maxclients}`)
                .setFooter(embedFooter)
                .setColor(embedColor)
                .setTimestamp();

            const [ isHSG, authLevelLong ]: [ boolean, string|null ] = getAuthLevelByAcronym(serverData.gametype);
            if (isHSG) {
                embed.addField('Authorization', authLevelLong, true);
                embed.addField('Roleplay Zone', serverData.mapname, true);
            }

            return message.reply(embed);
        });

        if (probablyOffline) {
            return message.reply('server is probably offline.');
        }
    }
}
