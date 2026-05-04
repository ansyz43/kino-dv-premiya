# CLI — запуск и деплой

## Локально (Windows / PowerShell)

```powershell
cd c:\Users\Admin\Downloads\kino

# 1. Node 20+ (один раз)
node -v   # >= 20

# 2. Зависимости
npm install

# 3. .env с токенами
Copy-Item .env.example .env
notepad .env
# вписать TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID

# 4. Старт
npm run dev
# → http://localhost:3000
```

Открыть [http://localhost:3000](http://localhost:3000), нажать «Подать заявку», заполнить — должно прилететь в Telegram.

---

## Получить TELEGRAM_BOT_TOKEN и CHAT_ID

1. В Telegram: пишем [@BotFather](https://t.me/BotFather) → `/newbot` → имя → username (заканчивается на `bot`) → копируем `BOT_TOKEN`.
2. Своему боту пишем любое сообщение (например, `/start`).
3. Открываем в браузере (вместо `<TOKEN>` свой токен):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   В ответе ищем `"chat":{"id": 123456789, ...}` → это `CHAT_ID`.
4. Если хочешь в группу — добавь бота в группу, отправь сообщение в группу, тот же `getUpdates` покажет `id` группы (отрицательное число).

---

## Деплой на VPS Timeweb (Ubuntu 22.04)

### 1. Сервер
В панели Timeweb создаём VPS: 1 vCPU / 2 GB / 20 GB SSD / Ubuntu 22.04.
Привязываем домен `кинопремиядв.рф` → A-запись на IP VPS.

### 2. Подключаемся
```bash
ssh root@<IP>
adduser deploy && usermod -aG sudo deploy
su - deploy
```

### 3. Node 20 + Caddy
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git caddy
node -v
```

### 4. Кладём проект
```bash
cd /srv
sudo mkdir kino && sudo chown deploy:deploy kino
cd kino
git clone <твой-git-url> .   # или scp с локальной машины
npm ci --omit=dev
cp .env.example .env
nano .env                     # вставить TELEGRAM_BOT_TOKEN и CHAT_ID
```

### 5. systemd сервис
```bash
sudo tee /etc/systemd/system/kino.service > /dev/null <<'EOF'
[Unit]
Description=Kino site
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/srv/kino
EnvironmentFile=/srv/kino/.env
ExecStart=/usr/bin/node server/index.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now kino
sudo systemctl status kino
```

### 6. Caddy с авто-HTTPS
```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
кинопремиядв.рф, www.кинопремиядв.рф {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
EOF

sudo systemctl reload caddy
```
Caddy сам выпустит TLS-сертификат Let's Encrypt. Готово.

### 7. Обновление
```bash
cd /srv/kino
git pull
npm ci --omit=dev
sudo systemctl restart kino
```

---

## Проверка
```bash
curl http://localhost:3000/api/health
# {"ok":true}

curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+79991234567","company":""}'
# {"ok":true}  и сообщение прилетает в TG
```

## Логи
```bash
sudo journalctl -u kino -f
```
