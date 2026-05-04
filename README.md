# Сайт «Дальневосточная Кинопремия»

Промо-лендинг (HTML/CSS из брифа — точная копия) + форма «Оставить заявку» с уведомлением в Telegram.

## Документы
- [docs/TZ.md](docs/TZ.md) — техническое задание.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — архитектура и хостинг.
- [docs/CLI.md](docs/CLI.md) — запуск, получение TG-токена, деплой на Timeweb VPS.

## Структура
```
site/index.html   — макет 1:1 (с добавленной модалкой формы)
site/app.js       — модалка + fetch /api/lead
server/index.mjs  — Fastify: статика + /api/lead → Telegram
.env.example      — TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
```

## Быстрый старт
```powershell
npm install
Copy-Item .env.example .env   # вписать TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
npm run dev
# открыть http://localhost:3000
```

## Хостинг
**Timeweb VPS** (1 vCPU / 2 GB / 20 GB SSD / Ubuntu 22.04) — этого достаточно.
Подробный деплой: [docs/CLI.md](docs/CLI.md) (systemd + Caddy с авто-TLS).
