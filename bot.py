import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo
from aiogram.utils.keyboard import ReplyKeyboardBuilder
from aiogram import F
from aiogram.utils import executor

# Загрузка переменных окружения из .env
load_dotenv()

TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL')

if not TOKEN or not WEBAPP_URL:
    raise RuntimeError("Не найдены переменные TELEGRAM_BOT_TOKEN или WEBAPP_URL в окружении")

# Инициализация бота и диспетчера
bot = Bot(token=TOKEN, parse_mode="HTML")
dp = Dispatcher()

# Хэндлер на команду /start
@dp.message(F.text == "/start")
async def cmd_start(message: types.Message):
    kb = ReplyKeyboardBuilder()
    kb.button(
        text="💬 Открыть чат",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
    kb.adjust(1)
    await message.answer(
        "Привет! Нажми на кнопку ниже, чтобы открыть мини-чат с ИИ:",
        reply_markup=kb.as_markup(resize_keyboard=True)
    )

# Запуск поллинга
if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
