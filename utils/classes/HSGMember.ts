import { Client, GuildMember, Guild } from 'discord.js';
import { IHsgAuthLvl, getAuthLvlFromMember } from '../functions';

export class HSGMember extends GuildMember {
    constructor(client: Client, data: object, guild: Guild) {
        super(client, data, guild);
    }

    public authLvl(): IHsgAuthLvl {
        const authLvl = getAuthLvlFromMember(this);
        if (authLvl) {
            return authLvl;
        }
    }
}
