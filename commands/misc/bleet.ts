import { Command } from 'discord-akairo';
import { HMessage } from '../../utils/classes/HMessage';
import { MESSAGES } from '../../utils/constants';

export default class Bleet extends Command {
    // constructor() {
    //     super(client, {
    //         name: 'bleet',
    //         group: 'misc',
    //         memberName: 'docs',
    //         description: MESSAGES.COMMANDS.BLEET.DESCRIPTION,
    //         args: [
    //             {
    //                 key: 'msg',
    //                 prompt: 'What do you want to Bleet?',
    //                 type: 'string'
    //             }
    //         ],
    //         userPermissions: [ 'MANAGE_MESSAGES' ]
    //     });
    // }

    public constructor() {
        super('bleet', {
            aliases: [ 'bleet' ],
            description: {
                content: MESSAGES.COMMANDS.BLEET.DESCRIPTION
            },
            category: 'info',
            channel: 'guild',
            args: [
                {
                    id: 'msg',
                    type: 'string',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.BLEET.PROMPT.START(message.author)
                    },
                    match: 'content'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            clientPermissions: [ 'EMBED_LINKS' ]
        });
    }

    public async exec(message: HMessage, { msg }: { msg: string }) {
        if (message.guild.id !== '543759160244830208' || message.channel.id !== '637691756707577858') {
            return;
        }

        await message.delete();

        return message.util?.send(`**@TW@_SysAdmin**\n\n${msg}`);
    }
}
