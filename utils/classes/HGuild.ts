import { settings } from 'cluster';
import { Guild, CategoryChannel, GuildChannel } from 'discord.js';
import { ISettings } from '../../config';
import { doesXExistOnGuild } from '../functions';

export class HGuild {
    protected data: Guild;

    constructor(guild: Guild) {
        this.data = guild;
    }

    public get Settings(): ISettings {
        for (const [ , val ] of Object.entries(settings)) {
            if (val.guildId === this.data.id) {
                return val;
            }
        }

        return undefined;
    }

    public get TicketCategory(): CategoryChannel {
        if (!this.Settings || this.Settings.tickets) return undefined;

        let category: GuildChannel;
        category = this.data.channels.cache.get(this.Settings.tickets.category.channelId);
        if (category instanceof CategoryChannel) {
            return <CategoryChannel> category;
        }

        return null;
    }

    public get TicketChannel(): GuildChannel {
        if (!this.Settings || !this.Settings.tickets) return undefined;

        const channel = this.data.channels.cache.get(this.Settings.tickets.initChannel.channelId);
        if (doesXExistOnGuild(channel, this.data)) {
            return channel;
        }

        return undefined;
    }

    public get PromptMessage(): string {
        if (!this.Settings || !this.Settings.tickets) return undefined;

        return this.Settings.tickets.category?.msgContent;
    }
}
