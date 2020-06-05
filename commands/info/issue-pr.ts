import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { MESSAGES } from '../../utils/constants';
import { timeLog, LogGate } from '../../utils/functions';

// full credit: https://github.com/Naval-Base/yukikaze/blob/master/src/bot/commands/github/issue-pr.ts
// this code is completely based off this, only changed to work with djs-commando :)
// thank you.

const { GITHUB_API_KEY } = process.env;

export default class GitHubPROrIssue extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'gh-issue-pr',
            aliases: [ 'gh-issue-pr', 'issue-pr', 'gh-pr', 'gh-issue' ],
            group: 'information',
            memberName: 'gh-issue-pr',
            description: MESSAGES.COMMANDS.GITHUB_ISSUE_PR.DESCRIPTION,
            userPermissions: [ 'MANAGE_MESSAGES' ],
            clientPermissions: [ 'EMBED_LINKS' ],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'pr_issue',
                    prompt: 'The ID of the issue or PR.',
                    type: 'integer'
                },
                {
                    key: 'repo',
                    prompt: 'What repository?',
                    type: 'string',
                    oneOf: [
                        'client',
                        'server',
                        'dev'
                    ],
                    default: 'dev'
                }
            ],
            examples: [
                `${client.commandPrefix}issue-pr 5`,
                `${client.commandPrefix}gh-issue-pr 2`
            ]
        });
    }

    public async run(message: CommandoMessage, args: any) {
        if (!GITHUB_API_KEY) {
            return message.say('no GH api key set :(');
        }

        let owner;
        let repo;

        switch (args.repo) {
            case 'client':
                owner = 'HighSpeed-Gaming';
                repo = 'hsg-client';
                break;
            case 'server':
                owner = 'Zeemahh';
                repo = 'hsg-server';
                break;
            case 'dev':
            default:
                owner = 'HighSpeed-Gaming';
                repo = 'dev_updates';
                break;
        }

        timeLog(JSON.stringify(args), LogGate.Development);

        let num = args.pr_issue;
        num = parseInt(num, null);
        timeLog(`${typeof num} ${num}`, LogGate.Development);

        if (typeof num !== 'number' || num === 0) {
            return message.reply('expected type number for issue/PR #.');
        }

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
                headers: {
                    Authorization: `Bearer ${GITHUB_API_KEY}`
                },
                body: JSON.stringify({ query })
            });
            body = await res.json();
        } catch (error) {
            timeLog(error.toString(), LogGate.Development);
            return message.reply(MESSAGES.COMMANDS.GITHUB_ISSUE_PR.FAILURE);
        }

        if (!body?.data?.repository?.issueOrPullRequest) {
            timeLog('something went wrong here', LogGate.Development);
            return message.reply(MESSAGES.COMMANDS.GITHUB_ISSUE_PR.FAILURE);
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
                d.labels.nodes.length ? d.labels.nodes.map((node: { name: string }) => node.name) : 'NO LABEL(S)'
            )
            .setThumbnail(d.author?.avatarUrl ?? '')
            .setTimestamp(new Date(d.publishedAt));

        return message.say(embed);
    }
}
