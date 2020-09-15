import * as mysql from 'mysql';

export class MySqlClient {
    public GuildData: { [key: string]: any }[] = [];
    private _host: string;
    private _handle: mysql.Connection;
    private _username: string;
    private _password: string;
    private _port: number = 3306;
    private _isInitialized: boolean = false;

    constructor(options: mysql.ConnectionConfig) {
        this.host = options.host;
    }

    private _init() {
        this._handle = mysql.createConnection({
            host: this._host,
            port: this._port,
            password: this._password
        });
    }
}