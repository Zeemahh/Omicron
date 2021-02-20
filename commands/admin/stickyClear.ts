import { Command } from 'discord-akairo';
import { toggleStickyStatus, getStickyData } from './sticky';
import { MESSAGES } from '../../utils/constants';
import { HMessage } from '../../utils/classes/HMessage';

export default class StickyClear extends Command {
    constructor() {
        super('unsticky', {
            aliases: [ 'unsticky', 'unstick' ],
            description: {
                content: MESSAGES.COMMANDS.STICKY_CLEAR.DESCRIPTION,
                usage: '<content>',
                examples: [ 'Super informative post here!' ]
            },
            category: 'staff',
            channel: 'guild',
        });
    }

    public exec(message: HMessage) {
        if (1) return false;

        const stickData = getStickyData();
        if (!stickData.state) {
            return message.reply('there is no active sticky currently.');
        }

        toggleStickyStatus();
        return message.reply(`unstuck the sticky.`);
    }
}
