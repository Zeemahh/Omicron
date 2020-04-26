import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, MessageEmbed } from 'discord.js';
import moment = require('moment');
import pluralize = require('pluralize');
import { embedAuthIcon } from '../../utils/functions';
import { MESSAGES } from '../../utils/constants';

export default class GrantRole extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'grantrole',
            group: 'admin',
            aliases: [ 'grole', 'gupdate', 'rrc' ],
            memberName: 'grantrole',
            description: MESSAGES.COMMANDS.DELREP.DESCRIPTION,
            userPermissions: [ 'MANAGE_ROLES' ]
        });
    }

    public run(message: CommandoMessage) {
        if (message.guild.roles.cache.get('519300438743580683') === undefined) {
            return message.reply('that command is not usable in this guild.');
        }

        message.delete();

        const currentDate = new Date();
        const members: GuildMember[] = [];

        message.guild.members.cache.forEach(memberI => {
            // - 1 since @everyone is included
            if (memberI.roles.cache.size - 1 === 0) {
                if (moment(currentDate).diff(memberI.joinedAt, 'days') >= 2) {
                    members.push(memberI);
                    memberI.roles.add('519300438743580683', `Granted role based on the execution of the update command from ${message.author.tag}. ` +
                        `User has been in the server for more than 2 days and had not received the Casual Player role.`);
                }
            }
        });

        if (members.length > 0) {
            return message.say(
                new MessageEmbed()
                    .setAuthor('Role Update', embedAuthIcon)
                    .setDescription(`Added ${members.length} ${pluralize('member', members.length)} to the Casual Player role:\n\n${members.map(m => `\`${m.user.tag}\``).join(' ')}`)
                    .addField('Admin', message.author.tag)
                    .setColor('#4BB35A')
            );
        }

        return message.say('There were no members to grant Casual Player to.');
    }
}
