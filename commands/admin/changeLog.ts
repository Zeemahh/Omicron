import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, TextChannel } from 'discord.js';
import { MESSAGES } from '../../utils/constants';

export default class ChangeLog extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'changelog',
            group: 'admin',
            memberName: 'changelog',
            aliases: [ 'clog', 'changes', 'cl' ],
            description: MESSAGES.COMMANDS.CHANGELOG.DESCRIPTION,
            userPermissions: [ 'MANAGE_MESSAGES' ],
            clientPermissions: [ 'EMBED_LINKS' ],
            guildOnly: true,
            args: [
                {
                    key: 'msg',
                    prompt: 'What are the changes?',
                    type: 'string'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { msg }: { msg: string }) {
        message.delete();

        const channel = message.channel.id !== '697625528630509614' ? <TextChannel> message.guild.channels.cache.get('697625528630509614') : message.channel;
        const currDate = new Date();
        const currMonth = currDate.getMonth() + 1 < 10 ? `0${currDate.getMonth() + 1}` : currDate.getMonth() + 1;
        const currDay = currDate.getDate() < 10 ? `0${currDate.getDate()}` : currDate.getDate();

        msg = `**All of these changes have been created and reviewed collectively between all members of the Geek Squad.**\n\n${msg}`;
        const embed = new MessageEmbed()
            .setAuthor(`Server Change Log`, message.author.avatarURL())
            .setTitle(`Changes for ${currMonth}/${currDay}`)
            .setDescription(msg)
            .setColor('#EE6703')
            .setFooter(`This change log was written by ${message.author.tag}`)
            .setTimestamp();

        return channel.send(`<@731367517389586452>`, {
            embed
        });
    }
}
