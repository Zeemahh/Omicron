import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import {getAuthLvlFromMember, hsgRoleMap} from '../../utils/functions';
import handleDiscordToGameChat from '../../utils/async/handleGameChats';
import { TextChannel } from 'discord.js';

export default class AlvlSet extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'ar',
            group: 'admin',
            memberName: 'ar',
            description: MESSAGES.COMMANDS.ADMIN_CHAT_RESTR.DESCRIPTION,
            args: [
                {
                    key: 'content',
                    prompt: 'The content of the message you wish to send.',
                    type: 'string',
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}ar hello, guys!`
            ]
        });
    }

    public async run(message: CommandoMessage, { content }: { content: string }) {
        const currentAuth = getAuthLvlFromMember(message.member);

        if (currentAuth.rank < hsgRoleMap.A3.rank) {
            return;
        }

        message.delete();

        const response = await handleDiscordToGameChat({
            member: message.member,
            chatChannel: 'AR',
            content
        });

        if (!response.ok) {
            return message.reply(`something went wrong with the request, here is the error: \`\`\`json\n{\n\t"ok": false,\n\t"response": "${response.response}"${response.code ? `,\n\t"code": ${response.code}\n` : '\n'}}\`\`\``);
        }

        const formattedResponse = `\`(COM-A) (A3+) ${message.member.user.tag} / ${currentAuth.acronym}: ${content.replace('`', '')}\``;
        const responseChannel = message.guild.channels.cache.get('714863947982831616');
        if (!responseChannel || !(responseChannel instanceof TextChannel)) {
            return message.say(formattedResponse);
        }

        return responseChannel.send(formattedResponse);
    }
}
