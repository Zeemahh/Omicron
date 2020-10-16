import * as colors from 'colors';
import 'typescript';
import './lib/env';
import { timeLog, LogGate, LogState } from './utils/functions';
import { Role } from 'discord.js';
import 'source-map-support/register';
import { OmicronClient } from './client/OmicronClient';
import * as mysql from 'mysql';

colors.setTheme({
    debug: 'cyan',
    error: 'red',
    success: 'green',
    warn: 'yellow'
});

console.log('hi');

export const client = new OmicronClient({ token: process.env.BOT_TOKEN });

// we need to import it after the export is defined, so it actually exists and we can use it elsewhere
// import './handlers/message';
// import './handlers/reportChannels';
// import './handlers/guildMemberAdd';
// import './handlers/ticketReactions';
// import './utils/serverStatusTracking';
import { MESSAGES } from './utils/constants';

client
    .on('error', console.error)
    .on('warn', console.warn)
    .once('ready', async () => {
        timeLog(`Logged in as ${client.user?.tag}! (${client.user?.id})`.green, LogGate.Always);
        timeLog(`Currently logged into ${client.guilds.cache.size} guilds with a total of ${client.users.cache.size} (cached) members.`.magenta, LogGate.Always);
        timeLog(`Prefix is set to: ${client.commandPrefix}`.cyan, LogGate.Always);
        if (process.env.BUILD !== undefined) {
            timeLog(`Current build: [ ${process.env.BUILD} ]`.yellow, LogGate.Always);
        }
        timeLog(`Current guilds: ${client.guilds.cache.map(g => g.name).join(', ')}`.red, LogGate.Always);
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
        timeLog(MESSAGES.ACTIONS.ON_GUILD_JOIN(guild), LogGate.Always);
    });

export const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'zeemah',
    password: process.env.MYSQL_PASSWORD,
    database: 'bot-data'
});
mysqlConnection.connect(() => {
    timeLog('Successfully connected to MySQL.'.green, LogGate.Always, LogState.General);
});

client.start();
