import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class Purge extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'purge',
            group: 'information',
            memberName: 'purge',
            description: 'Deletes a specific amount of messages.',
            args: [
                {
                    key: 'amount',
                    prompt: 'How many messages do you want me to delete?',
                    type: 'integer'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { amount }: { amount: number }) {
        try {
            message.channel.bulkDelete(amount + 1);
        }
        catch(e) {
            console.log(e.stack);
            return message.reply('Failed to delete messages.');
        }

        return message.reply(`deleted ${amount} of messages for you.`);
    }
}