import * as colors from 'colors';
import { CommandoClient } from 'discord.js-commando';
import { join } from 'path';
import 'typescript';
import './lib/env';
import { timeLog, LogState, LogGate } from './utils/functions';
import { Role } from 'discord.js';
import * as Sentry from '@sentry/node';

colors.setTheme({
    debug: 'cyan',
    error: 'red',
    success: 'green',
    warn: 'yellow'
});

Sentry.init({
    dsn: 'https://9e5cb5c000e2487e92b2c5f6269c76b2@sentry.io/3983160'
});

export const client = new CommandoClient({
    commandPrefix: process.env.PREFIX ?? 'p.',
    invite: 'https://discord.gg/5e2bRgz',
    owner: '264662751404621825'
});

// we need to import it after the export is defined, so it actually exists and we can use it elsewhere
import './handlers/message';
import './handlers/reportChannels';
import './handlers/guildMemberAdd';
import './utils/serverStatusTracking';
import { MESSAGES } from './utils/constants';

client
    .on('error', console.error)
    .on('warn', console.warn)
    .once('ready', () => {
        timeLog(`Logged in as ${client.user?.tag}! (${client.user?.id})`.green, );
        timeLog(`Currently logged into ${client.guilds.cache.size} guilds with a total of ${client.users.cache.size} (cached) members.`.magenta);
        timeLog(`Prefix is set to: ${client.commandPrefix}`.cyan);
        if (process.env.BUILD !== undefined) {
            timeLog(`Current build: [ ${process.env.BUILD} ]`.yellow);
        }
        timeLog(`Current guilds: ${client.guilds.cache.map(g => g.name).join(', ')}`.red);
    })
    .on('guildMemberAdd', async (member) => {
        if (member.guild.id === '685320619943788582') {
            const role: Role = member.guild.roles.cache.get('685320800294666259');
            if (role) {
                await member.roles.add(role);
            }
        }
    })
    .on('guildCreate', (guild) => {
        timeLog(MESSAGES.ACTIONS.ON_GUILD_JOIN(guild));
    })
    .registry
        .registerDefaultTypes()
        .registerGroups([
            [ 'misc', MESSAGES.GROUPS.MISC.DESCRIPTION ],
            [ 'information', MESSAGES.GROUPS.INFO.DESCRIPTION ],
            [ 'admin', MESSAGES.GROUPS.ADMIN.DESCRIPTION ]
            // ['fivem', 'Commands that are related to FiveM.']
        ])
        .registerDefaultGroups()
        .registerDefaultCommands({
            help: false,
            unknownCommand: false
        })
        .registerCommandsIn(join(__dirname, 'commands'));

client.login(process.env.BOT_TOKEN);
