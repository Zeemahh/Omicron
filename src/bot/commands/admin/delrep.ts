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
                    key: 'reason',
                    prompt: 'Why are you deleting?',
                    type: 'string',
                    default: ''
                }
            ],
            userPermissions: ['KICK_MEMBERS']
        });
    }

    public async run(message: CommandoMessage, { reason }: { reason: string }) {
        if (!(message.channel instanceof TextChannel)) {
            return;
        }

        const channel: TextChannel = message.channel;
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
