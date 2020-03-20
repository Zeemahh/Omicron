import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { User, MessageEmbed, GuildMember } from 'discord.js';
import moment = require('moment');
import { capitalize } from '../../utils/functions';

const acknowledgements: { id: string|string[], title: string, type: 'user' | 'role'}[] = [
    {
        id: '264662751404621825',
        title: 'Bot Developer',
        type: 'user'
    },
    {
        id: '625068930485977138',
        title: 'Super cool',
        type: 'role'
    },
    {
        id: '519296454683000832',
        title: 'General Staff | GS',
        type: 'role'
    },
    {
        id: '531467575302029333',
        title: 'Administrator | A1',
        type: 'role'
    },
    {
        id: '519295249827495942',
        title: 'Senior Administrator | A2',
        type: 'role'
    },
    {
        id: '519295118780530689',
        title: 'Lead Administrator | A3',
        type: 'role'
    },
    {
        id: '519294892401229837',
        title: 'Developer | DV',
        type: 'role'
    },
    {
        id: '519293986112929799',
        title: 'Chief of Development | CD',
        type: 'role'
    },
    {
        id: '519293898242261013',
        title: 'Director | DR',
        type: 'role'
    }
];

export default class UserInfo extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'userinfo',
            aliases: ['whois', 'uinfo'],
            group: 'admin',
            memberName: 'userinfo',
            description: 'Returns information about a specified user.',
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Which user would you like to display information for?',
                    type: 'user',
                    default: (m: CommandoMessage) => m.author
                }
            ]
        });
    }

    public run(message: CommandoMessage, { user }: { user: User }) {
        message.delete();

        const currentDate: Date = new Date();

        const localAcknowledgements: { [key: string]: string[] } = {};
        localAcknowledgements[user.id] = [];

        const embed: MessageEmbed = new MessageEmbed();

        const member: GuildMember|undefined = message.guild.members.cache.find(fm => fm.id === user.id);

        if (!(member instanceof GuildMember)) {
            return message.reply('I couldn\'t find that member.');
        }

        for (const [key, acknowledgement] of Object.entries(acknowledgements)) {
            if (acknowledgement.type === 'user') {
                if (user.id === acknowledgement.id) {
                    localAcknowledgements[user.id].push(acknowledgement.title);
                }
            }

            if (acknowledgement.type === 'role') {
                if (typeof acknowledgement.id === 'object') {
                    for (const [i, roleId] of Object.entries(acknowledgement.id)) {
                        if (member.roles.cache.has(roleId)) {
                            localAcknowledgements[user.id].push(acknowledgement.title);
                        }
                    }
                } else {
                    if (member.roles.cache.has(acknowledgement.id)) {
                        localAcknowledgements[user.id].push(acknowledgement.title);
                    }
                }
            }
        }

        if (message.guild.owner?.id === user.id) {
            localAcknowledgements[user.id].push('Server Owner');
        }

        embed.setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL() ?? undefined);
        if (user.avatarURL() !== undefined) {
            embed.setThumbnail(user.avatarURL() as string);
        }

        if (member.nickname !== null) {
            embed.addField('❯ Nickname', member?.nickname);
        }

        if (user.presence !== null) {
            const status: string = user.presence.status.length > 3 ? capitalize(user.presence.status) : user.presence.status.toUpperCase();
            embed.addField('❯ Status', status, true);
        }

        const joined_at: moment.Moment = moment(member.joinedAt!);
        embed.addField('❯ Joined', `${joined_at.format('ddd, MMM D, YYYY H:mm A')} (${moment(currentDate).diff(joined_at, 'days')} days ago)`, true);

        const created_at: moment.Moment = moment(user.createdAt);
        embed.addField('❯ Registered', `${created_at.format('ddd, MMM D, YYYY H:mm A')} (${moment(currentDate).diff(created_at, 'days')} days ago)`);

        const amount_of_roles: number = member.roles.cache.array().length - 1;

        const roles: string = amount_of_roles > 0 ?
            member.roles.cache.map(role => role.name !== '@everyone' ? `<@&${role.id}>` : '').join(' ') :
            'This user doesn\'t have any roles.';
        embed.addField(`❯ Roles [${amount_of_roles}]`, roles);

        if (localAcknowledgements[user.id].length > 0) {
            embed.addField('❯ User Acknowledgements', localAcknowledgements[user.id].map((title: string) => '• ' + title));
        }

        embed.setColor(message.guild.me?.roles.color ? message.guild.me.roles.color!.color : '#ccc');
        if (member.roles.color !== null) {
            embed.setColor(member.roles.color.color);
        }

        embed.setFooter('Requested by ' + message.author.tag);

        if (user.id === '264662751404621825') {
            embed.addField('❯ Twitter', '[Go follow me](https://twitter.com/Zeemah_ "This is the bot developer, FYI.")');
        }

        return message.say(embed);
    }
}
