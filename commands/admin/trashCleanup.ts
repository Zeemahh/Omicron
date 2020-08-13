import { Command, CommandoClient } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import { HSGMessage } from '../../utils/classes/HSGMessage';
import { User, TextChannel } from 'discord.js';

export default class TrashCleanup extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'trash',
            group: 'admin',
            memberName: 'trash',
            aliases: [ 'ban-sync' ],
            description: MESSAGES.COMMANDS.TRASH.DESCRIPTION,
            clientPermissions: [ 'EMBED_LINKS' ],
            userPermissions: [ 'ADMINISTRATOR' ],
            guildOnly: true,
            examples: [
                `${client.commandPrefix}ban-sync`
            ]
        });
    }

    public run(message: HSGMessage) {
        const allBans: { user: User, reason?: string }[] = [];
        const sendResult: (content: string) => void = (content: string) => {
            const ch = this.client.channels.cache.get('627501333439578112');
            if (ch && ch instanceof TextChannel) {
                ch.send(content);
            }
        };

        this.client.guilds.cache.forEach(async guild => {
            const bans = await guild.fetchBans();
            bans.forEach(ban => {
                allBans.concat({ user: ban.user, reason: ban.reason });
            });
        });

        const bannedMembers: { [key: string]: boolean } = {};
        let totalBanned = 0;
        this.client.guilds.cache.forEach(async guild => {
            allBans.forEach(ban => {
                const mem = guild.members.cache.get(ban.user.id);
                if (mem && guild.me.permissions.has('BAN_MEMBERS')) {
                    sendResult(`**[BAN-SYNC]**: Successfully banned user ${ban.user.username}#${ban.user.discriminator} ${ban.reason ? `(initial reason: ${ban.reason})` : ''} from guild ${guild.name} (owner: ${guild.owner.user.username})`);
                    bannedMembers[ban.user.id] = true;
                    totalBanned++;
                }
            });
        });

        if (!totalBanned) {
            return message.say(`**[BAN-SYNC]**: All guilds have matching ban lists!`);
        }

        return message.say(`**[BAN-SYNC]**: Synced a total of ${totalBanned} bans.`);
    }
}
