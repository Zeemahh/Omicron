import { Command } from 'discord-akairo';
import { HMessage } from '../../utils/classes/HMessage';
import { MESSAGES } from '../../utils/constants';
import { HMember } from '../../utils/classes/HMember';
import { TextChannel } from 'discord.js';
import { Message } from 'discord.js';

export default class DM extends Command {
    public constructor() {
        super('dm', {
            aliases: [ 'dm' ],
            description: {
                content: MESSAGES.COMMANDS.DM.DESCRIPTION,
                usage: '<member> <msg>',
                examples: [ '@zee Hello from Staff' ]
            },
            category: 'staff',
            channel: 'guild',
            args: [
                {
                    id: 'member',
                    type: 'member',
                    prompt: {
                        start: (message: Message) => MESSAGES.COMMANDS.DM.PROMPT.START(message.author)
                    }
                },
                {
                    id: 'msg',
                    type: 'string',
                    prompt: {
                        start: (message: Message) => MESSAGES.COMMANDS.DM.PROMPT.START_2(message.author)
                    }
                }
            ],
            userPermissions: [ 'KICK_MEMBERS' ],
        });
    }

    public exec(message: HMessage, { member, msg }: { member: HMember, msg: string }) {
        const execMember = message.member;
        const formattedMessage = `**Message from SMRE Officials**\n\n${msg.substr(0, 1967)}`;
        const loggingChannel = <TextChannel> message.guild.channels.cache.get('717416275978092604');
        let shouldLog = true;

        if (execMember.id === member.id || this.client.user.id === member.id) {
            let reply = 'You cannot use this command on yourself.';
            if (this.client.user.id === member.id) {
                reply = 'I cannot DM myself.';
            }

            return message.util?.send(reply);
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
