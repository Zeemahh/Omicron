import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { timeLog, embedAuthIcon, doesXExistOnGuild } from '../../utils/functions';
import { CategoryChannel, MessageEmbed, Channel, TextChannel, Collection, SnowflakeUtil } from 'discord.js';
import { stripIndents } from 'common-tags';
import { getReportLogsChannel, getReportCategory } from '../../config';

export default class Report extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'report',
            group: 'misc',
            aliases: ['rep'],
            memberName: 'report',
            description: 'Initialises a report thread against a player.',
            args: [
                {
                    key: 'reason',
                    prompt: 'Please provide a short explanation of your report.',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    public run(message: CommandoMessage, { reason }: { reason: string }) {
        const reportCategory: CategoryChannel = getReportCategory(message.guild);
        if (!reportCategory) {
            timeLog('Could not find report channel category, therefore, I cannot create new report channels.');
            return undefined;
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor('Incoming Offline Player Report', embedAuthIcon)
            .setColor('#0B71A6')
            .addField('Initiator', `${message.author.username}#${message.author.discriminator}`)
            .setTimestamp();

        if (reason !== '') {
            embed.addField('Reason', reason);
        }

        message.guild.channels.create(`${message.author.username}-${message.author.discriminator}_report`, {
            parent: reportCategory,
            permissionOverwrites: [
                {
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL']
                }
            ]
        }).then(channel => {
            channel.lockPermissions()
                .then(pChannel => {
                    pChannel.updateOverwrite(message.author, {
                        VIEW_CHANNEL: true
                    });
                })
                .catch(console.error);
            channel.send(stripIndents`_Player Reporting Format_:
            \`\`\`
            Reported Player's Name:
            Reason For Report (Rules Violated):
            Narrative of Events:
            Evidence/Proof:
            \`\`\`

            Process:
            - Player initiates report.
            - Staff pulls both players aside, where applicable, and get both sides of the story as well as review evidence.
            - Staff member makes decision based on provided statements and evidence or refers the incident up the chain of command where applicable.
            - Staff member marks report as "Completed."
            - Either involved parties has the opportunity to appeal said staff member's decision here: http://highspeed-gaming.com/index.php?/support/`);
            channel.send(`<@!${message.author.id}>, please use this channel to communicate with SMRE officials in order to have a justified and appropriate outcome for your report.`);

            embed.addField('Channel Name', `#${channel.name} (<#${channel.id}>)`);

            const reportLogs: Channel = getReportLogsChannel(message.guild);
            if (doesXExistOnGuild(reportLogs, message.guild)) {
                if (reportLogs instanceof TextChannel) {
                    return reportLogs.send(embed);
                }
            }
        });

        return message.delete();
    }
}
