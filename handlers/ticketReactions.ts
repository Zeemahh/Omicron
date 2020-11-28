import { client } from '../bot';
import { HGuild } from '../utils/classes/HGuild';

client.on('messageReactionAdd', async (reaction, user) => {
    const message = reaction.message;
    const author = message.author;
    const guild = message.guild;
    const ticketInitChannel = new HGuild(guild)?.Tickets.InitChannel;

    if (0) {
        console.log(ticketInitChannel.id);
        console.log(user);
    }

    if (author.id !== client.user.id) {
        return;
    }
});
