import { client } from '../bot';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { embedAuthIcon, endPoints, embedColor, getBotTestingChannel } from '../utils/functions';
import { Logger } from 'tslog';
import { stripIndents as si } from 'common-tags';
import { MESSAGES } from '../utils/constants';

const logger = new Logger({ name: 'handler:memberAdd', displayFunctionName: false });

client.on('guildMemberAdd', (member) => {
    if (member.guild.id !== '519243404543000576') { return; }
    const embed = new MessageEmbed()
        .setAuthor(`Welcome to HighSpeed-Gaming, ${member.user.tag}!`, embedAuthIcon, `${endPoints.website.Protocol ?? 'http'}://${endPoints.website.URL}`)
        .setColor(embedColor)
        .setThumbnail(member.guild.iconURL())
        .setDescription('Here is some information you will likely need to know if you wish to get properly involved with the community. ' +
            'If you have any questions or concerns about certain aspects of the community, be sure to reach out to SMRE Officials to get ' +
            'your questions answered. We hope you enjoy your time here at HighSpeed-Gaming.')
        .addField('Our Servers', si`**TeamSpeak**: ${endPoints.teamSpeak.URL}
            **FiveM (Main)**: ${endPoints.fiveM.URL}:${endPoints.fiveM.s1Port}
            **FiveM (Secondary)**: ${endPoints.fiveM.URL}:${endPoints.fiveM.s2Port}`)
        .addField('Website', `${endPoints.website?.Protocol ?? 'http'}://${endPoints.website.URL}`)
        // tslint:disable-next-line: prefer-template
        .addField('FiveM Information', 'This section contains information about the FiveM side of things within HighSpeed-Gaming.\n\n' +

            'Before playing on our servers, we require you to read and comprehend each and every server rule and regulation that we have. This is ' +
            'important to ensure you have a thorough understanding of the culture and environment that is set here. Any questions or concerns you ' +
            'have after reading the server rules should be posted in the Discord __<#519298605467697153>__ support channel.\n\n' +

            'Here are the rules: http://highspeed-gaming.com/index.php?/topic/7610-highspeed-gaming-fivem-rules/ \n\n' +

            '**How to obtain membership or citizenship?**' +
            'If you wish to become a member at HighSpeed-Gaming, you are required to put forward a citizenship application. Further information regarding this ' +
            'can be found [via this link](http://highspeed-gaming.com/index.php?/topic/7711-sacis-application-of-citizenship/).')
        .addField('Technical/Client Support', 'If you are experiencing issues with connecting to the server, you may want to use the Discord __<#519298605467697153>__ support channel. ' +
            'For voice-to-voice support, there is also a TeamSpeak channel for Technical Support.')
        // tslint:disable-next-line: prefer-template
        .addField('FAQ', '**"The server is temporarily restricted. Authorization level CU/M1/... or higher required." What does this mean?**\n' +
            'This happens when an A2 or higher admin has locked the server. If player count is low then the admin locked the server before they left as there would be no staff to monitor ' +
            'players. To get CU, you need to have 30 hours of playtime on the server with no infractions from SMRE officials. If you do have infractions, you may be asked to ask again at ' +
            'a later date to allow you to rectify the mistakes you made which resulted in the infractions.\n\n' +
            '**I have been banned, how can I appeal?**\n' +
            `If you want to appeal a ban, head over to [our website](${endPoints.website?.Protocol ?? 'http'}://${endPoints.website.URL}) and select the 'Support' tab in the top right under ` +
            '**m9Support**. Please refrain from publicly speaking about your ban, as that will not result in any action with your ban.')
        .setTimestamp();

    return member.send(embed)
        .catch(() => {
            if (!(member instanceof GuildMember)) return false;
            const tChannel = getBotTestingChannel() instanceof TextChannel ? <TextChannel> getBotTestingChannel() : null;
            const text = MESSAGES.ACTIONS.MEMBER_JOIN.ON_FAIL(member);

            if (!tChannel) {
                return logger.info(text);
            }

            tChannel.send(text);
        });
});
