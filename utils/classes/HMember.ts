import { Client, GuildMember, Guild } from 'discord.js';
import { IAuthLevelMap, getAuthLvlFromMember } from '../functions';

export class HMember extends GuildMember {
    constructor(client: Client, data: object, guild: Guild) {
        super(client, data, guild);
    }

    public AuthLevel(): IAuthLevelMap {
        return getAuthLvlFromMember(this) ?? null;
    }
}
