import { Command, CommandoClient } from 'discord.js-commando';
import { MESSAGES } from '../../utils/constants';
import { HMessage } from '../../utils/classes/HMessage';
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

    public async run(message: HMessage) {
        const allBans: { user: User, reason?: string }[] = [];
        const sendResult: (content: string) => void = (content: string) => {
            const ch = this.client.channels.cache.get('627501333439578112');
            if (ch && ch instanceof TextChannel) {
                ch.send(content);
            }
        };

        for (const [ , guild ] of this.client.guilds.cache) {
            const bans = await guild.fetchBans();
            bans.forEach(ban => {
                allBans.push({ user: ban.user, reason: ban.reason });
            });
        }

        console.log(allBans);

        const bannedMembers: { [key: string]: boolean } = {};
        let totalBanned = 0;
        this.client.guilds.cache.forEach(guild => {
            allBans.forEach(async ban => {
                const members = guild.members.cache;
                const mem = members.get(ban.user.id);
                if (mem && guild.me.permissions.has('BAN_MEMBERS')) {
                    sendResult(`**[BAN-SYNC]**: Successfully banned user ${ban.user.username}#${ban.user.discriminator} ${ban.reason ? `(initial reason: ${ban.reason})` : ''} from guild ${guild.name} (owner: ${guild.owner.user.username})`);
                    mem.ban({
                        reason: ban.reason
                    });
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
