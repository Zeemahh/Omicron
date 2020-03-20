import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember } from 'discord.js';
import moment = require('moment');

export default class GrantRole extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'grantrole',
            group: 'admin',
            aliases: ['grole', 'gupdate', 'rrc'],
            memberName: 'grantrole',
            description: 'Grants Casual Player role to any member in this guild who has been a member for more than 2 days and has not received Casual Player.',
            userPermissions: ['MANAGE_ROLES']
        });
    }

    public run(message: CommandoMessage) {
        if (message.guild.roles.cache.get('519300438743580683') === undefined) {
            return undefined;
        }

        const currentDate = new Date();
        const members: GuildMember[] = [];

        message.guild.members.cache.forEach(member_i => {
            // - 1 since @everyone is included
            if (member_i.roles.cache.size - 1 === 0) {
                if (moment(currentDate).diff(member_i.joinedAt, 'days') >= 2) {
                    members.push(member_i);
                    member_i.roles.add('519300438743580683', `Granted role based on the execution of the update command from ${message.author.tag}. ` +
                        `User has been in the server for more than 2 days and had not received the Casual Player role.`);
                }
            }
        });

        if (members.length > 0) {
            return message.say(`Added ${members.length} members to the Casual Player role:\n\n${members.map(m => `\`${m.user.tag}\``).join(' ')}`);
        }

        return message.say('There were no members to grant Casual Player to.');
    }
}
