import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { timeLog } from '../../utils/functions';
import { CategoryChannel } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class Report extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'report',
            group: 'misc',
            aliases: ['rep'],
            memberName: 'report',
            description: 'Initialises a report thread against a player.'
        });
    }

    public async run(message: CommandoMessage) {
        message.delete();
        const reportCategory: CategoryChannel = message.guild.channels.cache.find(ch => ch.id === '686624560086253646' && ch.type === 'category') as CategoryChannel;
        if (!reportCategory) {
            timeLog('Could not find report channel category, therefore, I cannot create new report channels.');
            return undefined;
        }

        message.guild.channels.create(`${message.author.username}-${message.author.discriminator}_report`, {
            parent: reportCategory
        }).then(channel => {
            channel.send(stripIndents`_Player Reporting Format_:
            \`\`\`
            Reported Player's Name:
            Reason For Report (Rules Violated):
            Narrative of Events:
            Evidence/Proof:
            \`\`\`

            Rules:
            - Do not respond in this channel to reports filed against you. Both parties, if possible, will have the opportunity to sit down and talk it out.
            - Do not backseat moderate.
            - You are free to report someone who has already been reported by someone else for the same violation.
            - You are not permitted to use this channel for idle conversation.

            Process:
            - Player initiates report.
            - Staff pulls both players aside, where applicable, and get both sides of the story as well as review evidence.
            - Staff member makes decision based on provided statements and evidence or refers the incident up the chain of command where applicable.
            - Staff member marks report as "Completed."
            - Either involved parties has the opportunity to appeal said staff member's decision here: http://highspeed-gaming.com/index.php?/support/`);
        });
        return message.reply(';');
    }
}