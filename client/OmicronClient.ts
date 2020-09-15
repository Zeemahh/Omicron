import { AkairoClient, CommandHandler } from 'discord-akairo';
import { join } from 'path';
import { mysqlConnection } from '../bot';
import { IGuildData } from '../utils/dataTypes';

declare module 'discord-akairo' {
    interface AkiaroClient {
        commandPrefix: string;
        commandHandler: CommandHandler;
        config: OmicronOptions;
    }
}

interface OmicronOptions {
    owner?: string;
    token: string;
}

export const guildData: { [key: string]: IGuildData } = {};

export class OmicronClient extends AkairoClient {
    public commandPrefix = process.env.PREFIX ?? 'u.';
    public commandHandler: CommandHandler;
    public config: OmicronOptions;

    constructor(options: OmicronOptions) {
        super({
            ownerID: '264662751404621825'
        });

        this.commandHandler = new CommandHandler(this, {
            directory: join(__dirname, '..', 'commands'),
            prefix: message => {
                return guildData[message.guild.id].prefix ?? this.commandPrefix;
            },
            commandUtil: true,
            handleEdits: true,
            allowMention: false,
            storeMessages: true
        });

        this.config = options;
    }

    private async _init() {
        this.commandHandler.loadAll();
        mysqlConnection.query(`SELECT * FROM guilds`, (err, data) => {
            if (err) {
                return 0;
            }

            data.forEach((guild: IGuildData) => {
                guildData[guild.id] = guild;
            });
        });
    }

    public start() {
        this._init();
        return this.login(this.config.token);
    }
}