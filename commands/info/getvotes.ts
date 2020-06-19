import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
// import { IMessageStruct } from '../../utils/functions';
import fetch from 'node-fetch';
import { Channel, Message, TextChannel, MessageEmbed, ReactionManager } from 'discord.js';
import { timeLog, IMessageStruct } from '../../utils/functions';

export default class GetVotes extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'getvotes',
            group: 'information',
            aliases: [ 'votes', 'gv' ],
            memberName: 'getvotes',
            description: MESSAGES.COMMANDS.GET_VOTES.DESCRIPTION,
            args: [
                {
                    key: 'messageId',
                    prompt: 'The ID of the message.',
                    type: 'string',
                    validate: (input: string) => input.length === 18
                },
                {
                    key: 'channel',
                    prompt: 'The channel that this message belongs to.',
                    type: 'channel',
                    default: (msg: CommandoMessage) => msg.id
                },
                {
                    key: 'allowedVotes',
                    prompt: 'How many votes should be counted per person?',
                    type: 'integer',
                    default: 1
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async run(message: CommandoMessage, { messageId, channel, allowedVotes }: { messageId: string, channel: Channel, allowedVotes: number }) {
        const req = await fetch(`https://discordapp.com/api/channels/${channel.id}/messages/${messageId}`, {
            headers: {
                Authorization: `Bot ${this.client.token}`
            }
        });
        // const res = new Message(this.client, await req.json(), <TextChannel> channel);
        const res: IMessageStruct = await req.json();

        timeLog(`channel ID for found message: ${channel.id}`);

        if (req.status === 404) {
            return message.say(`Could not find message with ID ${messageId} (channel: ${channel.id}) in this guild.`);
        }

        const reactions = new ReactionManager(new Message(this.client, res, <TextChannel> channel)).cache;
        if (!reactions) {
            return message.say('There are no reactions for that message.');
        }

        const totalReactCounter: {
            [key: string]: number
        } = {};

        const emojiCounter: {
            [key: string]: any
        } = {
            *[Symbol.iterator]() {
                for (const i of Object.keys(this)) {
                    yield [ i, this[i] ];
                }
            }
        };

        timeLog(`reactions: ${JSON.stringify(reactions.toJSON())}`);
        reactions.forEach(react => {
            timeLog(`users in reaction: ${JSON.stringify(react.users.cache.toJSON())}`);
            react.users.cache.forEach(user => {
                if (totalReactCounter[user.id] === undefined) {
                    totalReactCounter[user.id] = 0;
                }

                totalReactCounter[user.id] += 1;

                if (totalReactCounter[user.id] < allowedVotes) {
                    emojiCounter[react.emoji.id] += 1;
                }
            })
        })

        const embed = new MessageEmbed()
            .setTitle('Reaction Counter')
            .setDescription(`This shows an accurate number for each reaction on this message, only counting ${allowedVotes} per user.`)
            .setColor('#e67e22')
            .setTimestamp();

        for (const reaction of emojiCounter as any) {
            timeLog(`This emoji: ${reaction}`);
            const thisReaction = emojiCounter[reaction];
            const foundReact = this.client.emojis.cache.find(emoji => emoji.id === reaction);
            embed.addField(`Total number of reactions for emoji <:${foundReact.name}:${foundReact.id}>`, thisReaction);
        }

        return message.say(embed);
    }
}
