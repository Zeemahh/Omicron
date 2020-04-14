import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, TextChannel } from 'discord.js';

export default class ChangeLog extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'changelog',
            group: 'admin',
            memberName: 'changelog',
            description: 'Sends a server changelog to the channel.',
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['EMBED_LINKS'],
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
            .setTimestamp();

        return channel.send(embed);
    }
}
