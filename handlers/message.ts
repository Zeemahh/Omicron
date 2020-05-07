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

    let topic = 'message';
    let color = '#7289DA';
    const isBleet = (message.guild.id === '543759160244830208' && message.channel.id === '637691756707577858');
    if (isBleet) {
        topic = 'Bleet';
        color = '#34A259';
    }

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

        if (msg.status === 404) {
            return;
        }

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
            embeds: MessageEmbed[];
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

        const fetchReactionCountForId = (id: Snowflake) => {
            if (!result.reactions) {
                return NaN;
            }

            let occurrence = -1;
            for (const [ _, react ] of Object.entries(result.reactions)) {
                if (react.emoji.id === id) {
                    occurrence += react.count;
                    break;
                }
            }

            return occurrence;
        };

        const rebleets = fetchReactionCountForId('556849030475415552');
        const likes = fetchReactionCountForId('556884658004951055');

        const embed = new MessageEmbed()
            .setAuthor(`${result.author.username}#${result.author.discriminator} | User ${message.author.username} referenced a ${topic}`, `https://cdn.discordapp.com/avatars/${result.author.id}/${result.author.avatar}.webp`)
            .setTimestamp(result.timestamp)
            .setColor(color);

        const messageUrl = `https://discordapp.com/channels/${guildId}/${channelId}/${messageId}`;
        if (result.content.length > 0) {
            embed.setDescription(`${result.content}\n\n[Jump to Message](${messageUrl})`);
        } else if (result.embeds.length && result.embeds[0].description) {
            embed.setDescription(`${result.embeds[0].description} \n\n\`[..summary..]\`\n\n[Full Message](${messageUrl})`);
        }

        if (isBleet) {
            embed.addField('Rebleets', !isNaN(rebleets) ? rebleets : 'No data collected.', true);
            embed.addField('Likes', !isNaN(likes) ? likes : 'No data collected.', true);
            embed.setFooter('Bleeter', 'https://i.imgur.com/1I0ZDcs.jpg');
        } else {
            embed.setFooter('Discord', 'https://i.imgur.com/7hUUou6.png');
        }

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

        message.channel.send(embed)
            .catch(e => {
                console.log(e);
            });
    }
});
