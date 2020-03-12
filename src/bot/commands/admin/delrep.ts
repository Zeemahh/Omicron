import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildChannel, MessageEmbed, TextChannel, CategoryChannel } from 'discord.js';
import { settings, getReportLogsChannel, getReportCategory } from '../../config';
import { embedAuthIcon, doesXExistOnGuild } from '../../utils/functions';


export default class DelRep extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'delrep',
            group: 'admin',
            memberName: 'delrep',
            description: 'Deletes a report.',
            args: [
                {
                    key: 'channel',
                    prompt: 'The channel name or ID for the report you wish to delete.',
                    type: 'channel'
                },
                {
                    key: 'reason',
                    prompt: 'Why are you deleting?',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    public run(message: CommandoMessage, { channel, reason }: { channel: GuildChannel, reason: string }) {
        if (channel instanceof CategoryChannel) {
            return message.reply('you cannot delete categories through this command.');
        }

        if (channel.parent.id === getReportCategory(message.guild).id) {
            if (channel.id !== getReportLogsChannel(message.guild).id && channel.id !== '686624525911195748' && channel.deletable) {
                const embed: MessageEmbed = new MessageEmbed()
                    .setAuthor('Closed Report', embedAuthIcon)
                    .setColor(settings.playerReports.deleteEmbed.color)
                    .addField('Admin', `${message.author.username}#${message.author.discriminator} (${message.author.id})`)
                    .setTimestamp();

                if (reason !== '') {
                    embed.addField('Reason', reason);
                }

                try {
                    channel.delete(`User ${message.author.username}#${message.author.discriminator} deleted report with ID ${channel.id}`);

                    const logs: GuildChannel = getReportLogsChannel(message.guild);
                    if(logs instanceof TextChannel && doesXExistOnGuild(logs, message.guild)) {
                        return logs.send(embed);
                    }
                }
                catch(e) {
                    return message.reply('Something went wrong when deleting channel.');
                }
            }
        }
        return message.reply('that is not a valid report.');
    }
}