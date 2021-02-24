import { settings } from 'cluster';
import { Guild, CategoryChannel, GuildChannel, Collection, GuildMember, Role } from 'discord.js';
import { ISettings } from '../../config';
import { doesXExistOnGuild } from '../functions';

export class HGuild {
    protected _data: Guild;

    constructor(guild: Guild) {
        this._data = guild;
    }

    public get Channels(): Collection<string, GuildChannel> {
        return this.__data.channels.cache;
    }

    public async Members(): Promise<Collection<string, GuildMember>> {
        const members = await this.__data.members.fetch();
        return members;
    }

    public async FetchSpecificMember(member: string): Promise<GuildMember> {
        return await this.__data.members.fetch(member);
    }

    public async Bots(): Promise<Collection<string, GuildMember>> {
        const members = await this.Members();
        return members.filter(x => x.user.bot);
    }

    public get Roles(): Collection<string, Role> {
        return this.__data.roles.cache;
    }

    public get Settings(): ISettings {
        for (const [ , val ] of Object.entries(settings)) {
            if (val.guildId === this._data.id) {
                return val;
            }
        }

        return undefined;
    }

    public get TicketCategory(): CategoryChannel {
        if (!this.Settings || this.Settings.tickets) return undefined;

        let category: GuildChannel;
        category = this._data.channels.cache.get(this.Settings.tickets.category.channelId);
        if (category instanceof CategoryChannel) {
            return <CategoryChannel> category;
        }

        return null;
    }

    public get TicketChannel(): GuildChannel {
        if (!this.Settings || !this.Settings.tickets) return undefined;

        const channel = this._data.channels.cache.get(this.Settings.tickets.initChannel.channelId);
        if (doesXExistOnGuild(channel, this._data)) {
            return channel;
        }

        return undefined;
    }

    public get Tickets() {
        if (!this.Settings?.tickets) return {};

        const ticketData = this.Settings.tickets;
        const Category = this.Channels.get(ticketData.category.channelId);
        const InitChannel = this.Channels.get(ticketData.initChannel.channelId);
        const Logging = this.Channels.get(ticketData.logs.channelId);

        return {
            Category,
            InitChannel,
            Logging,
            AllValid:
                !!Category &&
                !!InitChannel &&
                !!Logging,
            MessageContent: this.Settings.tickets?.category?.msgContent
        };
    }

    public get PromptMessage(): string {
        if (!this.Settings || !this.Settings.tickets) return undefined;

        return this.Settings.tickets.category?.msgContent;
    }

    public get __data(): Guild {
        return this._data;
    }
}
