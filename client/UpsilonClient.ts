import { AkairoClient, CommandHandler } from 'discord-akairo';
import { Intents } from 'discord.js';
import { join } from 'path';

declare module 'discord-akairo' {
    interface AkiaroClient {
        commandPrefix: string;
        commandHandler: CommandHandler;
        config: UpsilonOptions;
    }
}

interface UpsilonOptions {
    owner?: string;
    token: string;
}

type Primitive = string | number | boolean | object;

interface Settings {
    [key: string]: Primitive;
}

export class UpsilonClient extends AkairoClient {
    public commandPrefix = process.env.PREFIX ?? 'u.';
    public commandHandler: CommandHandler;
    public config: UpsilonOptions;
    public settings: Settings;

    constructor(options: UpsilonOptions) {
        super({
            ownerID: '264662751404621825',
            intents: new Intents(Intents.NON_PRIVILEGED).add('GUILD_MEMBERS', 'GUILD_MESSAGES')
        });

        this.commandHandler = new CommandHandler(this, {
            directory: join(__dirname, '..', 'commands'),
            prefix: () =>
                this.commandPrefix,
            commandUtil: true,
            handleEdits: true,
            allowMention: false,
            storeMessages: true
        });

        this.settings = {};
        this.config = options;
    }

    private _init() {
        this.commandHandler.loadAll();
    }

    public start() {
        this._init();
        return this.login(this.config.token);
    }

    public GetSettingValue(setting: string) {
        return this.settings[setting];
    }

    public SetSettingValue(setting: string, value: Primitive) {
        this.settings[setting] = value;
    }
}