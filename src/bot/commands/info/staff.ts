import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, Role, GuildMember, Guild } from 'discord.js';
import { embedColor, embedFooter, embedAuthIcon, doesArrayHaveElement, doesRoleExistOnGuild } from '../../utils/functions';

interface IArgumentInfo {
    arguments: string[];
    longname: string;
    roleName?: string | string[];
    shortname?: string;
}

const developmentArgs: IArgumentInfo = {
    arguments: [
        'CD',
        'Chief of Development',
        'Development',
        'DV',
        'Developer',
        'Development'
    ],
    roleName: [
        'Developer',
        'Chief of Development'
    ],
    longname: 'Development'
};

const directorArgs: IArgumentInfo = {
    arguments: [
        'DR',
        'Director'
    ],
    shortname: 'DR',
    longname: 'Director'
};

const leadAdminArgs: IArgumentInfo = {
    arguments: [
        'A3',
        'Lead Admin'
    ],
    shortname: 'A3',
    longname: 'Lead Administrator'
};

const seniorAdminArgs: IArgumentInfo = {
    arguments: [
        'A2',
        'Senior Admin'
    ],
    shortname: 'A2',
    longname: 'Senior Administrator'
};

const adminAdminArgs: IArgumentInfo = {
    arguments: [
        'A1',
        'Admin',
        'Junior Admin'
    ],
    shortname: 'A1',
    longname: 'Administrator'
};

const staffArgs: IArgumentInfo = {
    arguments: [
        'GS',
        'General Staff',
        'Staff'
    ],
    shortname: 'GS',
    longname: 'General Staff'
};

const allStaffArguments: IArgumentInfo[] = [
    directorArgs,
    developmentArgs,
    leadAdminArgs,
    seniorAdminArgs,
    adminAdminArgs,
    staffArgs
];

export default class Staff extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'staff',
            group: 'information',
            aliases: ['admins'],
            memberName: 'staff',
            description: 'Displays a list of staff members in a hierarchical order.',
            args: [
                {
                    key: 'rank',
                    type: 'string',
                    default: 'all',
                    prompt: 'What rank would you like to display members for?'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { rank }: { rank: string }) {
        const showAll: boolean = rank === 'all';

        function format(input: GuildMember[]): string {
            return input.length === 0 ? 'There are no members in this group' : input.map(i => i.user.username).join(', ');
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setFooter(embedFooter)
            .setAuthor('HighSpeed-Gaming Staff Directory', embedAuthIcon);


        for (const [ _, value ] of Object.entries(allStaffArguments)) {
            let tempMembers: GuildMember[] = [];
            if (Array.isArray(value.roleName)) {
                for (const [ __, role ] of Object.entries(value.roleName)) {
                    const memb: GuildMember[] = fetchMembersForRole(message.guild.roles.cache.find(rl => rl.name.toLowerCase() === role.toLowerCase()), message.guild);
                    tempMembers = tempMembers.concat(memb);
                }
            }
            const groupOfMembers: GuildMember[] = (tempMembers.length > 0 ? tempMembers.filter((a, b) => tempMembers.indexOf(a) === b) : fetchMembersForRole(
                message.guild.roles.cache.find(
                    // this is safe to cast roleName here to string, as tempMembers size will be greater than 1 (not always, even) if
                    // the typeof value.roleName === string[], see block above which iterates through items in the roleName array if possible
                    r => r.name.toLowerCase() === (value.roleName ? (value.roleName as string).toLowerCase() : value.longname.toLowerCase())
                ), message.guild
            ));

            if ((showAll || doesArrayHaveElement(value.arguments, rank))) {
                embed.addField(`${value.longname} ${value.shortname ? `(${value.shortname})` : ''}`, format(groupOfMembers.concat()));
            }
        }

        return message.reply(embed);
    }
}

function fetchMembersForRole(role: Role, guild: Guild): GuildMember[] {
    if (!doesRoleExistOnGuild(role, guild)) {
        return [];
    }

    const members: GuildMember[] = [];
    role.members.forEach(member => {
        members.push(member);
    });

    return members;
}