import { Command } from 'discord-akairo';
import { MESSAGES } from '../../utils/constants';
import { Message } from 'discord.js';
import { mysqlConnection } from '../../bot';
import { guildData } from '../../client/OmicronClient';

export default class SetPrefix extends Command {
    constructor() {
        super('setPrefix', {
            aliases: [ 'setprefix' ],
            description: {
                content: MESSAGES.COMMANDS.SET_PREFIX.DESCRIPTION,
                usage: '<prefix>',
                examples: [ '!', '/' ]
            },
            category: 'admin',
            channel: 'guild',
            args: [
                {
                    id: 'prefix',
                    type: 'string',
                    prompt: {
                        start: (message: Message) => MESSAGES.COMMANDS.SET_PREFIX.PROMPT.START(message.author)
                    },
                    match: 'content'
                }
            ],
            userPermissions: [ 'MANAGE_GUILD' ]
        });
    }

    public exec(message: Message, { prefix }: { prefix: string }) {
        if (prefix.length > 4) {
            return message.reply('I cannot set that prefix as it is too long.');
        }

        mysqlConnection.query(`SELECT 1 FROM guilds WHERE id='${message.guild.id}';`, (error, data) => {
            if (error) {
                message.reply('internal MySQL error, bad!');
                throw error;
            }

            if (!data.length) {
                mysqlConnection.query(`INSERT INTO guilds (id, owner, ownerName, prefix)
                    VALUES ('${message.guild.id}', '${message.guild.owner.id}', '${message.guild.owner.user.username}', '${prefix}')`, (err) => {
                    if (err) {
                        return message.reply(`internal error!`);
                    }

                    return this._setPrefix(message, prefix);
                });
                return;
            }

            mysqlConnection.query(`UPDATE guilds SET prefix='${prefix}' WHERE id='${message.guild.id}'`, (err) => {
                if (err) {
                    return message.reply('internal error!');
                }

                return this._setPrefix(message, prefix);
            });
        });
    }

    private _setPrefix(message: Message, prefix: string) {
        guildData[message.guild.id].prefix = prefix;
        return message.reply(`successfully changed prefix to \`${prefix}\`.`);
    }
}