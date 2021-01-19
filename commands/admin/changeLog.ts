import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MessageEmbed, TextChannel } from 'discord.js';
import { HMessage } from '../../utils/classes/HMessage';
import { MESSAGES } from '../../utils/constants';

export default class ChangeLog extends Command {
    public constructor() {
        super('changelog', {
            aliases: [ 'changelog', 'clog', 'changes', 'cl' ],
            description: {
                content: MESSAGES.COMMANDS.CHANGELOG.DESCRIPTION,
                usage: '<content>'
            },
            category: 'dev',
            channel: 'guild',
            args: [
                {
                    id: 'content',
                    type: 'string',
                    prompt: {
                        start: (message: Message) => MESSAGES.COMMANDS.CHANGELOG.PROMPT.START(message.author)
                    },
                    match: 'content'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            clientPermissions: [ 'EMBED_LINKS' ],
        });
    }

    public exec(message: HMessage, { content }: { content: string }) {
        message.delete();

        const channel = message.channel.id !== '697625528630509614' ? <TextChannel> message.guild.channels.cache.get('697625528630509614') : message.channel;
        const currDate = new Date();
        const cm = currDate.getMonth() + 1;
        const currMonth = cm < 10 ? `0${cm}` : cm;
        const currDay = currDate.getDate() < 10 ? `0${currDate.getDate()}` : currDate.getDate();

        content = `**All of these changes have been created and reviewed collectively between all members of the Geek Squad.**\n\n${content}`;
        const embed = new MessageEmbed()
            .setAuthor(`Server Change Log`, message.author.avatarURL())
            .setTitle(`Changes for ${currMonth}/${currDay}`)
            .setDescription(content)
            .setColor('#EE6703')
            .setFooter(`This change log was written by ${message.author.tag}`)
            .setTimestamp();

        return channel.send({
            content: '<@731367517389586452>',
            embed
        });
    }
}
