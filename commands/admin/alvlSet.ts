import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import { hsgAuthsShort, getAuthLvlFromMember, getAuthLvlFromAcronym, hsgRoleMap, IPlayerDataExtensive } from '../../utils/functions';
import { getApiKeyForAuth, API_TIMEOUT, API_ENDPOINT, isLocalServer } from '../../config';
import fetch from 'node-fetch';

export default class AlvlSet extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'alvlset',
            group: 'admin',
            memberName: 'alvlset',
            description: MESSAGES.COMMANDS.ALVL_SET.DESCRIPTION,
            args: [
                {
                    key: 'player',
                    prompt: 'The server ID of the player you wish to set authorization level for.',
                    type: 'integer',
                },
                {
                    key: 'authlvl',
                    prompt: 'The authorization level.',
                    type: 'string',
                    oneOf: hsgAuthsShort
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}alvlset 521 CU`,
                `${client.commandPrefix}alvlset 5 DV`
            ]
        });
    }

    public async run(message: CommandoMessage, { player, authlvl }: { player: number, authlvl: string }) {
        message.delete();

        const currentAuthLvl = getAuthLvlFromMember(message.member);
        const changingAuth = getAuthLvlFromAcronym(authlvl.toUpperCase());
        const apiKey = getApiKeyForAuth(currentAuthLvl);

        if (!apiKey || currentAuthLvl.rank < hsgRoleMap.A1.rank) {
            return message.reply('you cannot execute this command.');
        }

        if (currentAuthLvl.rank < changingAuth.rank) {
            return message.reply('you cannot set auth higher than self.');
        }

        const allData = await fetch(`http://${API_ENDPOINT}/${isLocalServer() ? 'hsg-server' : 'hsg-rp'}/extensive-data.json`, {
            headers: {
                'token': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: API_TIMEOUT
        });

        const parsedData: IPlayerDataExtensive[] = await allData.json();

        let foundPlayer = false;
        for (const [ _, plr ] of Object.entries(parsedData)) {
            if (plr.serverId === player) {
                foundPlayer = true;
                break;
            }
        }

        if (!foundPlayer) {
            return message.reply('could not find player with that ID.');
        }

        const settingData = await fetch(`http://${API_ENDPOINT}/${isLocalServer() ? 'hsg-server' : 'hsg-rp'}/setAuth`, {
            method: 'POST',
            headers: {
                'token': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: API_TIMEOUT,
            body: JSON.stringify({
                serverId: player,
                authLvl: authlvl,
                adminDets: {
                    name: `${message.author.tag}`,
                    authLvl: currentAuthLvl.acronym
                }
            })
        });

        const settingResponse = await settingData.json();

        if (!settingResponse.ok) {
            console.log(settingResponse.response);
            return message.say(`Something went wrong when attempting to set authorization level for server ID \`${player}\`, here is the error:\`\`\`json\n{\n\t"ok": false,\n\t"response": "${settingResponse.response}"\n}\n\`\`\``);
        }

        return message.reply(`successfully set authorization level for player ${player} to ${authlvl.toUpperCase()}.`);
    }
}
