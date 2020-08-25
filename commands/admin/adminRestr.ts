import { Command } from 'discord-akairo';
import { MESSAGES } from '../../utils/constants';
import { Message, TextChannel } from 'discord.js';
import { getAuthLvlFromMember, hsgRoleMap } from '../../utils/functions';
import handleDiscordToGameChat, { formatError } from '../../utils/async/handleGameChats';

export default class AdminChatRestr extends Command {
    public constructor() {
        super('ar', {
            aliases: [ 'ar' ],
            description: {
                content: MESSAGES.COMMANDS.ADMIN_CHAT_RESTR.DESCRIPTION,
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
                        start: (message: Message) => MESSAGES.COMMANDS.ADMIN_CHAT_RESTR.PROMPT.START(message.author)
                    },
                    match: 'rest'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async exec(message: Message, { content }: { content: string }) {
        const currentAuth = getAuthLvlFromMember(message.member);

        if (currentAuth.rank < hsgRoleMap.A3.rank) {
            return;
        }

        await message.delete();

        const response = await handleDiscordToGameChat({
            member: message.member,
            chatChannel: 'AR',
            content
        });

        if (!response.ok) {
            return message.reply(`something went wrong with the request, here is the error: ${formatError({ ok: false, response: response.response, code: response.code ?? null })}`);
        }

        const formattedResponse = `\`(COM-A) (A3+) ${message.member.user.tag} / ${currentAuth.acronym}: ${content.replace('`', '')}\``;
        const responseChannel = message.guild.channels.cache.get('714863947982831616');
        if (!responseChannel || !(responseChannel instanceof TextChannel)) {
            return message.util?.send(formattedResponse);
        }

        return responseChannel.send(formattedResponse);
    }
}