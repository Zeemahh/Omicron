import { Command, CommandoClient } from 'discord.js-commando';
import { HSGMessage } from '../../utils/classes/HSGMessage';
import { MESSAGES } from '../../utils/constants';
import { HSGMember } from '../../utils/classes/HSGMember';

export default class DM extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'dm',
            group: 'admin',
            memberName: 'dm',
            description: MESSAGES.COMMANDS.DM.DESCRIPTION,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member?',
                    type: 'member'
                },
                {
                    key: 'msg',
                    prompt: 'What would you like to send?',
                    type: 'string'
                }
            ],
            userPermissions: [ 'KICK_MEMBERS' ],
            examples: [
                `${client.commandPrefix}dm @Zeemah hello`
            ]
        });
    }

    public run(message: HSGMessage, { member, msg }: { member: HSGMember, msg: string }) {
        const execMember = message.member;
        const formattedMessage = `**Message from SMRE Officials**\n\n${msg}`;

        if (execMember.id === member.id) {
            return message.say('You cannot use this command on yourself.');
        }

        member.send(formattedMessage)
            .then(_ => {
                message.loggingChannel.send(`${message.author.toString()} sent a message to ${member.user.toString()} through the bot:\n\n${msg}`);
            })
            .catch(_ => {
                message.loggingChannel.send(`${message.author.toString()}, I could not send a message to ${member.user.toString()} because of their privacy settings.`);
            });
    }
}
