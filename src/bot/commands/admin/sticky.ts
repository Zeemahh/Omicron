import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { client as cli } from '../../bot';
import { Message } from 'discord.js';

export interface StickyData {
    enabled: boolean;
    channelId?: string;
    messageId?: string;
    authorId?: string;
    message?: string;
}

const sticky: StickyData = {
    enabled: false
};

export default class Sticky extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'sticky',
            group: 'admin',
            memberName: 'sticky',
            description: 'Sticks a message to the bottom of a channel.',
            args: [
                {
                    key: 'text',
                    prompt: 'What would you like to stick to this channel?',
                    type: 'string'
                }
            ],
            userPermissions: ['MANAGE_MESSAGES']
        });
    }

    public run(message: CommandoMessage, { text }: { text: string }) {
        sticky.enabled = true;
        sticky.message = `__**Stickied Message**__\n\n${text}`;
        sticky.channelId = message.channel.id;
        sticky.authorId = message.author.id;

        message.channel.send(sticky.message)
            .then(newM => {
                sticky.messageId = newM.id;
            })
            .catch(_ => _);

        return message.delete();
    }
}

export function getStickyData(): StickyData {
    return sticky;
}

export function toggleStickyStatus(): boolean {
    sticky.enabled = !sticky.enabled;
    return sticky.enabled;
}

cli.on('message', (message: Message) => {
    if (message.author.bot) {
        return;
    }

    if (sticky.enabled && sticky.channelId && message.channel.id === sticky.channelId) {
        const fMessage: Message = message.channel.messages.cache.get(sticky.messageId);

        if (fMessage) {
            fMessage.delete();
        }

        message.channel.send(sticky.message)
            .then(stick => {
                sticky.messageId = stick.id;
            })
            .catch(_ => _);
    }
});
