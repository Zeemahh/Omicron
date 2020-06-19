import { CommandoMessage } from 'discord.js-commando';
import { Message, GuildChannel } from 'discord.js';

export class HSGMessage extends CommandoMessage {
    constructor(message: Message) {
        super(message);
    }

    /**
     * Returns true if guild the command has been executed in is the official HSG guild.
     */
    public isMainGuild(): boolean {
        return this.guild.id === '519243404543000576';
    }

    /**
     * Returns true if the member executing command is of auth GS+.
     */
    public isStaff(): boolean {
        return this.member.roles.cache.has('723275899608498236');
    }

    /**
     * Returns true if the current channel is an SMRE channel, or is a bot-testing channel.
     */
    public isStaffChannel(): boolean {
        if (this.channel instanceof GuildChannel && this.channel.parent.id === '519303504867622913') {
            return true;
        }

        if (this.channel.id === '521069746368806922') {
            return true;
        }

        return false;
    }
}
