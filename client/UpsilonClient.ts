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

export class UpsilonClient extends AkairoClient {
    public commandPrefix = process.env.PREFIX ?? 'u.';
    public commandHandler: CommandHandler;
    public config: UpsilonOptions;

    constructor(options: UpsilonOptions) {
        super({
            ownerID: '264662751404621825',
            intents: new Intents(Intents.NON_PRIVILEGED).add('GUILD_MEMBERS', 'GUILD_MESSAGES')
        });

        this.commandHandler = new CommandHandler(this, {
            directory: join(__dirname, '..', 'commands'),
            prefix: this.commandPrefix,
            commandUtil: true,
            handleEdits: true,
            allowMention: false,
            storeMessages: true
        });

        this.config = options;
    }

    private _init() {
        this.commandHandler.loadAll();
    }

    public start() {
        this._init();
        return this.login(this.config.token);
    }
}