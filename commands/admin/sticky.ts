import { Command } from 'discord-akairo';
import { MESSAGES, getStickyDataPath } from '../../utils/constants';
import * as fs from 'fs';
import { HMessage } from '../../utils/classes/HMessage';

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
    public constructor() {
        super('sticky', {
            aliases: [ 'sticky', 'stick' ],
            description: {
                content: MESSAGES.COMMANDS.STICKY.DESCRIPTION,
                usage: '<content>',
                examples: [ 'Super informative post here!' ]
            },
            category: 'staff',
            channel: 'guild'
        });
    }

    public async exec(message: HMessage, { text }: { text: string }) {
        if (1) return false;

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
