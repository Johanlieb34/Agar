const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your bot token
const bot = new TelegramBot('8104826949:AAHv0ejQ11MGnZSUMjqwyD5r4LP78y3D_3A', { polling: true });

// Set up a list for tracking muted users
const mutedUsers = new Set();

// Anti-link feature variable
let antiLinkActive = false;

// Check if user is admin
const isAdmin = async (chatId, userId) => {
    try {
        const member = await bot.getChatMember(chatId, userId);
        return member.status === 'administrator' || member.status === 'creator';
    } catch (error) {
        return false;
    }
};

// Anti-link command
bot.onText(/\/antilink/, (msg) => {
    const chatId = msg.chat.id;
    antiLinkActive = !antiLinkActive; // Toggle the anti-link feature
    const status = antiLinkActive ? "activated" : "deactivated";
    bot.sendMessage(chatId, `Anti-link is now ${status}!`);
});

// Kick command
bot.onText(/\/kick/, async (msg) => {
    const chatId = msg.chat.id;
    if (msg.reply_to_message) {
        const userId = msg.reply_to_message.from.id; // User to kick must be mentioned in reply
        if (await isAdmin(chatId, msg.from.id)) {
            try {
                await bot.kickChatMember(chatId, userId);
                bot.sendMessage(chatId, "User has been kicked.");
            } catch (err) {
                bot.sendMessage(chatId, "Failed to kick user.");
            }
        } else {
            bot.sendMessage(chatId, "You don't have permission to use this command.");
        }
    } else {
        bot.sendMessage(chatId, "Please reply to a user's message to kick them.");
    }
});

// Mute command
bot.onText(/\/mute/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.reply_to_message) {
        const userId = msg.reply_to_message.from.id; // User to mute must be mentioned in reply
        mutedUsers.add(userId);
        bot.sendMessage(chatId, `User has been muted.`);
    } else {
        bot.sendMessage(chatId, "Please reply to a user's message to mute them.");
    }
});

// Unmute command
bot.onText(/\/unmute/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.reply_to_message) {
        const userId = msg.reply_to_message.from.id; // User to unmute must be mentioned in reply
        mutedUsers.delete(userId);
        bot.sendMessage(chatId, `User has been unmuted.`);
    } else {
        bot.sendMessage(chatId, "Please reply to a user's message to unmute them.");
    }
});

// Promote command
bot.onText(/\/promote/, async (msg) => {
    const chatId = msg.chat.id;
    if (msg.reply_to_message) {
        const userId = msg.reply_to_message.from.id; // User to promote must be mentioned in reply
        if (await isAdmin(chatId, msg.from.id)) {
            try {
                await bot.promoteChatMember(chatId, userId, {
                    can_change_info: true,
                    can_post_messages: true,
                    can_edit_messages: true,
                    can_delete_messages: true,
                    can_invite_users: true,
                    can_restrict_members: true,
                    can_pin_messages: true,
                    can_promote_members: true
                });
                bot.sendMessage(chatId, "User has been promoted to admin.");
            } catch (err) {
                bot.sendMessage(chatId, "Failed to promote user.");
            }
        } else {
            bot.sendMessage(chatId, "You don't have permission to use this command.");
        }
    } else {
        bot.sendMessage(chatId, "Please reply to a user's message to promote them.");
    }
});

// Demote command
bot.onText(/\/demote/, async (msg) => {
    const chatId = msg.chat.id;
    if (msg.reply_to_message) {
        const userId = msg.reply_to_message.from.id; // User to demote must be mentioned in reply
        if (await isAdmin(chatId, msg.from.id)) {
            try {
                await bot.promoteChatMember(chatId, userId, {
                    can_change_info: false,
                    can_post_messages: false,
                    can_edit_messages: false,
                    can_delete_messages: false,
                    can_invite_users: false,
                    can_restrict_members: false,
                    can_pin_messages: false,
                    can_promote_members: false
                });
                bot.sendMessage(chatId, "User has been demoted.");
            } catch (err) {
                bot.sendMessage(chatId, "Failed to demote user.");
            }
        } else {
            bot.sendMessage(chatId, "You don't have permission to use this command.");
        }
    } else {
        bot.sendMessage(chatId, "Please reply to a user's message to demote them.");
    }
});

