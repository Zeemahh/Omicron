import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { MESSAGES } from '../../utils/constants';

export default class Announce extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'announce',
            group: 'admin',
            memberName: 'announce',
            description: MESSAGES.COMMANDS.ANNOUNCE.DESCRIPTION,
            userPermissions: [ 'MANAGE_MESSAGES' ],
            clientPermissions: [ 'EMBED_LINKS' ],
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

        let footer;
        if (message.member.roles.cache.size > 0) {
            const geekSquadId = '625068930485977138';
            footer = message.member.roles.highest.name;
            if (message.member.roles.cache.has(geekSquadId) && message.member.roles.highest.id !== geekSquadId && message.channel.id === '697625528630509614') {
                footer = 'Geek Squad';
            }
        }

        if (footer) {
            embed.setFooter(footer);
        }

        if (deliminator[1]) {
            embed.setTitle(deliminator[0]);
            embed.setDescription(announcement.replace(`${deliminator[0]} |`, ''));
        }

        return message.say(embed);
    }
}
