import { client } from '../bot';
import { getInitTicketChannel } from '../config';

client.on('messageReactionAdd', async (reaction, user) => {
    const message = reaction.message;
    const author = message.author;
    const guild = message.guild;
    const ticketInitChannel = getInitTicketChannel(guild);

    if (0) {
        console.log(ticketInitChannel.id);
        console.log(user);
    }

    if (author.id !== client.user.id) {
        return;
    }
});
