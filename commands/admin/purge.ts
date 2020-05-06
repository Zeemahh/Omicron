import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, TextChannel, Collection } from 'discord.js';
import { MESSAGES } from '../../utils/constants';

export default class Purge extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'purge',
            group: 'admin',
            memberName: 'purge',
            description: MESSAGES.COMMANDS.PURGE.DESCRIPTION,
            args: [
                {
                    key: 'amount',
                    prompt: 'How many messages do you want me to delete?',
                    type: 'integer'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}purge 50`
            ]
        });
    }

    public run(message: CommandoMessage, { amount }: { amount: number }) {
        message.delete();
        if (!(message.channel instanceof TextChannel)) {
            return;
        }

        try {
            message.channel.bulkDelete(amount)
                .then(async (_: Collection<string, Message>) => {
                    const deleteMessage = await message.reply(`deleted ${amount} messages for you.`);
                    if (deleteMessage instanceof Message) {
                        return deleteMessage.delete({
                            timeout: 5000
                        });
                    }
                })
                .catch((e: Error) => {
                    return message.reply('Failed to delete messages.');
                });
        } catch (e) {
            return message.reply('Failed to delete messages.');
        }
    }
}
