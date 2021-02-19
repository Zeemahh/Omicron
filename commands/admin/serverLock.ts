import { Command } from 'discord-akairo';
import { MESSAGES } from '../../utils/constants';
import { hsgAuthsShort, getAuthLvlFromMember, getAuthLvlFromAcronym, hsgRoleMap } from '../../utils/functions';
import fetch from 'node-fetch';
import { getApiKeyForAuth, API_ENDPOINT, API_TIMEOUT, isLocalServer } from '../../config';
import { HMessage } from '../../utils/classes/HMessage';

export default class ServerLock extends Command {
    public constructor() {
        super('serverlock', {
            aliases: [ 'serverlock' ],
            description: {
                content: MESSAGES.COMMANDS.SERVER_LOCK.DESCRIPTION,
                usage: '<auth>',
                examples: [ 'clear', 'DV' ]
            },
            category: 'fivem',
            channel: 'guild',
            args: [
                {
                    id: 'auth',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.SERVER_LOCK.PROMPT.START(message.author),
                        retry: (message: HMessage) => MESSAGES.COMMANDS.SERVER_LOCK.PROMPT.RETRY(message.author)
                    },
                    type: hsgAuthsShort.concat('clear')
                },
                {
                    id: 'hide',
                    match: 'option',
                    flag: [ '--hide' ]
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async exec(message: HMessage, { auth, hide }: { auth: string, hide: boolean }) {
        const currentAuthLvl = getAuthLvlFromMember(message.member);
        const changingAuth = getAuthLvlFromAcronym(auth.toUpperCase());
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
                hide
            })
        });

        const moreResponse = await response.json();

        if (!moreResponse.ok) {
            console.log(moreResponse.response);
            return message.reply(`something went wrong, uh oh! Here is the error: \`\`\`json\n{\n\t"ok": false,\n\t"response": "${moreResponse.response}"\n}\`\`\``);
        }

        let endString = `successfully ${changingAuth.acronym === 'CR' ? 'un' : ''}restricted server`;
        if (changingAuth.rank > hsgRoleMap.CR.rank) {
            endString += ` to authorization level [ ${changingAuth.acronym} ]`;
        }
        endString += '.';

        return message.reply(endString);
    }
}
