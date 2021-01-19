import { Command } from 'discord-akairo';
import { MESSAGES } from '../../utils/constants';
import { TextChannel } from 'discord.js';
import { getAuthLvlFromMember, hsgRoleMap } from '../../utils/functions';
import handleDiscordToGameChat, { formatError } from '../../utils/async/handleGameChats';
import { HMessage } from '../../utils/classes/HMessage';

export default class MemberChat extends Command {
    public constructor() {
        super('mc', {
            aliases: [ 'mc' ],
            description: {
                content: MESSAGES.COMMANDS.MEMBER_CHAT.DESCRIPTION,
                usage: '<content>',
                examples: [ 'hello', 'watch player 4' ]
            },
            category: 'fivem',
            channel: 'guild',
            args: [
                {
                    id: 'content',
                    type: 'string',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.MEMBER_CHAT.PROMPT.START(message.author)
                    },
                    match: 'content'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async exec(message: HMessage, { content }: { content: string }) {
        const currentAuth = getAuthLvlFromMember(message.member);

        if (currentAuth.rank < hsgRoleMap.GS.rank) {
            return;
        }

        await message.delete();

        const response = await handleDiscordToGameChat({
            member: message.member,
            chatChannel: 'MC',
            content
        });

        if (!response.ok) {
            return message.reply(`something went wrong with the request, here is the error: ${formatError({ ok: false, response: response.response, code: response.code ?? null })}`);
        }

        const formattedResponse = `\`(COM-MB) (G) ${message.member.user.tag} / ${currentAuth.acronym}: ${content.replace('`', '')}\``;
        const responseChannel = message.guild.channels.cache.get('714864822046425198');
        if (!responseChannel || !(responseChannel instanceof TextChannel)) {
            return message.util?.send(formattedResponse);
        }

        return responseChannel.send(formattedResponse);
    }
}