// Set name command
bot.onText(/\/setname (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const newName = match[1];
    if (await isAdmin(chatId, msg.from.id)) {
        try {
            await bot.setChatTitle(chatId, newName);
            bot.sendMessage(chatId, `Group name has been changed to "${newName}".`);
        } catch (err) {
            bot.sendMessage(chatId, "Failed to change group name.");
        }
    } else {
        bot.sendMessage(chatId, "You don't have permission to use this command.");
    }
});

// Tag all command
bot.onText(/\/tagall/, async (msg) => {
    const chatId = msg.chat.id;
    if (await isAdmin(chatId, msg.from.id)) {
        const members = await bot.getChatAdministrators(chatId);
        const memberMentions = members.map(member => {
            return member.user.username ? `@${member.user.username}` : member.user.first_name;
        }).join(', ');
        
        bot.sendMessage(chatId, `Tagging all members:\n${memberMentions}`);
    } else {
        bot.sendMessage(chatId, "You don't have permission to use this command.");
    }
});

// Get link command
bot.onText(/\/getlink/, async (msg) => {
    const chatId = msg.chat.id;
    if (await isAdmin(chatId, msg.from.id)) {
        try {
            const link = await bot.exportChatInviteLink(chatId);
            bot.sendMessage(chatId, `Here is your invite link: ${link}`);
        } catch (err) {
            bot.sendMessage(chatId, "Failed to get the invite link.");
        }
    } else {
        bot.sendMessage(chatId, "You don't have permission to use this command.");
    }
});

// Welcome and goodbye messages
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    msg.new_chat_members.forEach(user => {
        bot.sendMessage(chatId, `Welcome ${user.first_name} to the group!`);
    });
});

bot.on('left_chat_member', (msg) => {
    const chatId = msg.chat.id;
    const user = msg.left_chat_member;
    bot.sendMessage(chatId, `${user.first_name} has left the group.`);
});

// Anti-link functionality
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Check if anti-link is active
    if (antiLinkActive && msg.entities) {
        msg.entities.forEach(entity => {
            if (entity.type === "url") {
                bot.deleteMessage(chatId, msg.message_id)
                    .then(() => {
                        bot.sendMessage(chatId, "Links are not allowed in this group.");
                    })
                    .catch(err => {
                        console.error("Failed to delete message:", err);
                    });
            }
        });
    }

    // Mute functionality
    if (mutedUsers.has(msg.from.id)) {
        bot.deleteMessage(chatId, msg.message_id)
            .catch(err => {
                console.error("Failed to delete muted user message:", err);
            });
    }
});

let spotifyAccessToken = '';

// Function to get Spotify access token
const getSpotifyAccessToken = async () => {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
    };

    try {
        const response = await axios(authOptions);
        spotifyAccessToken = response.data.access_token;
    } catch (error) {
        console.error('Failed to retrieve Spotify access token:', error);
    }
};

// Call `getSpotifyAccessToken` once at startup
getSpotifyAccessToken();

// Command to play a song
bot.onText(/\/play (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const songName = match[1];

    try {
        // Get a fresh access token if it's not set
        if (!spotifyAccessToken) await getSpotifyAccessToken();

        // Search for the song on Spotify
        const response = await axios.get(`https://api.spotify.com/v1/search`, {
            headers: { 'Authorization': `Bearer ${spotifyAccessToken}` },
            params: { q: songName, type: 'track', limit: 1 }
        });

        const track = response.data.tracks.items[0];
        if (track) {
            const audioUrl = track.preview_url; // Spotify's preview URL, not full track
            if (audioUrl) {
                bot.sendAudio(chatId, audioUrl);
            } else {
                bot.sendMessage(chatId, "No preview available for this song.");
            }
        } else {
            bot.sendMessage(chatId, "Could not find the requested song.");
        }
    } catch (error) {
        console.error('Error fetching song:', error);
        bot.sendMessage(chatId, "An error occurred while searching for the song.");
    }
});

// Start the bot
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome to the group manager bot! Use /help for available commands.");
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
Available commands:
- /kick: Kick a user from the group (reply to their message).
- /mute: Mute a user (reply to their message).
- /unmute: Unmute a user (reply to their message).
- /promote: Promote a user to admin (reply to their message).
- /demote: Demote an admin (reply to their message).
- /setname <new name>: Change the group name.
- /tagall: Tag all members of the group.
- /getlink: Get the group invite link.
- /play <song name>: Play a song (requires music API).
- /antilink: Toggle anti-link feature.
- /start: Start the bot and get the welcome message.
- /help: Show this help message.
`;

    bot.sendMessage(chatId, helpMessage);
});