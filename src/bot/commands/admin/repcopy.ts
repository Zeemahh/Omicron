import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, CategoryChannel, GuildChannel, MessageEmbed, TextChannel } from 'discord.js';
import { getReportCategory, getReportLogsChannel } from '../../config';
import { embedAuthIcon, embedFooter, getBotTestingChannel } from '../../utils/functions';
import * as moment from 'moment';

export default class ReportCopy extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'repcopy',
            group: 'admin',
            aliases: ['rcopy', 'rcop'],
            memberName: 'repcopy',
            description: 'Copies the content of a report and places elsewhere for logging.',
            args: [
                {
                    key: 'msg',
                    prompt: 'The message you want to copy.',
                    type: 'message'
                }
            ],
            userPermissions: ['KICK_MEMBERS']
        });
    }

    public run(message: CommandoMessage, { msg }: { msg: Message }) {
        const logsChannel: GuildChannel = getReportLogsChannel(message.guild);
        if (msg instanceof CategoryChannel || !(msg.channel instanceof GuildChannel) || (msg.channel.parent.id !== getReportCategory(message.guild)?.id)) {
            return message.reply('that is an invalid report message.');
        }

        if (logsChannel === undefined || !(logsChannel instanceof TextChannel)) {
            return message.reply('could not find report category for this guild, please report this.');
        }

        if (msg.author.bot) {
            return message.reply('please copy a reply from an actual user, not a bot.');
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor('Offline Player Report Archive', embedAuthIcon)
            .setDescription(`**Report details for report initiated by ${msg.author.tag} on ${moment(msg.createdAt).format('ddd, MMM D, YYYY H:mm A')}**\n\n\`\`\`\n${msg.content}\`\`\``)
            .setFooter(embedFooter)
            .setColor('FFF000');

        this.client.emit('onReportCopy', msg, message);
        return ((process.env.BUILD !== 'dev' ? logsChannel : getBotTestingChannel() as TextChannel).send(embed));
    }
}
