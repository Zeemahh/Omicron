import { client } from '../bot';
import { EmojiResolvable } from 'discord.js';
import { getStickyData, setStickyData } from '../commands/admin/sticky';

const suggestionInfo: {
    id: string|string[],
    emojis: EmojiResolvable[]
}[] = [
    {
        id: '552648193737883648',
        emojis: [
            '519912214761570305',
            '619413043792707606'
        ]
    }
];

client.on('message', async (message) => {
    const stickyData = getStickyData();
    const isStickyMessage = stickyData.state && message.channel.id === stickyData?.channelId;

    if (message.author.bot && !isStickyMessage) {
        return;
    }

    if (isStickyMessage) {
        const fMessage = message.channel.messages.cache.get(stickyData.messageId);

        if (fMessage) {
            fMessage.delete();
        }

        const stickMessage = await message.channel.send(stickyData.message);

        stickyData.messageId = stickMessage.id;
        setStickyData(stickyData);
    }

    for (const [ key, value ] of Object.entries(suggestionInfo)) {
        if ((typeof value.id === 'string' && value.id === message.channel.id) || (Array.isArray(value.id) && value.id.includes(message.channel.id))) {
            for (const [ _, emoji ] of Object.entries(value.emojis)) {
                await message.react(emoji);
            }
        }
    }
});
