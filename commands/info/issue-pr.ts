import { Command } from 'discord-akairo';
import { MESSAGES } from '../../utils/constants';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import fetch from 'node-fetch';

const { GITHUB_API_KEY } = process.env;

export default class GithubPRORIssue extends Command {
    constructor() {
        super('gh-issue-pr', {
            aliases: [ 'gh-issue-pr', 'issue-pr', 'gh-pr', 'gh-issue' ],
            description: {
                content: MESSAGES.COMMANDS.GITHUB_ISSUE_PR.DESCRIPTION,
                usage: '<pr/issue>',
                examples: [ '1', '24', '100' ]
            },
            regex: /\b(g|gh|hsg-rp|core|hsg-bot|bot)#(\d+)/i,
            category: 'github',
            channel: 'guild',
            clientPermissions: [ 'EMBED_LINKS' ],
            ratelimit: 2,
            args: [
                {
                    id: 'pr_issue',
                    match: 'content',
                    type: 'number'
                }
            ]
        });
    }

    public async exec(message: Message, args: any) {
        if (!GITHUB_API_KEY) {
            return message.util?.reply(MESSAGES.COMMANDS.GITHUB_ISSUE_PR.NO_GITHUB_API_KEY);
        }

        const owner = 'highspeed-gaming';
        let repo;
        if (args.match?.[1] === 'g' || !args.match) {
            repo = 'hsg-rp';
        }
        if (args.match?.[1] !== 'g') {
            switch (args.match[1]) {
                case 'bot':
                    repo = 'hsg-bot';
                    break;
                case 'hsg-rp':
                case 'core':
                    repo = 'hsg-rp';
                    break;
            }
        }

        const num = args.match?.[2] || args.pr_issue;
        const query = `
			{
				repository(owner: "${owner}", name: "${repo}") {
					name
					issueOrPullRequest(number: ${num}) {
						... on PullRequest {
							comments {
								totalCount
							}
							commits(last: 1) {
								nodes {
									commit {
										oid
									}
								}
							}
							author {
								avatarUrl
								login
								url
							}
							body
							labels(first: 10) {
								nodes {
									name
								}
							}
							merged
							number
							publishedAt
							state
							title
							url
						}
						... on Issue {
							comments {
								totalCount
							}
							author {
								avatarUrl
								login
								url
							}
							body
							labels(first: 10) {
								nodes {
									name
								}
							}
							number
							publishedAt
							state
							title
							url
						}
					}
				}
			}
		`;
        let body;
        try {
            const res = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: { Authorization: `Bearer ${GITHUB_API_KEY}` },
                body: JSON.stringify({ query }),
            });
            body = await res.json();
        } catch (error) {
            return message.util?.reply(MESSAGES.COMMANDS.GITHUB_ISSUE_PR.FAILURE);
        }

        if (!body?.data?.repository?.issueOrPullRequest) {
            return message.util?.reply(MESSAGES.COMMANDS.GITHUB_ISSUE_PR.FAILURE);
        }
        const d = body.data.repository.issueOrPullRequest;
        const embed = new MessageEmbed()
            .setColor(d.merged ? 0x9c27b0 : d.state === 'OPEN' ? 0x43a047 : 0xef6c00)
            .setAuthor(d.author?.login ?? 'Unknown', d.author?.avatarUrl ?? '', d.author?.url ?? '')
            .setTitle(d.title)
            .setURL(d.url)
            .setDescription(`${d.body.substring(0, 500)} ...`)
            .addField('State', d.state, true)
            .addField('Comments', d.comments.totalCount, true)
            .addField('Repo & Number', `${body.data.repository.name}#${d.number}`, true)
            .addField('Type', d.commits ? 'PULL REQUEST' : 'ISSUE', true)
            .addField(
                'Labels',
                d.labels.nodes.length ? d.labels.nodes.map((node: { name: string }) => node.name) : 'NO LABEL(S)',
                true,
            )
            .setThumbnail(d.author?.avatarUrl ?? '')
            .setTimestamp(new Date(d.publishedAt));

        if (
            !(message.channel as TextChannel)
                .permissionsFor(message.guild.me ?? '')
                ?.has([ 'ADD_REACTIONS', 'MANAGE_MESSAGES' ], false)
        ) {
            return message.util?.send(embed);
        }
        const msg = await message.util?.send(embed);
        if (!msg) return message;
        await msg.react('🗑');
        let react;
        try {
            react = await msg.awaitReactions(
                (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
                { max: 1, time: 10000, errors: [ 'time' ] },
            );
        } catch (error) {
            msg.reactions.removeAll();

            return message;
        }
        react.first()?.message.delete();

        return message;
    }
}