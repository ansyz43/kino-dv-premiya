# Деплой на Timeweb Cloud Apps

## Подготовка (локально, один раз)

```powershell
# 1. инициализировать git
cd C:\Users\Admin\Downloads\kino
git init
git add .
git commit -m "init: дальневосточная кинопремия 2026"

# 2. создать пустой репо на github.com/gitlab.com (через UI)
#    скопировать его HTTPS URL, например https://github.com/USER/kino.git

# 3. запушить
git branch -M main
git remote add origin https://github.com/USER/kino.git
git push -u origin main
```

## На Timeweb Cloud

1. **timeweb.cloud** → войти → **Облачные сервисы → Apps → Создать**
2. **Тип приложения:** Backend → **Node.js**
3. **Версия Node:** 20
4. **Источник:** подключить GitHub/GitLab → выбрать репо `kino` → ветка `main`
5. **Команда сборки:** `npm install`
6. **Команда запуска:** `npm start`
7. **Порт приложения:** `3000`
8. **Переменные окружения** (раздел Variables/Env):
   ```
   TELEGRAM_BOT_TOKEN = <токен от @BotFather>
   TELEGRAM_CHAT_ID   = <твой chat id>
   NODE_ENV           = production
   PORT               = 3000
   HOST               = 0.0.0.0
   ```
9. **Тариф:** минимальный (256–512 МБ RAM хватит с запасом)
10. **Создать приложение** → ждать ~1–2 мин сборки
11. Получаешь URL вида `https://your-app.twc1.net` — открывай, проверяй `/api/health`

## Как получить Telegram credentials

**Бот:**
1. В Telegram → `@BotFather` → `/newbot` → следуй инструкциям
2. Получаешь токен вида `1234567890:ABC-DEF...`

**Chat ID:**
1. Напиши своему боту любое сообщение (например `/start`)
2. Открой в браузере: `https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/getUpdates`
3. Найди `"chat":{"id":...}` — это и есть `TELEGRAM_CHAT_ID`

## Обновление сайта после правок

```powershell
git add .
git commit -m "обновление текстов"
git push
```

Timeweb Apps автоматически пересобирает приложение при пуше в `main`.

## Кастомный домен

В настройках приложения → **Домены** → добавить свой → прописать у регистратора CNAME на адрес который покажет Timeweb. HTTPS-сертификат Let's Encrypt выпускается автоматически.

## Чек-лист перед деплоем

- [ ] `.env` НЕ закоммичен (он в `.gitignore`)
- [ ] `node_modules/` НЕ закоммичен
- [ ] `.env.example` закоммичен (как образец)
- [ ] Telegram токен валиден (отправил тестовое через `/api/lead`)
- [ ] Кастомный домен настроен (опционально)
