import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { timeLog, embedAuthIcon, doesXExistOnGuild } from '../../utils/functions';
import { CategoryChannel, MessageEmbed, Channel, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import { settings } from '../../config';

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

    public run(message: CommandoMessage) {
        const reportCategory: CategoryChannel = message.guild.channels.cache.find(ch => ch.id === settings.playerReports.category && ch.type === 'category') as CategoryChannel;
        if (!reportCategory) {
            timeLog('Could not find report channel category, therefore, I cannot create new report channels.');
            return undefined;
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor('Incoming Offline Player Report', embedAuthIcon)
            .setColor('#0B71A6')
            .addField('Initiator', `${message.author.username}#${message.author.discriminator}`)
            .setTimestamp();

        message.guild.channels.create(`${message.author.username}-${message.author.discriminator}_report`, {
            parent: reportCategory,
            permissionOverwrites: [
                {
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL']
                }
            ]
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

            embed.addField('Channel Name', `#${channel.name} (<#${channel.id}>)`);

            const reportLogs: Channel = message.guild.channels.cache.get(settings.playerReports.logs);
            if (doesXExistOnGuild(reportLogs, message.guild)) {
                if (reportLogs instanceof TextChannel) {
                    return reportLogs.send(embed);
                }
            }
        });

        return message.delete();
    }
}