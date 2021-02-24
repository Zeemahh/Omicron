import { TextChannel } from 'discord.js';
import Parser, { Item } from 'rss-parser';
import { client } from '../bot';
import { Logger } from 'tslog';

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

    private Logger: Logger = new Logger({ name: 'RSSChannel', displayFunctionName: false, displayFilePath: 'hidden' });

    constructor(channelId: string, options: RSSChannelOptions) {
        this.ChannelId = channelId;
        this._Options = options;
    }

    public async ChannelExists(): Promise<boolean> {
        return !!await this._GetChannel();
    }

    public async Start(interval: number = this._Options.interval ?? 30000) {
        this._UpdateHandle = setInterval(async () => {
            try {
                // no point running if the channel doesn't exist
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

                this.Logger.debug(`current: ${this._CurrentItems}, known: ${this._KnownItems}`);

                if (!this._FirstSet && this._CurrentItems !== this._KnownItems) {
                    this.Logger.debug(`current !== known, sending message and updating`);
                    // if field has link, send to channel
                    if (this._Items[0].link)
                        await this.Channel.send(this._Items[0].link);

                    // update known items value
                    this._KnownItems = this._CurrentItems;
                }

                if (!this._KnownItems && this._CurrentItems !== 0 && this._FirstSet) {
                    this.Logger.debug('Initiating data, this is the first run...');
                    this._FirstSet = false;
                    this._KnownItems = this._CurrentItems;
                }
            } catch (e) {
                this.Stop(new Error(e?.message));
            }
        }, interval);
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
            this.Logger.error(error.message);
    }

    private async _GetChannel(): Promise<TextChannel> {
        const channel = client.channels.cache.get(this.ChannelId);
        if (channel && channel instanceof TextChannel) {
            this.Channel = channel;
            return this.Channel;
        }

        return undefined;
    }
}
