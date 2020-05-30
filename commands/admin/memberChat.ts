import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import { getAuthLvlFromMember } from '../../utils/functions';
import handleDiscordToGameChat from '../../utils/async/handleGameChats';
import { TextChannel } from 'discord.js';

export default class AlvlSet extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'mc',
            group: 'admin',
            memberName: 'mc',
            description: MESSAGES.COMMANDS.MEMBER_CHAT.DESCRIPTION,
            args: [
                {
                    key: 'content',
                    prompt: 'The content of the message you wish to send.',
                    type: 'string',
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}mc hello, guys!`
            ]
        });
    }

    public async run(message: CommandoMessage, { content }: { content: string }) {
        message.delete();

        const response = await handleDiscordToGameChat({
            member: message.member,
            chatChannel: 'MC',
            content
        });
        const currentAuth = getAuthLvlFromMember(message.member);

        if (!response.ok) {
            return message.reply(`something went wrong with the request, here is the error: \`\`\`json\n{\n\t"ok": false,\n\t"response": "${response.response}"\n${response.code ? `\t"code": ${response.code}\n` : ''}}\`\`\``);
        }

        const formattedResponse = `\`(COM-MB) (G) ${message.member.user.tag} / ${currentAuth.acronym}: ${content.replace('`', '')}\``;
        const responseChannel = message.guild.channels.cache.get('714864822046425198');
        if (!responseChannel || !(responseChannel instanceof TextChannel)) {
            return message.say(formattedResponse);
        }

        return responseChannel.send(formattedResponse);
    }
}
