import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { MESSAGES, getStickyDataPath } from '../../utils/constants';
import * as fs from 'fs';

export interface IStickyData {
    state: boolean;
    channelId?: string;
    messageId?: string;
    authorId?: string;
    message?: string;
}

let sticky: IStickyData = {
    state: false
};

export default class Sticky extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'sticky',
            group: 'admin',
            memberName: 'sticky',
            description: MESSAGES.COMMANDS.STICKY.DESCRIPTION,
            args: [
                {
                    key: 'text',
                    prompt: 'What would you like to stick to this channel?',
                    type: 'string'
                }
            ],
            userPermissions: [ 'MANAGE_MESSAGES' ],
            examples: [
                `${client.commandPrefix}sticky Some really important message must be stuck to this channel...`
            ]
        });
    }

    public async run(message: CommandoMessage, { text }: { text: string }) {
        sticky.state = true;
        sticky.message = `__**Stickied Message**__\n\n${text}`;
        sticky.channelId = message.channel.id;
        sticky.authorId = message.author.id;

        const stickM = await message.channel.send(sticky.message);

        sticky.messageId = stickM.id;

        const path = getStickyDataPath(message.guild);

        // TODO: Save this data in an array consisting of: { [key: channelId]: { messageId: string, content: string }
        fs.readFile(path, (err) => {
            // file does not exist
            if (err && err.toString().includes('no such file')) {
                const dataToSave = {
                    [message.channel.id]: {
                        state: true,
                        message: sticky.message,
                        channelId: message.channel.id,
                        authorId: message.author.id
                    }
                };
                // we create the file
                fs.writeFile(path, JSON.stringify(dataToSave), (error) => {
                    if (error) {
                        return console.log(error.toString());
                    }

                    console.log('done!');
                });
            }
        });

        return message.delete();
    }
}

export function getStickyData(): IStickyData {
    return sticky;
}

export function toggleStickyStatus(): boolean {
    sticky.state = !sticky.state;
    return sticky.state;
}

export function setStickyData(input: IStickyData): IStickyData {
    sticky = input;
    return sticky;
}
