import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { toggleStickyStatus, getStickyData } from './sticky';
import { MESSAGES } from '../../utils/constants';

export default class StickyClear extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'unsticky',
            group: 'admin',
            memberName: 'unsticky',
            description: MESSAGES.COMMANDS.STICKY_CLEAR.DESCRIPTION,
            userPermissions: [ 'MANAGE_MESSAGES' ]
        });
    }

    public run(message: CommandoMessage) {
        const stickData = getStickyData();
        if (!stickData.state) {
            return message.reply('there is no active sticky currently.');
        }

        toggleStickyStatus();
        return message.reply(`unstuck the sticky.`);
    }
}
