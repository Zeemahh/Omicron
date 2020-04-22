import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, GuildMember, GuildChannel } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { IStickyData, getStickyData } from '../admin/sticky';
import { convertBoolToStrState, doesXExistOnGuild } from '../../utils/functions';
import { join } from 'path';

export default class BotInfo extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'botinfo',
            group: 'information',
            aliases: ['stats', 'info'],
            memberName: 'botinfo',
            description: 'Returns information about this bot.'
        });
    }

    public run(message: CommandoMessage) {
        const embed: MessageEmbed = new MessageEmbed()
            .setColor('#BB91E2')
            .setDescription(`**${this.client.user?.username} Information**`)
            .addField('Uptime', moment.duration(this.client.uptime ?? 0).format('d[d ]h[h ]m[m ]s[s]'), true)
            .addField('Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
            .addField('Node Version', process.version)
            .addField('Library', '[discord.js](https://discord.js.org "discord.js-commando")[-commando](https://github.com/discordjs/Commando "discord.js-commando")')
            .setFooter(`© 2020 ${this.client.users.cache.get(<string> this.client.options.owner ?? '').tag}`)
            .setThumbnail(this.client?.user.displayAvatarURL() ?? '');

        let rootPkgFile: any;
        try {
            rootPkgFile = require(join(__dirname, '../../../../../package.json'));
        } catch (e) {
            rootPkgFile = null;
        }

        if (rootPkgFile && rootPkgFile.version) {
            embed.addField('Bot Version', `\`${rootPkgFile.version}\``);
        }

        const stickyData: IStickyData = getStickyData();

        if (stickyData.state) {
            const member: GuildMember = message.guild.members.cache.find(m => m.id === stickyData?.authorId);
            const channel: GuildChannel = message.guild.channels.cache.find(c => c.id === stickyData?.channelId);

            if (doesXExistOnGuild(member, message.guild) && doesXExistOnGuild(channel, message.guild)) {
                embed.addField('Sticky Active?', convertBoolToStrState(stickyData.state));
                embed.addField('Sticky Creator', `${member.user.tag}`, true);
                embed.addField('Sticky Channel', channel.name, true);
            }
        }

        return message.say(embed);
    }
}
