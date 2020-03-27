import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { endPoints, PlayerDataStruct, embedAuthIcon, embedColor, embedFooter } from '../../utils/functions';
import request = require('request');
import { MessageEmbed } from 'discord.js';

let playerData: PlayerDataStruct[];
const allowedIdentifiers = [
    'discord',
    'steam',
    'license',
    'ip'
];

export default class PlayerInfo extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'pinfo',
            group: 'admin',
            memberName: 'pinfo',
            description: 'Returns information about a player on the FiveM server.',
            args: [
                {
                    key: 'plr',
                    prompt: 'A player who is active in the server. Takes any player identifier - Steam, Game License, IP, FiveM Forum ID, Server ID',
                    type: 'string'
                },
                {
                    key: 'server',
                    prompt: 'Which server is this player on?',
                    type: 'string',
                    default: 's1',
                    oneOf: [
                        's1',
                        's2'
                    ]
                }
            ],
            userPermissions: ['MANAGE_MESSAGES'],
            examples: [
                ';pinfo 521',
                ';pinfo 264662751404621825'
            ]
        });
    }

    public run(message: CommandoMessage, { plr, server }: { plr: string, server: string }) {
        const [ id, ret ] = getIdentifierType(plr);
        if (!id) {
            return message.reply('that is not a valid identifier.');
        }

        const data = endPoints.fiveM;
        const svId = (server === 's1' ? 'Server 1' : 'Server 2');
        let foundPlayer: PlayerDataStruct;

        request.get(`http://${data.URL}:${(server === 's1' ? data.s1Port : data.s2Port)}/players.json`, {
            timeout: 2000
        }, (err: Error, response, body) => {
            if (response.statusCode === 404) {
                return message.reply('this server seems to be offline.');
            }

            try {
                playerData = JSON.parse(body);
            } catch (e) {
                return message.reply('an error occured whilst trying to parse player data.');
            }

            playerData.forEach(player => {
                if (typeof ret === 'number' && player.id === ret) {
                    foundPlayer = player;
                } else {
                    player.identifiers.forEach(identifier => {
                        if (identifier === ret || identifier.substr(0, id.length + 1) === ret) {
                            foundPlayer = player;
                        }
                    });
                }
            });

            if (!foundPlayer) {
                return message.reply(`I could not find a player with the identifier you provided on ${svId}`);
            }

            const embed = new MessageEmbed()
                .setAuthor('Player Information', embedAuthIcon)
                .setDescription(`Information for player ${foundPlayer.name} on ${svId} matched ${id} identifier.`)
                .addField('ID', foundPlayer.id)
                .addField('Identifiers', foundPlayer.identifiers.map(i => `\`${i}\``).join(', \n'))
                .setColor(embedColor)
                .setFooter(embedFooter);

            if (id === 'discord' && typeof ret === 'string') {
                const member = message.guild.members.cache.get(ret.substr(id.length + 1));
                if (member) {
                    embed.addField('Member in Guild', `<@${member.user.id}> | Roles: ${member.roles.cache.size}`);
                }
            }

            return message.reply(embed);
        });
    }
}

function getIdentifierType(str: string): [ string, string|number ] {
    if (parseInt(str, null) && parseInt(str, null) < 65535) {
        return [ 'sid', parseInt(str, null) ];
    } else {
        if (str.length === 18) {
            return [ 'discord', `discord:${str}` ];
        }

        for (const [ _, id ] of Object.entries(allowedIdentifiers)) {
            if (str.substr(0, id.length) === id) {
                return [ id, str ];
            }
        }
    }

    return [ undefined, undefined ];
}
