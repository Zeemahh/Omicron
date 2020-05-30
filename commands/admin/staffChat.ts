import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import {getAuthLvlFromMember, hsgRoleMap} from '../../utils/functions';
import handleDiscordToGameChat from '../../utils/async/handleGameChats';
import { TextChannel } from 'discord.js';

export default class AlvlSet extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'sc',
            group: 'admin',
            memberName: 'sc',
            description: MESSAGES.COMMANDS.STAFF_CHAT.DESCRIPTION,
            args: [
                {
                    key: 'content',
                    prompt: 'The content of the message you wish to send.',
                    type: 'string',
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}sc hello, guys!`
            ]
        });
    }

    public async run(message: CommandoMessage, { content }: { content: string }) {
        const currentAuth = getAuthLvlFromMember(message.member);

        if (currentAuth.rank < hsgRoleMap.GS.rank) {
            return;
        }

        message.delete();

        const response = await handleDiscordToGameChat({
            member: message.member,
            chatChannel: 'SC',
            content
        });

        if (!response.ok) {
            return message.reply(`something went wrong with the request, here is the error: \`\`\`json\n{\n\t"ok": false,\n\t"response": "${response.response}"${response.code ? `,\n\t"code": ${response.code}\n` : '\n'}}\`\`\``);
        }

        const formattedResponse = `\`(COM-SC) (G) ${message.member.user.tag} / ${currentAuth.acronym}: ${content.replace('`', '')}\``;
        const responseChannel = message.guild.channels.cache.get('714864203105828866');
        if (!responseChannel || !(responseChannel instanceof TextChannel)) {
            return message.say(formattedResponse);
        }

        return responseChannel.send(formattedResponse);
    }
}