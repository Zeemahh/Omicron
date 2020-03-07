import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { isDevelopmentBuild, doesArrayHaveElement, doesRoleExistOnGuild, embedAuthIcon, embedFooter, convertBoolToStrState, convertDecToHex } from '../../utils/functions';
import { Role, MessageEmbed } from 'discord.js';

const supportedDebugTypes: string[] = [
    'role',
    'user',
    'guild'
];

export default class Debug extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'debug',
            group: 'information',
            memberName: 'debug',
            description: 'Debugs some things.',
            args: [
                {
                    key: 'type',
                    prompt: 'What do you want to debug?',
                    type: 'string',
                    default: (!isDevelopmentBuild() ? 'nothing' : '')
                },
                {
                    key: 'obj',
                    prompt: 'Parameter that is relative to first argument provided.',
                    type: 'string'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { type, obj }: { type: string, obj: string }) {
        if (!isDevelopmentBuild() || type === 'nothing') {
            console.log('nothing');
            return undefined;
        }

        if (!doesArrayHaveElement(supportedDebugTypes, type)) {
            return message.reply(type === '' ? 'please input a debug type' : 'that is not a supported debug type.');
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(`Debug [${type}]`, embedAuthIcon)
            .setColor('#E4C341')
            .setFooter(embedFooter);

        if (supportedDebugTypes.find(i => i === 'role') !== undefined && type === 'role') {
            const role: Role = message.guild.roles.cache.find(r => r.name === obj);

            if (!doesRoleExistOnGuild(role, message.guild)) {
                return message.reply('I could not find that role, sorry!');
            }

            function getRoleColor(inputRl: Role): string {
                const col: string = convertDecToHex(inputRl.color);
                if (col === '0') {
                    return 'Default';
                }

                return `#${col}`;
            }

            delete embed.author;
            embed.addField('ID', role.id, true);
            embed.addField('Name', role.name, true);
            embed.addField('Color', getRoleColor(role), true);
            embed.addField('Mention', `<@&${role.id}>`, true);
            embed.addField('Total Members', role.members.size, true);
            embed.addField('Hoisted', convertBoolToStrState(role.hoist), true);
            embed.addField('Position', role.position, true);
            embed.addField('Mentionable', convertBoolToStrState(role.mentionable), true);
            embed.setFooter('Role Created');
            embed.setTimestamp(role.createdTimestamp);

            return message.reply(embed);
        }
    }
}