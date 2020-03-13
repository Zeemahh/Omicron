import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';

export default class Purge extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'purge',
            group: 'admin',
            memberName: 'purge',
            description: 'Deletes a specific amount of messages.',
            args: [
                {
                    key: 'amount',
                    prompt: 'How many messages do you want me to delete?',
                    type: 'integer'
                }
            ],
            userPermissions: ['MANAGE_MESSAGES']
        });
    }

    public run(message: CommandoMessage, { amount }: { amount: number }) {
        message.delete();
        try {
            message.channel.bulkDelete(amount)
                .then(_ => {
                    return message.reply(`deleted ${amount} messages for you.`)
                    .then(deleteMessage => {
                        if (deleteMessage instanceof Message) {
                            return deleteMessage.delete({
                                timeout: 5000
                            });
                        }
                    });
                })
                .catch(e => {
                    return message.reply('Failed to delete messages.');
                });
        }
        catch(e) {
            return message.reply('Failed to delete messages.');
        }
    }
}