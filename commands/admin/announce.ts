import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { HMessage } from '../../utils/classes/HMessage';
import { MESSAGES } from '../../utils/constants';

// TODO: Title as 'flag' or 'option'
export default class Announce extends Command {
    public constructor() {
        super('announce', {
            aliases: [ 'announce' ],
            description: {
                content: MESSAGES.COMMANDS.ANNOUNCE.DESCRIPTION,
                usage: '<content>',
                examples: [ ]
            },
            category: 'staff',
            channel: 'guild',
            args: [
                {
                    id: 'announcement',
                    type: 'string',
                    prompt: {
                        start: (message: HMessage) => MESSAGES.COMMANDS.ANNOUNCE.PROMPT.START(message.author)
                    },
                    match: 'content'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            clientPermissions: [ 'EMBED_LINKS' ],
        });
    }

    public exec(message: HMessage, { announcement }: { announcement: string }) {
        message.delete();

        const deliminator = announcement.split(/ +\| +/);

        const embed = new MessageEmbed()
            .setAuthor(`Announcement from ${message.author.username}`, message.author.avatarURL())
            .setDescription(announcement)
            .setColor('#EF2E37')
            .setTimestamp();

        let footer;
        if (message.member.roles.cache.size) {
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

        return message.util?.send(embed);
    }
}
