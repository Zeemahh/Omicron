import { Command, CommandoClient } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import { hsgAuthsShort, getAuthLvlFromMember, getAuthLvlFromAcronym, hsgRoleMap, IPlayerDataStruct } from '../../utils/functions';
import { getApiKeyForAuth, API_TIMEOUT, API_ENDPOINT, isLocalServer } from '../../config';
import fetch from 'node-fetch';
import { HSGMessage } from '../../utils/classes/HSGMessage';

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

    public async run(message: HSGMessage, { player, authlvl }: { player: number, authlvl: string }) {
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

        // FIXME use extensive-data.json when fixes are pushed
        const allData = await fetch(`http://${API_ENDPOINT}/players.json`, {
            timeout: API_TIMEOUT
        });

        const parsedData: IPlayerDataStruct[] = await allData.json();

        let foundPlayer: IPlayerDataStruct;
        for (const [ , plr ] of Object.entries(parsedData)) {
            if (plr.id === player) {
                foundPlayer = plr;
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

        return message.say(`Successfully set authorization level for player \`${foundPlayer.name} | ${foundPlayer.id}\` to ${authlvl.toUpperCase()}.`);
    }
}
