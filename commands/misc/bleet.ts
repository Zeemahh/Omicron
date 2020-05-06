import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';

export default class Bleet extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'bleet',
            group: 'misc',
            memberName: 'docs',
            description: MESSAGES.COMMANDS.BLEET.DESCRIPTION,
            args: [
                {
                    key: 'msg',
                    prompt: 'What do you want to Bleet?',
                    type: 'string'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public run(message: CommandoMessage, { msg }: { msg: string }) {
        if (message.guild.id !== '543759160244830208' || message.channel.id !== '637691756707577858') {
            return;
        }

        return message.say(`**@TW@_SysAdmin**\n\n${msg}`);
    }
}
