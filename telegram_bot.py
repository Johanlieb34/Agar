from telegram import Update
from telegram.ext import CallbackContext

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