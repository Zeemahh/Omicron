import * as colors from 'colors';
import 'typescript';
import './lib/env';
import { isDevelopmentBuild, embedAuthIcon, Delay } from './utils/functions';
import { Role, TextChannel, MessageEmbed } from 'discord.js';
import * as Sentry from '@sentry/node';
import 'source-map-support/register';
import { UpsilonClient } from './client/UpsilonClient';

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

export const client = new UpsilonClient({ token: process.env.BOT_TOKEN });

// we need to import it after the export is defined, so it actually exists and we can use it elsewhere
import './handlers/guildMemberAdd';
import './handlers/message';
import './handlers/reportChannels';
import './handlers/ticketReactions';
import './utils/serverStatusTracking';
import { MESSAGES } from './utils/constants';
import { stripIndents } from 'common-tags';
import moment = require('moment');
import { collectAllStatusChannels } from './config';
import { ServerStatus } from './utils/serverStatusTracking';
import { RSSChannel, RSSChannelOptions } from './handlers/rssParsing';
import { Logger } from 'tslog';

const logger = new Logger({ name: 'Root', displayFunctionName: false, displayFilePath: 'hidden' });

client
    .on('error', console.error)
    .on('warn', console.warn)
    .once('ready', async () => {
        // probs not practically
        for (const guild of client.guilds.cache.values()) {
            await guild.members.fetch();
        }

        logger.info(`Logged in as ${client.user?.tag}! (${client.user?.id})`.green);
        logger.info(`Currently logged into ${client.guilds.cache.size} guilds with a total of ${client.users.cache.size} (cached) members.`.magenta);
        logger.info(`Prefix is set to: ${client.commandPrefix}`.cyan);
        if (process.env.BUILD !== undefined) {
            logger.info(`Current build: [ ${process.env.BUILD} ]`.yellow);
        }
        logger.info(`Current guilds: ${client.guilds.cache.map(g => g.name).join(', ')}`.red);

        const statusChannels = collectAllStatusChannels();
        if (statusChannels.length) {
            for (const channel of statusChannels) {
                const data = new ServerStatus(channel);

                if (await data.ShouldRun()) {
                    await data.BeginUpdates();
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
        logger.info(MESSAGES.ACTIONS.ON_GUILD_JOIN(guild));
    });

const rolesEmbedStruct = new MessageEmbed()
    .setAuthor('HighSpeed-Gaming', embedAuthIcon)
    .setTitle('Roles')
    .setDescription(stripIndents`Click on the emoji for the role you wish to join in order to assign the role to yourself.
        Removing the reaction will result in you losing the role.

        :computer: Programming
        :star: Updates
        <:fivemmascot:730856122025771190> FiveM
        :cowboy: RedM
        :airplane: Flight Sim
        <:minecraftblock:730857382086705283> Minecraft
        <:TruckersMP:747136587711643759> TruckersMP
	:gun: Tom Clancy Series`)
    .setColor('#CB70D6');

client.on('ready', async () => {
    const hsgGuild = client.guilds.cache.get('519243404543000576');
    if ((!process.env.BUILD || process.env.BUILD === 'dev') || !hsgGuild || !hsgGuild.available) {
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

        await Delay(30000);
        return notifyMessage.delete();
    }
});

const rssChannels: ({ channelId: string } & RSSChannelOptions)[] = [
    {
        channelId: '521069746368806922',
        link: 'https://highspeed-gaming.com/index.php?/forum/142-community-announcements.xml/&member=12452&key=952e1d053f4bab648f6aee12be26f4a1'
    }
];

for (const channel of rssChannels) {
    const opts: RSSChannelOptions = {
        link: channel.link
    };

    if (channel.interval)
        opts.interval = channel.interval;

    const rssChannel = new RSSChannel(channel.channelId, opts);
    rssChannel.Start();
}

client.start();
