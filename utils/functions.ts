/**
 * Returns true if `BUILD` env variable is set to 'dev'
 */
export function isDevelopmentBuild(): boolean {
    return (process.env.BUILD && process.env.BUILD === 'dev');
}

/**
 * Enum used to determine when to log things, i.e. in production or development.
 */
export enum LogGate {
    Development = 1,
    Production,
    Always
}

/**
 * Used to specify the type of log this is, i.e. warning or debug.
 */
export enum LogState {
    General,
    Warning,
    Error,
    Debug
}

/**
 * Prefixes current time (hh:mm:ss) as well as a message to a log printed to `stdout`
 *
 * @param message Message you wish to log
 * @param logGate In what environment should this be logged in?
 * @param logState What type of log is this?
 */
export function timeLog(message: any, logGate: LogGate = LogGate.Development, logState: LogState = LogState.Debug): void {
    if ((logGate === LogGate.Development && !isDevelopmentBuild()) ||
        (logGate === LogGate.Production && isDevelopmentBuild()) ||
        !logGate
    ) {
        return;
    }

    const currentTime: Date = new Date();
    let hour: string = currentTime.getHours().toString();
    let min: string = currentTime.getMinutes().toString();
    let sec: string = currentTime.getSeconds().toString();

    if (currentTime.getHours() < 10) {
        hour = '0' + hour;
    }

    if (currentTime.getMinutes() < 10) {
        min = '0' + min;
    }

    if (currentTime.getSeconds() < 10) {
        sec = '0' + sec;
    }

    let prefix = `[${hour}:${min}:${sec}]`;

    switch (logState) {
        case LogState.General:
            prefix = prefix.bgMagenta.black;
            break;
        case LogState.Warning:
            prefix = prefix.bgRed.yellow;
            message = (<string> message).yellow;
            break;
        case LogState.Error:
            prefix = prefix.bgRed.yellow;
            message = (<string> message).red;
            break;
        case LogState.Debug:
            message = (<string> message).yellow;
            prefix = prefix.magenta;
            break;
        default:
            prefix = prefix.magenta;
            break;
    }

    return console.log(`${prefix} ${message}`);
}