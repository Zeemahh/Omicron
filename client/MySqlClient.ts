import * as mysql from 'mysql';

export class MySqlClient {
    public GuildData: { [key: string]: any }[] = [];
    private readonly _host: string;
    private _client: mysql.Connection;
    private _username: string;
    private _password: string;
    private _port: number = 3306;
    private _isInitialized: boolean = false;

    constructor(options: mysql.ConnectionConfig) {
        this._host = options.host;
    }

    private _init() {
        this._client = mysql.createConnection({
            host: this._host,
            port: this._port,
            password: this._password
        });

        console.log(this._client, this._username, this._isInitialized);
    }

    private async _isClientReady() {
        return new Promise(resolve => {
            resolve(this._isInitialized);
        });
    }

    public async query(query: string) {
        return new Promise(async (resolve, reject) => {
            if (await this._isClientReady()) {
                this._client.query(query, (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(result);
                });
            }
        });
    }

    public i() {
        this._init();
    }
}