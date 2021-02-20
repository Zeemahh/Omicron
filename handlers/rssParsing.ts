import { TextChannel } from 'discord.js';
import Parser, { Item } from 'rss-parser';
import { client } from '../bot';
import { LogGate, LogState, timeLog } from '../utils/functions';

export interface RSSChannelOptions {
    link: string;
    interval?: number;
}

const parser = new Parser();

export class RSSChannel {
    public ChannelId: string;
    public Channel: TextChannel;
    public IsRunning: boolean = false;

    private _Options: RSSChannelOptions;
    private _UpdateHandle: NodeJS.Timeout;
    private _KnownItems: number = 0;
    private _CurrentItems: number = 0;
    private _FirstSet: boolean = true;
    private _Items: Item[];

    constructor(channelId: string, options: RSSChannelOptions) {
        this.ChannelId = channelId;
        this._Options = options;
    }

    public async ChannelExists(): Promise<boolean> {
        return !!await this._GetChannel();
    }

    public async Start() {
        // default to 30sec
        const interval = this._Options.interval ?? 30000;

        this._UpdateHandle = setInterval(async () => {
            try {
                if (!await this.ChannelExists()) {
                    this.IsRunning = false;
                    return;
                }

                this.IsRunning = true;

                const { link } = this._Options;
                if (!link)
                    return;

                const feed = await parser.parseURL(link);
                this._Items = feed.items;

                // current amount of items in this field
                this._CurrentItems = this._Items.length;

                if (!this._FirstSet && this._CurrentItems !== this._KnownItems) {
                    if (this._Items[0].link)
                        await this.Channel.send(this._Items[0].link);

                    this._KnownItems = this._CurrentItems;
                }

                if (!this._KnownItems && this._CurrentItems !== 0 && this._FirstSet) {
                    this._FirstSet = false;
                    this._KnownItems = this._CurrentItems;
                }
            } catch (e) {
                this.Stop(new Error(e?.message));
            }
        }, interval)
    }

    private _NullifyAllData() {
        this.IsRunning = false;
        this._KnownItems =
        this._CurrentItems = 0;
        this.Channel =
        this._UpdateHandle = null;
    }

    public async Stop(error?: Error) {
        if (!await this.ChannelExists() || !this.IsRunning)
            return;

        clearInterval(this._UpdateHandle);
        this._NullifyAllData();

        if (error)
            timeLog(error.message, LogGate.Always, LogState.Error);
    }

    private async _GetChannel(): Promise<TextChannel> {
        const channel = client.channels.cache.get(this.ChannelId);
        if (channel && channel.type === 'text') {
            this.Channel = channel as TextChannel;
            return this.Channel;
        }

        return undefined;
    }
}

/*
const rssChannels: { channelId: string, link: string, interval?: number }[] = [
    {
        channelId: '521069746368806922',
        link: 'https://highspeed-gaming.com/index.php?/forum/142-community-announcements.xml/&member=12452&key=952e1d053f4bab648f6aee12be26f4a1',
        interval: 1000
    }
];

for (const channel of rssChannels) {
    const rssChannel = new RSSChannel(channel.channelId, {
        link: channel.link,
        interval: channel.interval
    });

    rssChannel.Start();
}
*/
