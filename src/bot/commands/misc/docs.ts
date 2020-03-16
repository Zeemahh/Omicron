import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as qs from 'querystring';
import fetch from 'node-fetch';
import { Message, MessageEmbed } from 'discord.js';

const SOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.5-dev', 'collection'];

export default class Docs extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'docs',
            group: 'information',
            memberName: 'docs',
            description: 'Queries arguments for results from Discord.js documentation.',
            args: [
                {
                    key: 'query',
                    prompt: 'What do you want to query?',
                    type: 'string'
                }
            ],
            ownerOnly: true
        });
    }

    public async run(message: CommandoMessage, { query }: { query: string }) {
        const q = query.split(' ');
        const docs = 'stable';
        const source = SOURCES.includes(q.slice(-1)[0]) ? q.pop() : docs;

        const queryString = qs.stringify({
            src: source,
            q: q.join(' '),
            force: true
        });

        console.log(queryString);

        const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
        const embed = new MessageEmbed(await res.json());

        if (!embed) {
            return message.reply('something failed when obtaining data.');
        }

        const msg = await message.say(embed);

        if (!msg || !(msg instanceof Message)) return msg;

        msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 5000, errors: ['time'] },
			);
		} catch (error) {
			msg.reactions.removeAll();

			return msg;
        }

        react.first()?.message.delete();

        return msg;
    }
}
