from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo
from aiogram.utils import executor
import os

TOKEN = os.getenv("8390052911:AAGe_-E0EIidr489gIfC_U7_iNf3CLK1LyM")  # или вставь напрямую
WEBAPP_URL = "https://yourdomain.com/index.html"  # ссылка на твой WebApp

bot = Bot(token=TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    button = types.KeyboardButton(text="💬 Открыть чат", web_app=WebAppInfo(url=WEBAPP_URL))
    keyboard.add(button)
    await message.answer("Привет! Открой мини-чат с ИИ 👇", reply_markup=keyboard)

if __name__ == '__main__':
    executor.start_polling(dp)