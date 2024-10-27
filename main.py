from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext

# Replace 'YOUR_TOKEN' with your bot's API token
TOKEN = '7847521628:AAHn0CiVxcWZF2mG0leMLzRTsCS134xz0PE'

def start(update: Update, context: CallbackContext) -> None:
    """Send a message when the command /start is issued."""
    update.message.reply_text('Hello! I am here to help manage your group chat.')

def help_command(update: Update, context: CallbackContext) -> None:
    """Send a message when the command /help is issued."""
    update.message.reply_text('Available commands:\n/start - Welcome message\n/help - Help message')

def kick_user(update: Update, context: CallbackContext) -> None:
    """Kick a user from the group when the command /kick is issued."""
    if context.args:
        user_id = context.args[0]
        try:
            context.bot.kick_chat_member(update.effective_chat.id, user_id)
            update.message.reply_text(f'User {user_id} has been kicked from the group.')
        except Exception as e:
            update.message.reply_text(f'Failed to kick user: {e}')
    else:
        update.message.reply_text('Usage: /kick <user_id>')

def main() -> None:
    """Start the bot."""
    updater = Updater(TOKEN)

    dispatcher = updater.dispatcher
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("help", help_command))
    dispatcher.add_handler(CommandHandler("kick", kick_user))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()