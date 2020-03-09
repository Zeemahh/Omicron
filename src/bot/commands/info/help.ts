import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { endPoints, embedFooter, embedColor, doesArrayHaveElement, embedAuthIcon } from '../../utils/functions';

const showS2: boolean = false;

const socialsParam: string[] = [
    'socials',
    'media',
    'ips',
    'endpoints',
    'eps',
    'chat'
];

const detailsParam: string[] = [
    'dets',
    'details',
    'rules',
    'info',
    'announce',
    'important',
    '!'
];

const allParams: object = {
    socialsParam,
    detailsParam
};

export default class Help extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'help',
            group: 'information',
            memberName: 'help',
            description: 'Displays information about the community.',
            args: [
                {
                    key: 'type',
                    prompt: 'What specific help? Default: all',
                    type: 'string',
                    default: 'all'
                }
            ]
        });
    }

    public run(message: CommandoMessage, { type }: { type: string }) {
        const teamSpeakConnect: string = `<${endPoints.teamSpeak.Protocol}://${endPoints.teamSpeak.URL}>`;
        const fiveMInfo: { URL: string, Protocol: string, s1Port: string, s2Port: string } = endPoints.fiveM;
        const website: string = `${endPoints.website.Protocol}://${endPoints.website.URL}`;
        const announcements: string = 'http://highspeed-gaming.com/index.php?/forum/142-community-announcements/';
        const importantInfo: string = 'http://highspeed-gaming.com/index.php?/forum/9-important-information/';
        const citizenshipInfo: string = 'http://highspeed-gaming.com/index.php?/forum/198-passport-office/';

        let showAll: boolean = type === 'all';

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor('Community Information', embedAuthIcon)
            .setFooter(embedFooter)
            .setTimestamp()
            .setColor(embedColor);

        if (!showAll) {
            message.delete();
        }

        if (!showAll && !doesArrayHaveElement(detailsParam, type) && !doesArrayHaveElement(socialsParam, type)) {
            showAll = true;
        }

        if (showAll || doesArrayHaveElement(socialsParam, type)) {
            embed.addField('TeamSpeak 3 Server', `${teamSpeakConnect} (${endPoints.teamSpeak.URL})`);
            embed.addField('FiveM Server 1', `<${fiveMInfo.Protocol}://${fiveMInfo.URL}:${fiveMInfo.s1Port}> (${fiveMInfo.URL}:${fiveMInfo.s1Port})`);
            embed.addField('Website', `${website} ${showAll ? '\n' : ''}`);

            if (showS2) {
                embed.addField('FiveM Server 2',`<fivem://${endPoints.fiveM.URL}:${endPoints.fiveM.s2Port}> (${fiveMInfo.URL}:${fiveMInfo.s2Port})`);
            }
        }

        if (showAll || doesArrayHaveElement(detailsParam, type)) {
            embed.addField('Community Announcements', announcements);
            embed.addField('Important Information', importantInfo);
            embed.addField('Governor\'s Office', `__SACIS | San Andreas Citizenship & Immigration Services__
            This Office handles all Citizenship (Membership) & Immigration Services
            ${citizenshipInfo}`);
        }

        return message.reply('here is the information you requested, ', {
            embed
        });
    }
}