import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildChannel, MessageEmbed, TextChannel, CategoryChannel, Channel } from 'discord.js';
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
                    type: 'channel',
                    default: (msg: CommandoMessage) => msg.channel
                },
                {
                    key: 'reason',
                    prompt: 'Why are you deleting?',
                    type: 'string',
                    default: ''
                }
            ],
            userPermissions: ['KICK_MEMBERS']
        });
    }

    public async run(message: CommandoMessage, { channel, reason }: { channel: GuildChannel, reason: string }) {
        if (channel instanceof CategoryChannel || !(channel instanceof TextChannel)) {
            return message.reply('that is not a valid report.');
        }

        if (channel.parent.id === getReportCategory(message.guild).id) {
            if (channel.id !== getReportLogsChannel(message.guild).id && channel.id !== '686624525911195748') {
                await channel.send(`<@!${message.author.id}>, deleting this channel upon request.`);

                try {
                    channel.delete(`User ${message.author.username}#${message.author.discriminator} deleted report with ID ${channel.id}`);
                    this.client.emit('onReportChannelDelete', channel, message, reason);
                } catch (e) {
                    return message.reply(`Something went wrong when deleting channel. E: ${e}`);
                }
            }
        }
        return message.reply('that is not a valid report.');
    }
}
