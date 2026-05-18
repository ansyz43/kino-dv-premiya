# Деплой на Timeweb VPS (Ubuntu 22.04 / 24.04)

Эта инструкция поднимает сайт `kino` (Fastify + статика `site/`) на чистой VPS Timeweb. Получатель тестовых заявок — `kisuke43@gmail.com`.

> На Beget (shared) PHP-форма уже встроена — см. [BEGET_DEPLOY.md](BEGET_DEPLOY.md). Здесь инструкция именно для VPS.

---

## 0. Что вам понадобится

- Купленная VPS Timeweb (минимум 1 vCPU / 1 GB RAM, Ubuntu 22.04 LTS).
- IP-адрес сервера и root-пароль из письма Timeweb.
- Домен, привязанный A-записью к IP сервера (Timeweb DNS → A-запись `kinodvk.ru` → IP).
- (опционально) Telegram-бот, если хотите дублировать заявки в чат: токен от `@BotFather` и `chat_id`.

---

## 1. Первое подключение и базовая безопасность

С локальной машины (Windows PowerShell):

```powershell
ssh root@<IP_сервера>
```

На сервере создаём пользователя и закрываем root-логин:

```bash
adduser kino
usermod -aG sudo kino
# скопировать ssh-ключ (если есть):
rsync --archive --chown=kino:kino ~/.ssh /home/kino
# или для пароля — пропустить копирование

# простой firewall
apt update && apt -y install ufw
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable
```

Перелогиниваемся под `kino`:

```bash
exit
ssh kino@<IP_сервера>
```

---

## 2. Установка Node.js 20 и nginx

```bash
# Node 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs git nginx

node -v   # должно быть v20.x
```

---

## 3. Получение кода

```bash
sudo mkdir -p /var/www
sudo chown kino:kino /var/www
cd /var/www
git clone https://github.com/<ВАШ_GH_АККАУНТ>/Kinodvk.git kino
cd kino
npm ci --omit=dev
```

---

## 4. Переменные окружения

```bash
sudo install -d -m 750 -o kino -g kino /etc/kino
sudo -u kino tee /etc/kino/env >/dev/null <<'EOF'
PORT=3000
HOST=127.0.0.1

# SMTP — отправка заявок на почту (через smtp.beget.com)
SMTP_HOST=smtp.beget.com
SMTP_PORT=465
SMTP_SECURE=ssl
SMTP_USER=noreply@kinodvk.ru
SMTP_PASS=ПАРОЛЬ_ОТ_ЯЩИКА
MAIL_FROM=noreply@kinodvk.ru
MAIL_TO=kisuke43@gmail.com

# (опционально) дубликат заявок в Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
sudo chmod 640 /etc/kino/env
```

Сначала создайте на Beget ящик `noreply@<домен>` и впишите его пароль в `SMTP_PASS`.
Если SMTP не задан и Telegram тоже — сервер примет заявку и запишет её в логи, но никуда не отправит.

---

## 5. systemd-юнит

```bash
sudo tee /etc/systemd/system/kino.service >/dev/null <<'EOF'
[Unit]
Description=Kino site (Fastify)
After=network.target

[Service]
Type=simple
User=kino
WorkingDirectory=/var/www/kino
EnvironmentFile=/etc/kino/env
ExecStart=/usr/bin/node server/index.mjs
Restart=always
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now kino
sudo systemctl status kino --no-pager
curl http://127.0.0.1:3000/api/health   # → {"ok":true}
```

---

## 6. nginx + HTTPS

```bash
sudo tee /etc/nginx/sites-available/kino >/dev/null <<'EOF'
server {
  listen 80;
  server_name kinodvk.ru www.kinodvk.ru;

  client_max_body_size 4m;
  gzip on; gzip_types text/css application/javascript image/svg+xml;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF

sudo ln -sf /etc/nginx/sites-available/kino /etc/nginx/sites-enabled/kino
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Сертификат Let's Encrypt:

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d kinodvk.ru -d www.kinodvk.ru \
  --agree-tos -m kisuke43@gmail.com --redirect --non-interactive
sudo systemctl enable --now certbot.timer
```

Готово — сайт по `https://kinodvk.ru`.

---

## 7. (опционально) Включить `mail.php` на VPS

Если хотите чтобы форма слала письма прямо с VPS (а не только в Telegram):

```bash
sudo apt -y install php8.3-fpm php8.3-cli
```

Добавьте в `server { }` в `/etc/nginx/sites-available/kino` **выше** `location /`:

```nginx
location = /mail.php {
  root /var/www/kino/site;
  fastcgi_pass unix:/run/php/php8.3-fpm.sock;
  fastcgi_param SCRIPT_FILENAME /var/www/kino/site/mail.php;
  include fastcgi_params;
}
```

Создайте `site/mail.config.php` (см. `mail.config.example.php`) и установите `mode=smtp` с данными `smtp.beget.com`, либо настройте локальный postfix.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. Обновление сайта

```bash
cd /var/www/kino
git pull
npm ci --omit=dev
sudo systemctl restart kino
```

---

## 9. Полезные команды

```bash
sudo journalctl -u kino -f          # логи бэкенда
sudo systemctl restart kino         # рестарт
sudo nginx -t && sudo systemctl reload nginx
sudo certbot renew --dry-run        # проверка авто-обновления сертификата
```
