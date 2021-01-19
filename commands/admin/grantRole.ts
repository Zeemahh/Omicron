import { Command } from 'discord-akairo';
import { GuildMember, MessageEmbed } from 'discord.js';
import moment = require('moment');
import pluralize = require('pluralize');
import { embedAuthIcon } from '../../utils/functions';
import { MESSAGES } from '../../utils/constants';
import { HMessage } from '../../utils/classes/HMessage';

export default class GrantRole extends Command {
    public constructor() {
        super('grantrole', {
            aliases: [ 'grantrole', 'grole', 'gupdate', 'rrc' ],
            description: {
                content: MESSAGES.COMMANDS.GRANT_ROLE.DESCRIPTION
            },
            category: 'staff',
            channel: 'guild',
            userPermissions: [ 'MANAGE_ROLES' ]
        });
    }

    public exec(message: HMessage) {
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

        if (members.length) {
            return message.util?.send(
                new MessageEmbed()
                    .setAuthor('Role Update', embedAuthIcon)
                    .setDescription(`Added ${members.length} ${pluralize('member', members.length)} to the Casual Player role:\n\n${members.map(m => `\`${m.user.tag}\``).join(' ')}`)
                    .addField('Admin', message.author.tag)
                    .setColor('#4BB35A')
            );
        }

        return message.util?.send('There were no members to grant Casual Player to.');
    }
}
