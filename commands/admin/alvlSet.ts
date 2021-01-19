import { Command } from 'discord-akairo';
import { MESSAGES } from '../../utils/constants';
import { hsgAuthsShort, getAuthLvlFromMember, getAuthLvlFromAcronym, hsgRoleMap, IPlayerDataStruct } from '../../utils/functions';
import { getApiKeyForAuth, API_TIMEOUT, API_ENDPOINT, isLocalServer } from '../../config';
import fetch from 'node-fetch';
import { HMessage } from '../../utils/classes/HMessage';

export default class AlvlSet extends Command {
    public constructor() {
        super('alvlset', {
            aliases: [ 'alvlset' ],
            description: {
                content: MESSAGES.COMMANDS.ALVL_SET.DESCRIPTION,
                usage: '<player> <authlvl>',
                examples: [ '13 M2', '95 CR' ]
            },
            category: 'fivem',
            channel: 'guild',
            args: [
                {
                    id: 'player',
                    prompt: {
                        start: 'The server ID of the player you wish to set authorization level for.'
                    },
                    type: 'integer',
                },
                {
                    id: 'authlvl',
                    prompt: {
                        start: 'The authorization level.'
                    },
                    type: hsgAuthsShort
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async exec(message: HMessage, { player, authlvl }: { player: number, authlvl: string }) {
        await message.delete();

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
            return message.util?.send(`Something went wrong when attempting to set authorization level for server ID \`${player}\`, here is the error:\`\`\`json\n{\n\t"ok": false,\n\t"response": "${settingResponse.response}"\n}\n\`\`\``);
        }

        return message.util?.send(`Successfully set authorization level for player \`${foundPlayer.name} | ${foundPlayer.id}\` to ${authlvl.toUpperCase()}.`);
    }
}
