import { client } from '../bot';
import { EmojiResolvable, GuildChannel } from 'discord.js';

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
    if (message.author.bot) {
        return;
    }

    for (const [ key, value ] of Object.entries(suggestionInfo)) {
        if ((typeof value.id === 'string' && value.id === message.channel.id) || (Array.isArray(value.id) && value.id.includes(message.channel.id))) {
            for (const [ _, emoji ] of Object.entries(value.emojis)) {
                await message.react(emoji);
            }
        }
    }
});
