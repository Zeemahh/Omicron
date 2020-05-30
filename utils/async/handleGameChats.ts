import { GuildMember } from 'discord.js';
import { getAuthLvlFromMember, hsgRoleMap } from '../functions';
import { getApiKeyForAuth, API_ENDPOINT, isLocalServer } from '../../config';
import fetch from 'node-fetch';

/**
 * Handles chat message sending for certain streams from Discord->in-game
 *
 * @param member The guild member of sender.
 * @param chatChannel The channel to send the message content to in-game.
 * @param content Content to be sent to in-game.
 */
export default async function handleDiscordToGameChat({ member, chatChannel, content }: { member: GuildMember; chatChannel: string; content: string; }): Promise<{
    ok: boolean;
    response?: string,
    code?: number
}> {
    const currentAuth = getAuthLvlFromMember(member);
    const apiKey = getApiKeyForAuth(currentAuth);
    const isAllowed = ((chatChannel === 'MC' || chatChannel === 'GS') && currentAuth.rank >= hsgRoleMap.GS.rank) ||
                    (chatChannel === 'AG' && currentAuth.rank >= hsgRoleMap.A1.rank) ||
                    (chatChannel === 'AR' && currentAuth.rank >= hsgRoleMap.A3.rank);

    if (!apiKey || !isAllowed) {
        return {
            ok: false,
            response: 'Insufficient permissions.',
            code: !apiKey ? 50001 : 50000
        };
    }

    const req = await fetch(`http://${API_ENDPOINT}/${isLocalServer() ? 'hsg-server' : 'hsg-rp'}/sendMessageToGame`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': apiKey
        },
        body: JSON.stringify({
            content,
            channel: chatChannel,
            adminDets: {
                name: member.user.tag,
                authLvl: currentAuth.acronym
            }
        })
    });

    const data = await req.json();

    if (!data.ok) {
        console.log(data);
        return {
            ok: false,
            response: data.response
        };
    }

    return {
        ok: true
    };
}
