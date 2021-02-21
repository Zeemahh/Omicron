import { Command } from 'discord-akairo';
import { embedAuthIcon, embedColor, embedFooter, IPlayerDataExtensive, getAuthLvlFromMember, hsgRoleMap } from '../../utils/functions';
import { MessageEmbed } from 'discord.js';
import { MESSAGES } from '../../utils/constants';
import { getApiKeyForAuth, API_ENDPOINT, API_TIMEOUT, isLocalServer } from '../../config';
import fetch from 'node-fetch';
import { HMessage } from '../../utils/classes/HMessage';

const allowedIdentifiers = [
    'discord',
    'steam',
    'license',
    'ip'
];

export default class PlayerInfo extends Command {
    public constructor() {
        super('pinfo', {
            aliases: [ 'pinfo' ],
            description: {
                content: MESSAGES.COMMANDS.PINFO.DESCRIPTION,
                usage: '<plr> [server]',
                examples: [ '51', '81 S2' ]
            },
            category: 'staff',
            channel: 'guild',
            args: [
                {
                    id: 'plr',
                    type: 'string',
                    prompt: {
                        start: () => MESSAGES.COMMANDS.PINFO.PROMPT.START()
                    },
                    match: 'content'
                },
                {
                    id: 'server',
                    type: [ 's1', 's2 ' ],
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.PINFO.PROMPT.START_2(message.author)
                    },
                    default: 's1'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async exec(message: HMessage, { plr, server }: { plr: string, server: string }) {
        const [ id, ret ] = getIdentifierType(plr);
        const currentAuth = getAuthLvlFromMember(message.member);
        const apiKey = getApiKeyForAuth(currentAuth);

        if (!apiKey || currentAuth.rank < hsgRoleMap.A1.rank) {
            return message.reply('you cannot execute this command.');
        }

        if (!id) {
            return message.reply('that is not a valid identifier.');
        }

        const path = `http://${API_ENDPOINT}/${isLocalServer() ? 'hsg-server' : 'hsg-rp'}/extensive-data.json`;
        const allData = await fetch(path, {
            headers: {
                'token': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: API_TIMEOUT
        });

        const parsedData: IPlayerDataExtensive[] = await allData.json();
        const playerData = parsedData.filter(i => i !== null);

        if (allData.status === 401) {
            return message.util?.send('Unauthorized request.');
        }

        if (allData.status === 400) {
            return message.util?.send('Bad request (probably path).');
        }

        let foundPlr: IPlayerDataExtensive;
        for (const [ , player ] of Object.entries(playerData)) {
            if (typeof ret === 'number' && player.serverId === ret) {
                foundPlr = player;
            } else {
                for (const [ , identifier ] of Object.entries(player.identifiers)) {
                    if (identifier === ret || identifier.substr(0, id.length + 1) === ret) {
                        foundPlr = player;
                    }
                }
            }
        }

        if (!foundPlr) {
            return message.reply('I could not find a player with the identifier provided.');
        }

        const embed = new MessageEmbed()
            .setAuthor('Player Information', embedAuthIcon)
            .setDescription(`Information for player ${foundPlr.name} on ${server.toUpperCase()} matched \`${id}\` identifier.`)
            .addField('Server ID', foundPlr.serverId)
            .addField('Authorization Level', foundPlr.authLvl)
            .addField('Playtime', `**Total**\n${foundPlr.playtime.total}\n\n**Session**\n${foundPlr.playtime.session}`)
            .setColor(embedColor)
            .setFooter(embedFooter);

        if (foundPlr.identifiers.length) {
            embed.addField('Identifiers', foundPlr.identifiers.filter(tId => tId.substr(0, 2) !== 'ip')
                .map(i => `\`${i}\``)
                    .join(', \n')
            );
        }

        return message.reply(embed);
    }
}

const getIdentifierType: (str: string) => [ string, string | number ] =
    (str: string) =>
{
    // tslint:disable-next-line: no-bitwise
    if (parseInt(str, null) && parseInt(str, null) < (1 << 16) - 1) {
        return [ 'sid', parseInt(str, null) ];
    } else {
        if (str.length === 18) {
            return [ 'discord', `discord:${str}` ];
        }

        for (const [ , id ] of Object.entries(allowedIdentifiers)) {
            if (str.startsWith(id)) {
                return [ id, str ];
            }
        }
    }

    return [ undefined, undefined ];
}
