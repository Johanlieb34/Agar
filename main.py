from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext
from telegram_bot import start, help_command, kick_user  # Importing module

# Replace 'YOUR_TOKEN' with your bot's API token
TOKEN = '7847521628:AAHn0CiVxcWZF2mG0leMLzRTsCS134xz0PE'

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