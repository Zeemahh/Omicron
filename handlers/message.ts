import { client } from '../bot';
import { EmojiResolvable, MessageEmbed, Snowflake, TextChannel } from 'discord.js';
// import { getStickyData, setStickyData } from '../commands/admin/sticky';
import fetch from 'node-fetch';
import { urlRegex, IMessageStruct } from '../utils/functions';

const autoReactions: {
    id: string | string[],
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
    },
    {
        id: '637693632585007161',
        emojis: [
            '556849030475415552',
            '556884658004951055'
        ]
    }
];


client.on('message', async (message) => {
    // const stickyData = getStickyData();
    // const isStickyMessage = stickyData.state && message.channel.id === stickyData?.channelId;
    const isDm = message.channel.type === 'dm';

    if (!isDm) {
        // if (isStickyMessage) {
        //     if (message.author.bot && message.content === stickyData.message) {
        //         return;
        //     }
        //
        //     const fMessage = message.channel.messages.cache.get(stickyData.messageId);
        //
        //     if (fMessage) {
        //         fMessage.delete();
        //     }
        //
        //     const stickMessage = await message.channel.send(stickyData.message);
        //
        //     stickyData.messageId = stickMessage.id;
        //     setStickyData(stickyData);
        // }

        for (const [ , value ] of Object.entries(autoReactions)) {
            if ((typeof value.id === 'string' && value.id === message.channel.id) || (Array.isArray(value.id) && value.id.includes(message.channel.id))) {
                for (const [ , emoji ] of Object.entries(value.emojis)) {
                    await message.react(emoji);
                }
            }
        }

        let topic = 'message';
        let color = '#7289DA';

        const strSplit = message.content.split(urlRegex);

        // message referencing
        if (strSplit.length < 8 && strSplit.length > 5) {
            let count = 3;

            const guildId = strSplit[count++];
            const channelId = strSplit[count++];
            const messageId = strSplit[count++];
            const msg = await fetch(`https://discordapp.com/api/channels/${channelId}/messages/${messageId}`, {
                headers: {
                    Authorization: `Bot ${client.token}`
                }
            });

            // no message found :(
            if (msg.status === 404) {
                return;
            }

            const result: IMessageStruct = await msg.json();

            const isBleet = (message.guild.id === '543759160244830208' && message.channel.id === '637691756707577858') && channelId === '637691756707577858';
            const isSuggestion = channelId === '552648193737883648' || channelId === '637693632585007161' || channelId === '682854893228392478';

            if (isBleet) {
                topic = 'Bleet';
                color = '#34A259';
            }

            if (isSuggestion) {
                topic = 'suggestion';
                color = '#7440D3';
            }

            // if channel is not found in this guild, return!
            const owningChannel = <TextChannel> message.guild.channels.cache.get(result.channel_id);
            if (!owningChannel) {
                return;
            }

            const fetchReactionCountForId = (id: Snowflake) => {
                if (!result.reactions) {
                    return NaN;
                }

                let occurrence = -1;
                for (const [ , react ] of Object.entries(result.reactions)) {
                    if (react.emoji.id === id) {
                        occurrence += react.count;
                        break;
                    }
                }

                return occurrence;
            };

            const messageCollection = await owningChannel.messages.fetch();
            const foundMessage = messageCollection.find(m => m.id === result.id);

            if (foundMessage) {
                await foundMessage.react('⏩');
            }

            const rebleets = fetchReactionCountForId('556849030475415552');
            const likes = fetchReactionCountForId('556884658004951055');

            const embed = new MessageEmbed()
                .setAuthor(`${result.author.username}#${result.author.discriminator} | User ${message.author.username} referenced a ${topic}`, `https://cdn.discordapp.com/avatars/${result.author.id}/${result.author.avatar}.webp`)
                .setTimestamp(result.timestamp)
                .setColor(color);

            const messageUrl = `https://discordapp.com/channels/${guildId}/${channelId}/${messageId}`;
            if (result?.content.length) {
                embed.setDescription(`${result.content}\n\n[Jump to Message](${messageUrl})`);
            } else if (result?.embeds.length && result.embeds[0].description.length) {
                embed.setDescription(`${result.embeds[0].description}...\`\n\n[Full Message](${messageUrl})`);
            }

            embed.setFooter('Discord', 'https://i.imgur.com/7hUUou6.png');
            if (isBleet) {
                embed.addField('Rebleets', !isNaN(rebleets) ? rebleets : 'No data collected.', true);
                embed.addField('Likes', !isNaN(likes) ? likes : 'No data collected.', true);
                embed.setFooter('Bleeter', 'https://i.imgur.com/1I0ZDcs.jpg');
            } else if (isSuggestion) {
                const upVotes = fetchReactionCountForId('648233415744946187');
                const downVotes = fetchReactionCountForId('648233440063389696');
                if (!isNaN(upVotes)) {
                    embed.addField('Upvotes', upVotes, true);
                }

                if (!isNaN(downVotes)) {
                    embed.addField('Downvotes', downVotes, true);
                }
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
                } else {
                    embed.addField('Attachment', result.attachments[0].url);
                }
            }

            message.channel.send(embed)
                .catch(e => {
                    console.log(e);
                });
        }
    }
});
