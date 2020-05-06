import { client } from '../bot';
import { EmojiResolvable, MessageEmbed, Snowflake } from 'discord.js';
import { getStickyData, setStickyData } from '../commands/admin/sticky';
import fetch from 'node-fetch';

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
    },
    {
        id: '682854893228392478',
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

    // Bleet referencing
    // could also probably change this to use this for any message and not just bleets
    if ((message.guild.id === '543759160244830208' && message.channel.id === '637691756707577858') || message.channel.id === '521069746368806922') {
        const urlRegex = /https:\/\/((canary|ptb).)?discordapp.com\/channels\/(\d{18})\/(\d{18})\/(\d{18})/g;
        const strSplit = message.content.split(urlRegex);
        if (strSplit.length < 8 && strSplit.length > 5) {
            let count = 3;
            const diffBuild = (strSplit[2] === 'canary' || strSplit[2] === 'ptb') ? strSplit[2] : null;

            const guildId = strSplit[count++];
            const channelId = strSplit[count++];
            const messageId = strSplit[count++];
            const msg = await fetch(`https://discordapp.com/api/channels/${channelId}/messages/${messageId}`, {
                headers: {
                    Authorization: `Bot ${process.env.BOT_TOKEN}`
                }
            });

            const result: {
                id: Snowflake;
                type: number;
                content: string;
                channel_id: string;
                author: {
                    id: Snowflake;
                    username: string;
                    avatar: string;
                    discriminator: string;
                    public_flags: number;
                },
                attachments: {
                    id: Snowflake;
                    filename: string;
                    size: number;
                    url: string;
                    proxy_url: string;
                    width: number;
                    height: number;
                }[];
                embeds: string[];
                mentions: string[];
                mention_roles: string[];
                pinned: boolean;
                mention_everyone: boolean;
                tts: boolean;
                timestamp: Date;
                edited_timestamp: Date | null;
                flags: number;
                reactions: {
                    emoji: {
                        id: Snowflake;
                        name: string;
                    };
                    count: number;
                    me: boolean;
                }[];
            } = await msg.json();

            let rebleets = result.reactions?.filter(r => r.emoji.id === '556849030475415552').length;
            let likes = result.reactions?.filter(r => r.emoji.id === '556884658004951055').length;

            if (!isNaN(rebleets)) {
                rebleets -= 1;
            }

            if (!isNaN(likes)) {
                likes -= 1;
            }

            const embed = new MessageEmbed()
                .setAuthor(`${result.author.username}#${result.author.discriminator} | User ${message.author.username} referenced a Bleet`, `https://cdn.discordapp.com/avatars/${result.author.id}/${result.author.avatar}.webp`)
                .setColor('#34A259')
                .setDescription(result.content)
                .addField('Rebleets', !isNaN(rebleets) ? rebleets : 'No data collected.', true)
                .addField('Likes', !isNaN(likes) ? likes : 'No data collected.', true)
                .addField('Jump to Message', `https://discordapp.com/channels/${guildId}/${channelId}/${messageId}`)
                .setTimestamp(result.timestamp)
                .setFooter('Bleeter', 'https://i.imgur.com/1I0ZDcs.jpg');

            if (result.attachments.length) {
                const fileExtension = result.attachments[0].url.substring(result.attachments[0].url.length - 3);
                const allowedExtensions = [
                    'png',
                    'jpg',
                    'jpeg',
                    'webp'
                ];

                if (allowedExtensions.find(i => i === fileExtension)) {
                    embed.setImage(result.attachments[0].url);
                }
            }

            message.channel.send(embed);
        }
    }
});
