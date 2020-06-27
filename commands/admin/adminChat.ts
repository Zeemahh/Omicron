import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import { getAuthLvlFromMember, hsgRoleMap } from '../../utils/functions';
import handleDiscordToGameChat from '../../utils/async/handleGameChats';
import { TextChannel } from 'discord.js';

export default class AlvlSet extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'ag',
            group: 'admin',
            memberName: 'ag',
            description: MESSAGES.COMMANDS.ADMIN_CHAT.DESCRIPTION,
            args: [
                {
                    key: 'content',
                    prompt: 'The content of the message you wish to send.',
                    type: 'string',
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}ag hello, guys!`
            ]
        });
    }

    public async run(message: CommandoMessage, { content }: { content: string }) {
        const currentAuth = getAuthLvlFromMember(message.member);

        if (currentAuth.rank < hsgRoleMap.A1.rank) {
            return;
        }

        message.delete();

        const response = await handleDiscordToGameChat({
            member: message.member,
            chatChannel: 'AG',
            content
        });

        if (!response.ok) {
            return message.reply(`something went wrong with the request, here is the error: \`\`\`json\n{\n\t"ok": false,\n\t"response": "${response.response}"${response.code ? `,\n\t"code": ${response.code}\n` : '\n'}}\`\`\``);
        }

        const formattedResponse = `\`(COM-A) (G) ${message.member.user.tag} / ${currentAuth.acronym}: ${content.replace('`', '')}\``;
        const responseChannel = message.guild.channels.cache.get('714863790466007090');
        if (!responseChannel || !(responseChannel instanceof TextChannel)) {
            return message.say(formattedResponse);
        }

        return responseChannel.send(formattedResponse);
    }
}
