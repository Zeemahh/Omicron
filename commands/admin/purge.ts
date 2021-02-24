import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { HMessage } from '../../utils/classes/HMessage';
import { MESSAGES } from '../../utils/constants';
import { Delay } from '../../utils/functions';

export default class Purge extends Command {
    public constructor() {
        super('purge', {
            aliases: [ 'purge' ],
            description: {
                content: MESSAGES.COMMANDS.PURGE.DESCRIPTION,
                usage: '<plr> [server]',
                examples: [ '51', '81 S2' ]
            },
            category: 'FiveM',
            channel: 'guild',
            args: [
                {
                    id: 'amount',
                    type: 'integer',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.PURGE.PROMPT.START(message.author),
                        retry: (message: HMessage) => MESSAGES.COMMANDS.PURGE.PROMPT.RETRY(message.author)
                    }
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async exec(message: HMessage, { amount }: { amount: number }) {
        message.delete();
        if (!(message.channel instanceof TextChannel)) {
            return;
        }

        try {
            const deleted = await message.channel.bulkDelete(amount);
            const successfullyDeleted = deleted.size;
            const deleteMessage = await message.reply(`deleted ${successfullyDeleted} messages for you.`);
            if (deleteMessage instanceof Message) {
                await Delay(5000);
                return deleteMessage.delete();
            }
        } catch (e) {
            return message.reply('Failed to delete messages.');
        }
    }
}
