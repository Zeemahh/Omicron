import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, Role, GuildMember, Guild } from 'discord.js';
import { embedColor, embedFooter, embedAuthIcon, doesArrayHaveElement, doesRoleExistOnGuild } from '../../utils/functions';

interface IArgumentInfo {
    arguments: string[];
    shortname: string;
    longname: string;
}

const chiefOfDevelopmentArgs: IArgumentInfo = {
    arguments: [
        'CD',
        'Chief of Development',
        'Development'
    ],
    shortname: 'CD',
    longname: 'Chief of Development'
};

const developerArgs: IArgumentInfo = {
    arguments: [
        'DV',
        'Developer',
        'Development'
    ],
    shortname: 'DV',
    longname: 'Developer'
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
    chiefOfDevelopmentArgs,
    developerArgs,
    directorArgs,
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
            const groupOfMembers: GuildMember[] = fetchMembersForRole(message.guild.roles.cache.find(r => r.name.toLowerCase() === value.longname.toLowerCase()), message.guild);

            if ((showAll || doesArrayHaveElement(value.arguments, rank))) {
                embed.addField(`${value.longname} (${value.shortname})`, format(groupOfMembers));
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