# Архитектура

## Простая и достаточная

```
Browser ──HTTPS──► Caddy/Nginx (TLS) ──► Node.js (Fastify :3000)
                                              │
                              ┌───────────────┼───────────────┐
                              │ статика site/ │ POST /api/lead │
                              │ index.html    │   ↓            │
                              │ app.js        │ Telegram Bot   │
                              └───────────────┴────────────────┘
                                                       │
                                                       ▼
                                                 личный чат / группа
```

## Стек
- **Node.js 20** + **Fastify** — статика + 1 endpoint.
- **`@fastify/static`** отдаёт `site/index.html` и `site/app.js`.
- **`@fastify/rate-limit`** — 5 запросов/мин на IP.
- **Telegram Bot API** (`sendMessage`, parse_mode: HTML).
- **Caddy** перед Node — авто-TLS Let's Encrypt (или Nginx — на выбор).
- **systemd** держит процесс.

## Файлы
```
kino/
├─ site/
│  ├─ index.html          # ТОЧНАЯ копия твоего макета (+ модалка в конце <body>)
│  └─ app.js              # модалка + fetch /api/lead
├─ server/
│  └─ index.mjs           # Fastify: статика + /api/lead → Telegram
├─ docs/
│  ├─ TZ.md
│  ├─ ARCHITECTURE.md
│  └─ CLI.md
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
```

## Хостинг: VPS Timeweb — нужен ли отдельный сервер?
**Достаточно VPS, dedicated не нужен.**

| Параметр | Минимум | Рекомендация |
|---|---|---|
| CPU | 1 vCPU | 1–2 vCPU |
| RAM | 1 GB | 2 GB |
| SSD | 15 GB | 20 GB |
| ОС | Ubuntu 22.04 / Debian 12 | Ubuntu 22.04 LTS |

Это закрывает: лендинг + Node + TLS + nginx/caddy + место под логи. Лендинг статический, нагрузка копеечная — 1 vCPU выдерживает тысячи запросов/мин.

**Когда стоит апгрейдить:**
- Если будут заливать видео/постеры → +S3-хранилище (Timeweb Cloud Storage / Selectel).
- Если планируется CMS + БД (новости, архив) → +1 GB RAM и Postgres.
- Если ожидается поток >100k посетителей в сутки → CDN (Cloudflare бесплатный достаточен).

## Безопасность
- Токен бота **только** в `.env` на сервере, в репо не коммитится (`.gitignore`).
- `trustProxy: true` для корректного IP за Caddy/Nginx.
- Rate-limit 5/min/IP + honeypot.
- Экранирование HTML в Telegram-сообщении.
- HTTPS-only, HSTS через Caddy.
- Согласие 152-ФЗ обязательное чекбокс-полем.
