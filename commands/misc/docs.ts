import { Command } from 'discord-akairo';
import * as qs from 'querystring';
import fetch from 'node-fetch';
import { Message, MessageEmbed } from 'discord.js';
import { MESSAGES } from '../../utils/constants';
import { HMessage } from '../../utils/classes/HMessage';

const SOURCES = [ 'stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.5-dev', 'collection' ];

export default class Docs extends Command {
    constructor() {
        super('docs', {
            aliases: [ 'docs' ],
            description: {
                content: MESSAGES.COMMANDS.DOCS.DESCRIPTION,
                usage: '<query>',
                examples: [ 'GuildMember#user', 'Guild#members' ]
            },
            category: 'misc',
            args: [
                {
                    id: 'query',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.DOCS.PROMPT.START(message.author)
                    },
                    type: 'string'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public async exec(message: HMessage, { query }: { query: string }) {
        const q = query.split(' ');
        const docs = 'stable';
        const source = SOURCES.includes(q.slice(-1)[0]) ? q.pop() : docs;

        const queryString = qs.stringify({
            src: source,
            q: q.join(' '),
            force: true
        });

        const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
        const embed = new MessageEmbed(await res.json());

        if (!embed) {
            return message.reply('something failed when obtaining data.');
        }

        const msg = await message.util?.send(embed);

        if (!msg || !(msg instanceof Message)) {
            return msg;
        }

        await msg.react('🗑');
        let react;
        try {
            react = await msg.awaitReactions(
                (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
                { max: 1, time: 5000, errors: [ 'time' ] },
            );
        } catch (error) {
            await msg.reactions.removeAll();

            return msg;
        }

        react.first()?.message.delete();

        return msg;
    }
}
