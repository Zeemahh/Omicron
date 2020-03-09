import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, Role, GuildMember, Guild } from 'discord.js';
import { embedColor, embedFooter, embedAuthIcon, doesArrayHaveElement, doesRoleExistOnGuild, hsgAuths } from '../../utils/functions';

interface IArgumentInfo {
    arguments: string[];
    longName: string;
    roleId?: string | string[];
    shortName?: string;
}

const allStaffArguments: IArgumentInfo[] = [
    {
        arguments: [
            'DR',
            'Director'
        ],
        shortName: 'DR',
        longName: 'Director'
    },
    {
        arguments: [
            'CD',
            'Chief of Development',
            'Development',
            'DV',
            'Developer',
            'Development'
        ],
        roleId: [
            '686297176267423764',
            '686297189307121669'
        ],
        longName: 'Development'
    },
    {
        arguments: [
            'A3',
            'Lead Admin'
        ],
        shortName: 'A3',
        longName: 'Lead Administrator'
    },
    {
        arguments: [
            'A2',
            'Senior Admin'
        ],
        shortName: 'A2',
        longName: 'Senior Administrator'
    },
    {
        arguments: [
            'A1',
            'Admin',
            'Junior Admin'
        ],
        shortName: 'A1',
        longName: 'Administrator'
    },
    {
        arguments: [
            'GS',
            'General Staff',
            'Staff'
        ],
        shortName: 'GS',
        longName: 'General Staff'
    }
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
            return input.length === 0 ? 'There are no members in this group' : input.map(i => `<@!${i.user.id}>`).join(', ');
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setFooter(embedFooter)
            .setAuthor('HighSpeed-Gaming Staff Directory', embedAuthIcon);


        for (const [ _, value ] of Object.entries(allStaffArguments)) {
            let tempMembers: GuildMember[] = [];
            if (Array.isArray(value.roleId)) {
                for (const [ __, ID ] of Object.entries(value.roleId)) {
                    const memb: GuildMember[] = fetchMembersForRole(message.guild.roles.cache.find(rl => rl.id === ID), message.guild);
                    tempMembers = tempMembers.concat(memb);
                }
            }
            const groupOfMembers: GuildMember[] = (tempMembers.length > 0 ? tempMembers : fetchMembersForRole(
                message.guild.roles.cache.find(
                    // this is safe to cast roleName here to string, as tempMembers size will be greater than 1 (not always, even) if
                    // the typeof value.roleName === string[], see block above which iterates through items in the roleName array if possible
                    r => (value.roleId ? r.id : r.name.toLowerCase()) === (value.roleId ? value.roleId : value.longName.toLowerCase())
                ), message.guild
            ));

            if ((showAll || doesArrayHaveElement(value.arguments, rank))) {
                embed.addField(`${value.longName} ${value.shortName ? `(${value.shortName})` : ''}`, format(groupOfMembers.filter((a, b) => groupOfMembers.indexOf(a) === b)));
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