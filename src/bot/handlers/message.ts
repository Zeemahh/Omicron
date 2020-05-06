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
            '648233415744946187',
            '648233440063389696'
        ]
    },
    {
        id: '682854893228392478',
        emojis: [
            '648233415744946187',
            '648233440063389696'
        ]
    },
    {
        id: '637691756707577858',
        emojis: [
            '556849030475415552',
            '556884658004951055'
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
