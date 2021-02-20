import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
// import { Logger } from 'tslog';

// tslint:disable variable-name

/**
 * Handles _successful_ command executions.
 *
 * @param command The message object called back.
 * @param _promise A promise of a command object.
 * @param message The message that triggered the command.
 * @param _args Any arguments provided with command.
 * @param _fromPattern Pattern that was used to execute command.
 * @param _result Result of command.
 */
// tslint:disable-next-line:typedef
export const successfulCommandExec = (
    command: Command,
    _promise: Promise<Command>,
    message: Message,
    _args: object | string | string[],
    _fromPattern: boolean,
    _result?: []
) => {
    console.log(`[CMD SUCCESS] ${message.author.username}#${message.author.discriminator}: ${command.id} - ${message.content}`.green);
};

/**
 * Handles _unsuccessful_ command executions.
 *
 * @param command The message object called back.
 * @param error The reasoning for failure.
 * @param message The message that triggered the command.
 * @param args Any arguments provided with command.
 * @param _fromPattern Pattern that was used to execute command.
 * @param _result Result of command.
 */
export const unsuccessfulCommandExec = (
    command: Command,
    error: Error,
    message: Message,
    args: object | string | string[],
    _fromPattern: boolean,
    _result?: []
) => {
    console.log('   Error when handling command execution!'.toUpperCase().red);
    console.log(`Command: ${command.id}`);
    console.log(`Message content: ${message.content}`);
    console.log(`Arguments: ${args.toString()}`);
    console.log(`Stacktrace: ${error.stack}\n`);
};
