import { Command } from 'discord-akairo';
import { isStaff, endPoints, embedAuthIcon, IPlayerDataStruct, embedColor } from '../../utils/functions';
import * as request from 'request';
import { MessageEmbed } from 'discord.js';
import pluralize = require('pluralize');
import { MESSAGES } from '../../utils/constants';
import { HMessage } from '../../utils/classes/HMessage';

export default class PlayerList extends Command {
    // constructor() {
    //     super('plist', {
    //         name: 'plist',
    //         group: 'information',
    //         memberName: 'plist',
    //         description: MESSAGES.COMMANDS.PLIST.DESCRIPTION,
    //         args: [
    //             {
    //                 key: 'sid',
    //                 prompt: 'Which server would you like to show the player list for?',
    //                 type: 'string',
    //                 oneOf: [ 's1', 's2', 'dv' ]
    //             }
    //         ]
    //     });
    // }

    public constructor() {
        super('plist', {
            aliases: [ 'plist' ],
            description: {
                content: MESSAGES.COMMANDS.PLIST.DESCRIPTION,
                usage: '<serverId>',
                examples: [ 'S1', 'S2' ]
            },
            category: 'info',
            channel: 'guild',
            args: [
                {
                    id: 'serverId',
                    type: [ 'S1', 'S2', 'DV' ],
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.PLIST.PROMPT.START(message.author)
                    },
                    match: 'content'
                }
            ],
            clientPermissions: [ 'EMBED_LINKS' ]
        });
    }

    public exec(message: HMessage, { sid }: { sid: string }) {
        sid = sid.toUpperCase();
        if (sid === 'DV' && !message.member.roles.cache.find(r => r.id === '625068930485977138') && !isStaff(message.member)) {
            return message.reply('that is not a valid server ID.');
        }

        let isOffline = false;
        let playerData: IPlayerDataStruct[] = [];
        request.get(`http://${endPoints.fiveM.URL}:${sid === 'S1' ? endPoints.fiveM.s1Port : sid === 'S2' ? endPoints.fiveM.s2Port : sid === 'DV' ? endPoints.fiveM.dvPort : '704'}/players.json`, {
            timeout: 4000
        }, (err, response, body) => {
            if (err || response.statusCode === 404) {
                isOffline = true;
            }

            try {
                playerData = JSON.parse(body);
            } catch (e) {
                isOffline = true;
            }

            const sortedPlayers = playerData.map(key => ({
                id: key.id,
                name: key.name
            })).sort((first, second) => (first.id < second.id) ? -1 : (first.id > second.id) ? 1 : 0);

            const embed = new MessageEmbed()
                .setAuthor(`Player List [${sid.toUpperCase()}]`, embedAuthIcon)
                .setDescription(`There are currently ${playerData.length} ${pluralize('player', playerData.length)} online.\n\n${sortedPlayers.map(p => `\`${p.name} | ${p.id}\``).join('\n')}`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`)
                .setColor(embedColor);

            if (!isOffline) {
                return message.reply(embed);
            }

            return message.reply(`could not obtain player list for server ${sid}.`);
        });
    }
}
