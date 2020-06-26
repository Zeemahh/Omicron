import { Command, CommandoClient } from 'discord.js-commando';
import { HSGMessage } from '../../utils/classes/HSGMessage';
import { MESSAGES } from '../../utils/constants';
import { HSGMember } from '../../utils/classes/HSGMember';
import { TextChannel } from 'discord.js';

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
        const formattedMessage = `**Message from SMRE Officials**\n\n${msg.substr(0, 1967)}`;
        const loggingChannel = <TextChannel> message.guild.channels.cache.get('717416275978092604');
        let shouldLog = true;

        if (execMember.id === member.id || this.client.user.id === member.id) {
            let reply = 'You cannot use this command on yourself.';
            if (this.client.user.id === member.id) {
                reply = 'I cannot DM myself.';
            }

            return message.say(reply);
        }

        if (!loggingChannel) {
            shouldLog = false;
        }

        member.send(formattedMessage)
            .then(_ => {
                if (shouldLog) {
                    const prefix = `${message.author.toString()} sent a message to ${member.user.toString()} through the bot:\n\n`;
                    loggingChannel.send(`${prefix}${msg.substr(0, 2000 - prefix.length)}`);
                }
            })
            .catch(_ => {
                if (shouldLog) {
                    loggingChannel.send(`${message.author.toString()}, I could not send a message to ${member.user.toString()} because of their privacy settings.`);
                }
            });
    }
}
