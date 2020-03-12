import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';

export default class BotInfo extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'botinfo',
            group: 'information',
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
            .setFooter(`© 2020 ${this.client.users.cache.get(this.client.options.owner as string ?? '').tag}`)
            .setThumbnail(this.client?.user.displayAvatarURL() ?? '');

        return message.say(embed);
    }
}