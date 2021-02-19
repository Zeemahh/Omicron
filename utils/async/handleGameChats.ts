import { GuildMember } from 'discord.js';
import { getAuthLvlFromMember, hsgRoleMap, LogGate, LogState, timeLog } from '../functions';
import { API_ENDPOINT, getApiKeyForAuth, isLocalServer } from '../../config';
import fetch from 'node-fetch';

type ResponseResult = { ok: boolean, response?: string, code?: number };

/**
 * Handles chat message sending for certain streams from Discord->in-game
 *
 * @param member The guild member of sender.
 * @param chatChannel The channel to send the message content to in-game.
 * @param content Content to be sent to in-game.
 */
export default async function handleDiscordToGameChat({ member, chatChannel, content }: {
    member: GuildMember,
    chatChannel: 'MC' | 'SC' | 'AG' | 'AR',
    content: string
}): Promise<ResponseResult> {
    const currentAuth = getAuthLvlFromMember(member);
    const apiKey = getApiKeyForAuth(currentAuth);
    const isAllowed = ((chatChannel === 'MC' || chatChannel === 'SC') && currentAuth.rank >= hsgRoleMap.GS.rank) ||
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
        timeLog(`Error occurred when calling handleDiscordToGameChat:\n${data}`, LogGate.Always, LogState.Error);
        return {
            ok: false,
            response: data.response
        };
    }

    timeLog(`[D->G] | Channel: ${chatChannel} | ${member.displayName} sent: ${content}`, LogGate.Always, LogState.General);
    return {
        ok: true
    };
}

export const formatError: (res: ResponseResult) => string = (res: ResponseResult) => {
    return `\`\`\`json\n{\n\t"ok": ${res.ok},\n\t"response": "${res.response}"${res.code ? `,\n\t"code": ${res.code}\n` : '\n'}}\`\`\``;
}