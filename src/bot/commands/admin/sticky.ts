import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { client as cli } from '../../bot';
import { Message } from 'discord.js';

export interface StickyData {
    state: boolean;
    channelId?: string;
    messageId?: string;
    authorId?: string;
    message?: string;
}

let sticky: StickyData = {
    state: false
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
            userPermissions: ['MANAGE_MESSAGES'],
            examples: [
                `${client.commandPrefix}sticky Some really important message must be stuck to this channel...`
            ]
        });
    }

    public async run(message: CommandoMessage, { text }: { text: string }) {
        sticky.state = true;
        sticky.message = `__**Stickied Message**__\n\n${text}`;
        sticky.channelId = message.channel.id;
        sticky.authorId = message.author.id;

        const stickM = await message.channel.send(sticky.message);

        sticky.messageId = stickM.id;

        return message.delete();
    }
}

export function getStickyData(): StickyData {
    return sticky;
}

export function toggleStickyStatus(): boolean {
    sticky.state = !sticky.state;
    return sticky.state;
}

export function setStickyData(input: StickyData): StickyData {
    sticky = input;
    return sticky;
}
