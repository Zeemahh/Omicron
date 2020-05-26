import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import { hsgAuthsShort, getAuthLvlFromMember, getAuthLvlFromAcronym, hsgRoleMap } from '../../utils/functions';
import fetch from 'node-fetch';
import { getApiKeyForAuth, API_ENDPOINT, API_TIMEOUT, isLocalServer } from '../../config';

export default class ServerLock extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'serverlock',
            group: 'admin',
            memberName: 'serverlock',
            description: MESSAGES.COMMANDS.SERVER_LOCK.DESCRIPTION,
            args: [
                {
                    key: 'auth',
                    prompt: 'The authorization level you want to lock to.',
                    type: 'string',
                    oneOf: hsgAuthsShort.concat('clear')
                },
                {
                    key: 'hide',
                    prompt: 'Hide the global announcement?',
                    type: 'string',
                    default: ''
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}pinfo 521`,
                `${client.commandPrefix}pinfo 264662751404621825`
            ]
        });
    }

    public async run(message: CommandoMessage, { auth, hide }: { auth: string, hide: string }) {
        const currentAuthLvl = getAuthLvlFromMember(message.member);
        const changingAuth = getAuthLvlFromAcronym(auth.toUpperCase());
        const showGlobally = hide !== '-h';
        const apiKey = getApiKeyForAuth(currentAuthLvl);

        if (!apiKey || currentAuthLvl.rank < hsgRoleMap.A2.rank) {
            return message.reply('you cannot execute this command.');
        }

        if (currentAuthLvl.rank < changingAuth.rank) {
            return message.reply('cannot lock to higher authorization level than self.');
        }

        const response = await fetch(`http://${API_ENDPOINT}/${isLocalServer() ? 'hsg-server' : 'hsg-rp'}/serverLock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': apiKey
            },
            timeout: API_TIMEOUT ?? 5000,
            body: JSON.stringify({
                authLvl: changingAuth.acronym,
                adminDets: {
                    name: `${message.author.tag}`,
                    authLvl: currentAuthLvl.acronym
                },
                hide: !showGlobally
            })
        });

        const moreResponse = await response.json();

        if (!moreResponse.ok) {
            console.log(moreResponse.response);
            return message.reply(`something went wrong, uh oh! Here is the error: \`\`\`json\n{\n\t"ok": false,\n\t"response": "${moreResponse.response}"\n}\`\`\``);
        }

        let endString = `successfully ${changingAuth.acronym === 'CR' ? 'un' : ''}restricted server`;
        if (changingAuth.rank > hsgRoleMap.CU.rank) {
            endString += ` to authorization level [ ${changingAuth.acronym} ]`;
        }
        endString += '.';

        return message.reply(endString);
    }
}
