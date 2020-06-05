import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { User, MessageEmbed, GuildMember } from 'discord.js';
import moment = require('moment');
import {capitalize, embedColor, getAuthLvlFromMember} from '../../utils/functions';
import { MESSAGES } from '../../utils/constants';

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
    }
];

export default class UserInfo extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'userinfo',
            aliases: [ 'whois', 'uinfo' ],
            group: 'admin',
            memberName: 'userinfo',
            description: MESSAGES.COMMANDS.USER_INFO.DESCRIPTION,
            userPermissions: [ 'MANAGE_MESSAGES' ],
            clientPermissions: [ 'EMBED_LINKS' ],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Which user would you like to display information for?',
                    type: 'user',
                    default: (m: CommandoMessage) => m.author
                }
            ],
            examples: [
                `${client.commandPrefix}whois 608362769032675348`,
                `${client.commandPrefix}whois Zeemah`
            ]
        });
    }

    public run(message: CommandoMessage, { user }: { user: User }) {
        message.delete();

        const currentDate: Date = new Date();

        const localAcknowledgements: { [key: string]: string[] } = {};
        localAcknowledgements[user.id] = [];

        const embed: MessageEmbed = new MessageEmbed();

        const member: GuildMember = message.guild.members.cache.find(fm => fm.id === user.id);
        const authLvl = getAuthLvlFromMember(member);

        if (!(member instanceof GuildMember)) {
            return message.reply('I couldn\'t find that member.');
        }

        for (const [ , acknowledgement ] of Object.entries(acknowledgements)) {
            if (acknowledgement.type === 'user') {
                if (user.id === acknowledgement.id) {
                    localAcknowledgements[user.id].push(acknowledgement.title);
                }
            }

            if (acknowledgement.type === 'role') {
                if (typeof acknowledgement.id === 'object') {
                    for (const [ , roleId ] of Object.entries(acknowledgement.id)) {
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
            embed.setThumbnail(user.avatarURL());
        }

        if (member.nickname !== undefined) {
            embed.addField('❯ Nickname', member?.nickname);
        }

        if (user.presence !== undefined) {
            const status: string = user.presence.status.length > 3 ? capitalize(user.presence.status) : user.presence.status.toUpperCase();
            embed.addField('❯ Status', status, true);
        }

        const joinedAt: moment.Moment = moment(member.joinedAt!);
        embed.addField('❯ Joined', `${joinedAt.format('ddd, MMM D, YYYY H:mm A')} (${moment(currentDate).diff(joinedAt, 'days')} days ago)`, true);

        const createdAt: moment.Moment = moment(user.createdAt);
        embed.addField('❯ Registered', `${createdAt.format('ddd, MMM D, YYYY H:mm A')} (${moment(currentDate).diff(createdAt, 'days')} days ago)`);

        const ammountOfRoles: number = member.roles.cache.array().length - 1;

        const roles: string = ammountOfRoles > 0 ?
            member.roles.cache.map(role => role.name !== '@everyone' ? `<@&${role.id}>` : '').join(' ') :
            'This user doesn\'t have any roles.';
        embed.addField(`❯ Roles [${ammountOfRoles}]`, roles);

        if (authLvl) {
            embed.addField('Authorization Level', `${authLvl.longName} | ${authLvl.acronym}`);
        }

        if (localAcknowledgements[user.id].length > 0) {
            embed.addField('❯ User Acknowledgements', localAcknowledgements[user.id].map((title: string) => '• ' + title));
        }

        embed.setColor(message.guild.me?.roles.color ? message.guild.me.roles.color!.color : embedColor);
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
