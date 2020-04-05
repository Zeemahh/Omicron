import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';

export default class Announce extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'announce',
            group: 'admin',
            memberName: 'announce',
            description: 'Sends an announcement to the channel.',
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            args: [
                {
                    key: 'announcement',
                    prompt: 'What would you like to announce?',
                    type: 'string'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { announcement }: { announcement: string }) {
        message.delete();

        const deliminator = announcement.split(/ +\| +/);

        const embed = new MessageEmbed()
            .setAuthor(`Announcement from ${message.author.username}`, message.author.avatarURL())
            .setDescription(announcement)
            .setColor('#EF2E37')
            .setTimestamp();

        if (message.member.roles?.highest.name) {
            embed.setFooter(message.member.roles.highest.name);
        }

        if (deliminator[1]) {
            embed.setTitle(deliminator[0]);
            embed.setDescription(announcement.replace(`${deliminator[0]} |`, ''));
        }

        return message.say(embed);
    }
}
