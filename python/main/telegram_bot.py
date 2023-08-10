from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler
import util
import requests
import json
import config

async def telegram_command_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="Hello, I am HexDecChaos bot")

async def telegram_command_register(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    otp = util.generate_otp()
    data = {}
    data['otp'] = otp
    data['chat_id'] = chat_id
    response = requests.post('http://127.0.0.1:5000/telegram/register/cache', json=json.dumps(data))
    message = 'please try later'
    if(response.text == "success"):
        message = f'please use "{otp}" to register'
    await context.bot.send_message(chat_id=chat_id, text=message)

application = ApplicationBuilder().token(config.TELEGRAM_BOT_TOKEN).build()
    
start_handler = CommandHandler('start', telegram_command_start)
register_handler = CommandHandler('register', telegram_command_register)
application.add_handler(start_handler)
application.add_handler(register_handler)

if __name__ == '__main__':
    application.run_polling()