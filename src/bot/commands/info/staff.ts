import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, Role, GuildMember, Guild } from 'discord.js';
import { embedColor, embedFooter, embedAuthIcon, doesArrayHaveElement, doesRoleExistOnGuild } from '../../utils/functions';

const directorParams: string[] = [
    'DR',
    'Director'
];

const leadAdminParams: string[] = [
    'A3',
    'Lead Admin'
];

const seniorAdminParams: string[] = [
    'A2',
    'Senior Admin'
];

const adminParams: string[] = [
    'A1',
    'Admin',
    'Junior Admin'
];

const staffParams: string[] = [
    'GS',
    'General Staff',
    'Staff'
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
        const [ doesDRRoleExist, drs, directorRole ]: [ boolean, GuildMember[] | null, Role | null ] = fetchMembersForRole(message.guild.roles.cache.find(r => r.name === 'Director'), message.guild);
        const [ doesA3RoleExist, a3s, leadAdminRole ]: [ boolean, GuildMember[] | null, Role | null ] = fetchMembersForRole(message.guild.roles.cache.find(r => r.name === 'Lead Administrator'), message.guild);
        const [ doesA2RoleExist, a2s, seniorAdminRole ]: [ boolean, GuildMember[] | null, Role | null ] = fetchMembersForRole(message.guild.roles.cache.find(r => r.name === 'Senior Administrator'), message.guild);
        const [ doesA1RoleExist, a1s, adminRole ]: [ boolean, GuildMember[] | null, Role | null ] = fetchMembersForRole(message.guild.roles.cache.find(r => r.name === 'Administrator'), message.guild);
        const [ doesGSRoleExist, gs, generalStaffRole ]: [ boolean, GuildMember[] | null, Role | null ] = fetchMembersForRole(message.guild.roles.cache.find(r => r.name === 'General Staff'), message.guild);

        function format(input: GuildMember[]): string {
            return input.map(i => i.user.username).join(', ');
        }

        const showAll: boolean = rank === 'all';
        const embed: MessageEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setFooter(embedFooter)
            .setAuthor('HighSpeed-Gaming Staff Directory', embedAuthIcon);

        // DR
        if ((showAll || doesArrayHaveElement(directorParams, rank)) && doesDRRoleExist) {
            embed.addField(directorRole.name, format(drs));
        }

        // A3
        console.log(doesArrayHaveElement(leadAdminParams, rank), format(a3s));
        if ((showAll || doesArrayHaveElement(leadAdminParams, rank)) && doesA3RoleExist) {
            embed.addField(leadAdminRole.name, format(a3s));
        }

        // A2
        if ((showAll || doesArrayHaveElement(seniorAdminParams, rank)) && doesA2RoleExist) {
            embed.addField(seniorAdminRole.name, format(a2s));
        }

        // A1
        if ((showAll || doesArrayHaveElement(adminParams, rank)) && doesA1RoleExist) {
            embed.addField(adminRole.name, format(a1s));
        }

        // GS
        if ((showAll || doesArrayHaveElement(staffParams, rank)) && doesGSRoleExist) {
            embed.addField(generalStaffRole.name, format(gs));
        }

        return message.reply(embed);
    }
}

function fetchMembersForRole(role: Role, guild: Guild): [ boolean, GuildMember[] | null, Role ] {
    if (!doesRoleExistOnGuild(role, guild)) {
        return [ false, null, role ];
    }

    const members: GuildMember[] = [];
    role.members.forEach(member => {
        members.push(member);
    });

    return [ members.length > 0 ? true : false, members, role ];
}