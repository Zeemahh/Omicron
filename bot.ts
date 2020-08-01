import * as colors from 'colors';
import { CommandoClient } from 'discord.js-commando';
import { join } from 'path';
import 'typescript';
import './lib/env';
import { timeLog, LogGate, isDevelopmentBuild, embedAuthIcon } from './utils/functions';
import { Role, TextChannel, MessageEmbed } from 'discord.js';
import * as Sentry from '@sentry/node';
import 'source-map-support/register';

colors.setTheme({
    debug: 'cyan',
    error: 'red',
    success: 'green',
    warn: 'yellow'
});

let sentryDsn: string;
// tslint:disable-next-line: no-conditional-assignment
if (!isDevelopmentBuild() && (sentryDsn = process.env.SENTRY_TOKEN)) {
    Sentry.init({
        dsn: sentryDsn
    });
}

export const client = new CommandoClient({
    commandPrefix: process.env.PREFIX ?? 'p.',
    invite: 'https://discord.gg/5e2bRgz',
    owner: '264662751404621825'
});

// we need to import it after the export is defined, so it actually exists and we can use it elsewhere
import './handlers/message';
import './handlers/reportChannels';
import './handlers/guildMemberAdd';
import './handlers/ticketReactions';
import './utils/serverStatusTracking';
import { MESSAGES } from './utils/constants';
import { successfulCommandExec, unsuccessfulCommandExec } from './handlers/commandExecution';
import { stripIndents } from 'common-tags';
import moment = require('moment');
import { collectAllStatusChannels } from './config';
import { ServerStatus } from './utils/serverStatusTracking';

client
    .on('error', console.error)
    .on('warn', console.warn)
    .on('commandRun', successfulCommandExec)
    .on('commandError', unsuccessfulCommandExec)
    .once('ready', async () => {
        timeLog(`Logged in as ${client.user?.tag}! (${client.user?.id})`.green, LogGate.Always);
        timeLog(`Currently logged into ${client.guilds.cache.size} guilds with a total of ${client.users.cache.size} (cached) members.`.magenta, LogGate.Always);
        timeLog(`Prefix is set to: ${client.commandPrefix}`.cyan, LogGate.Always);
        if (process.env.BUILD !== undefined) {
            timeLog(`Current build: [ ${process.env.BUILD} ]`.yellow, LogGate.Always);
        }
        timeLog(`Current guilds: ${client.guilds.cache.map(g => g.name).join(', ')}`.red, LogGate.Always);

        const statusChannels = collectAllStatusChannels();
        if (statusChannels.length) {
            for (const channel of statusChannels) {
                const data = new ServerStatus(channel);

                if (await data.ShouldRun()) {
                    data.BeginUpdates();
                }
            }
        }
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

const rolesEmbedStruct = new MessageEmbed()
    .setAuthor('HighSpeed-Gaming', embedAuthIcon)
    .setTitle('Roles')
    .setDescription(stripIndents`Click on the emoji for the role you wish to join in order to assign the role to yourself.
        Removing the reaction will result in you losing the role.

        :computer: Programming
        <:fivemmascot:730856122025771190> FiveM Player
        :cowboy: RedM Player
        :airplane: Flight Sim Player
        <:minecraftblock:730857382086705283> Minecraft Player
        :star: Updates`)
    .setColor('#CB70D6');

client.on('ready', async () => {
    const hsgGuild = client.guilds.cache.get('519243404543000576');
    if (!hsgGuild || !hsgGuild.available) {
        return;
    }

    const rolesChannel = hsgGuild.channels.cache.get('729132603801731082');
    if (!rolesChannel || !(rolesChannel instanceof TextChannel)) {
        return;
    }

    const messages = await rolesChannel.messages.fetch();
    const message = messages.find(m => {
        let thisEmbed;
        // tslint:disable-next-line: no-conditional-assignment
        if (m.embeds.length && (thisEmbed = m.embeds[0])) {
            return thisEmbed.author.name === rolesEmbedStruct.author.name && thisEmbed.title === rolesEmbedStruct.title;
        }
    });

    if (!message) {
        return rolesChannel.send(rolesEmbedStruct);
    }

    const embed = new MessageEmbed(message.embeds[0]);
    const shouldResend = embed.title !== rolesEmbedStruct.title ||
        embed.description !== rolesEmbedStruct.description ||
        embed.color !== rolesEmbedStruct.color;

    if (shouldResend) {
        const updatedMessage = await message.edit(null, {
            embed: rolesEmbedStruct
        });

        const notifyMessage = await updatedMessage.channel.send(`\`Last updated today at ${moment(updatedMessage.editedTimestamp).format('h:mm A')} (UTC)\``);
        return notifyMessage.delete({
            timeout: 30000
        });
    }
});

client.login(process.env.BOT_TOKEN);
