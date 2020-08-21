import { CommandoMessage } from 'discord.js-commando';
import { Message, GuildChannel } from 'discord.js';
import { HMember } from './HMember';

const officialGuildId = '519243404543000576';

export class HMessage extends CommandoMessage {
    constructor(message: Message) {
        super(message);
    }

    /**
     * Returns true if guild the command has been executed in is the official HSG guild.
     */
    public IsMainGuild(): boolean {
        return this.guild.id === officialGuildId;
    }

    /**
     * Returns true if the member executing command is of auth GS+.
     */
    public IsStaff(): boolean {
        return this.member.roles.cache.has('723275899608498236');
    }

    /**
     * Returns true if the current channel is an SMRE channel, or is a bot-testing channel.
     */
    public IsStaffChannel(): boolean {
        if (this.channel instanceof GuildChannel && this.channel.parent.id === '519303504867622913') {
            return true;
        }

        return this.channel.id === '521069746368806922';
    }

    public get MainGuild() {
        return this.client.guilds.cache.get(officialGuildId);
    }

    public get HMember() {
        return this.guild && this.guild.available ? <HMember> this.guild.member(this.author) : null;
    }

    public get IsPersonalGuild(): boolean {
        return this.guild.available && this.guild.id === '541026385649729536';
    }
}
