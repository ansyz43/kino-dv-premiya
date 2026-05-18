// Минимальный сервер: статика site/ + POST /api/lead -> SMTP-почта и/или Telegram
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { connect as tlsConnect } from 'node:tls';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = join(ROOT, 'site');

// --- авто-загрузка .env (без зависимостей) ---
const envPath = join(ROOT, '.env');
if (existsSync(envPath)) {
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
  console.log('[OK] .env загружен');
}

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

// --- Telegram (опционально) ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

// --- SMTP (для отправки писем) ---
const SMTP_HOST   = process.env.SMTP_HOST   || '';                // напр. smtp.beget.com
const SMTP_PORT   = Number(process.env.SMTP_PORT || 465);          // 465=SSL, 587=STARTTLS
const SMTP_SECURE = (process.env.SMTP_SECURE || 'ssl').toLowerCase(); // 'ssl' | 'tls'
const SMTP_USER   = process.env.SMTP_USER   || '';
const SMTP_PASS   = process.env.SMTP_PASS   || '';
const MAIL_FROM   = process.env.MAIL_FROM   || SMTP_USER;
const MAIL_TO     = process.env.MAIL_TO     || 'kisuke43@gmail.com';

const HAS_MAIL = !!(SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_FROM);
const HAS_TG   = !!(BOT_TOKEN && CHAT_ID);

if (!HAS_MAIL && !HAS_TG) {
  console.warn('[WARN] Не задан ни SMTP, ни Telegram — заявки не будут отправляться.');
} else {
  if (HAS_MAIL) console.log(`[OK] SMTP настроен: ${SMTP_HOST}:${SMTP_PORT} (${SMTP_SECURE}) → ${MAIL_TO}`);
  if (HAS_TG)   console.log('[OK] Telegram настроен');
}

const app = Fastify({ logger: true, trustProxy: true, bodyLimit: 16 * 1024 });

await app.register(rateLimit, {
  global: false,
  max: 5,
  timeWindow: '1 minute'
});

await app.register(fastifyStatic, {
  root: SITE,
  prefix: '/',
  index: ['index.html']
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ============================================================
 * SMTP-клиент (без внешних зависимостей).
 * Поддерживает SSL (465) и STARTTLS (587/2525).
 * ============================================================ */
function smtpDialog(socket) {
  let buffer = '';
  const queue = [];
  let resolver = null;
  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    let idx;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx + 1);
      buffer = buffer.slice(idx + 1);
      queue.push(line);
      if (line.length >= 4 && line[3] === ' ') {
        if (resolver) {
          const collected = queue.splice(0).join('');
          const r = resolver; resolver = null;
          r(collected);
        }
      }
    }
  });
  return {
    async read() {
      if (queue.length) {
        const last = queue.findIndex(l => l.length >= 4 && l[3] === ' ');
        if (last !== -1) {
          const collected = queue.splice(0, last + 1).join('');
          return collected;
        }
      }
      return new Promise((res) => { resolver = res; });
    },
    write(line) { socket.write(line + '\r\n'); }
  };
}

async function sendSmtpMail({ subject, text, html }) {
  return new Promise((resolve, reject) => {
    let socket;
    const useSsl = SMTP_SECURE === 'ssl';
    const onError = (err) => { try { socket?.destroy(); } catch {} reject(err); };
    const timer = setTimeout(() => onError(new Error('SMTP timeout')), 20000);

    const start = async (sock) => {
      try {
        socket = sock;
        sock.setEncoding('utf8');
        sock.on('error', onError);
        const dlg = smtpDialog(sock);
        const expect = async (codes) => {
          const r = await dlg.read();
          if (!codes.split(',').some(c => r.startsWith(c))) {
            throw new Error('SMTP unexpected: ' + r.trim());
          }
          return r;
        };

        await expect('220');
        dlg.write('EHLO localhost');
        await expect('250');

        if (SMTP_SECURE === 'tls') {
          dlg.write('STARTTLS');
          await expect('220');
          const tls = tlsConnect({ socket: sock, servername: SMTP_HOST, rejectUnauthorized: false });
          await new Promise((r, e) => { tls.once('secureConnect', r); tls.once('error', e); });
          socket = tls;
          tls.setEncoding('utf8');
          const dlg2 = smtpDialog(tls);
          dlg2.write('EHLO localhost');
          await new Promise((r) => setTimeout(r, 30));
          // переключаемся на новый dlg
          return doAuthAndSend(dlg2, resolve, onError, timer, subject, text, html);
        }
        return doAuthAndSend(dlg, resolve, onError, timer, subject, text, html);
      } catch (err) { onError(err); }
    };

    if (useSsl) {
      const sock = tlsConnect({ host: SMTP_HOST, port: SMTP_PORT, servername: SMTP_HOST, rejectUnauthorized: false });
      sock.once('secureConnect', () => start(sock));
      sock.once('error', onError);
    } else {
      const sock = createConnection({ host: SMTP_HOST, port: SMTP_PORT });
      sock.once('connect', () => start(sock));
      sock.once('error', onError);
    }
  });
}

async function doAuthAndSend(dlg, resolve, onError, timer, subject, text, html) {
  try {
    const expect = async (codes) => {
      const r = await dlg.read();
      if (!codes.split(',').some(c => r.startsWith(c))) {
        throw new Error('SMTP unexpected: ' + r.trim());
      }
      return r;
    };

    dlg.write('AUTH LOGIN');
    await expect('334');
    dlg.write(Buffer.from(SMTP_USER, 'utf8').toString('base64'));
    await expect('334');
    dlg.write(Buffer.from(SMTP_PASS, 'utf8').toString('base64'));
    await expect('235');

    dlg.write(`MAIL FROM:<${MAIL_FROM}>`);
    await expect('250');
    dlg.write(`RCPT TO:<${MAIL_TO}>`);
    await expect('250,251');
    dlg.write('DATA');
    await expect('354');

    const boundary = 'b_' + randomBytes(8).toString('hex');
    const b64 = (s) => '=?UTF-8?B?' + Buffer.from(s, 'utf8').toString('base64') + '?=';

    const lines = [
      `From: ${b64('Кинопремия — форма')} <${MAIL_FROM}>`,
      `To: ${MAIL_TO}`,
      `Subject: ${b64(subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${randomBytes(8).toString('hex')}@kinodvk>`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      text,
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      html,
      `--${boundary}--`,
      ''
    ];
    // экранируем строки начинающиеся с точки
    const body = lines.join('\r\n').replace(/\r\n\./g, '\r\n..');
    dlg.write(body + '\r\n.');
    await expect('250');
    dlg.write('QUIT');
    clearTimeout(timer);
    resolve(true);
  } catch (err) { onError(err); }
}

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Telegram ${res.status}: ${body.slice(0, 200)}`);
  }
}

app.post('/api/lead', {
  config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
}, async (req, reply) => {
  const { name, phone, company, page } = req.body || {};

  // honeypot — боты заполнят, люди не увидят
  if (company && String(company).trim() !== '') {
    return { ok: true }; // молча
  }

  const cleanName = String(name || '').trim().slice(0, 80);
  const cleanPhone = String(phone || '').trim().slice(0, 32);

  if (cleanName.length < 2) return reply.code(400).send({ ok: false, error: 'Имя слишком короткое' });
  if (cleanPhone.replace(/\D/g, '').length < 6) {
    return reply.code(400).send({ ok: false, error: 'Некорректный телефон' });
  }

  if (!HAS_MAIL && !HAS_TG) {
    // Заявка валидна, но никакой канал не настроен — пишем в логи, отвечаем 200,
    // чтобы пользователь не видел "сервер недоступен" из-за серверной конфигурации.
    req.log.warn({ name: cleanName, phone: cleanPhone, page }, 'LEAD (no transport configured)');
    return { ok: true, warn: 'no-transport' };
  }

  const ip = req.ip;
  const ua = req.headers['user-agent'] || '';
  const ts = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Vladivostok' });
  const subj = 'Новая заявка — Кинопремия';

  const plain =
    `Новая заявка — Дальневосточная Кинопремия\n` +
    `----------------------------------------\n` +
    `Имя:       ${cleanName}\n` +
    `Телефон:   ${cleanPhone}\n` +
    `Страница:  ${page || '/'}\n` +
    `Время:     ${ts} (Влд)\n` +
    `IP:        ${ip}\n` +
    `UA:        ${String(ua).slice(0, 200)}\n`;

  const html =
    `<h2 style="font-family:Arial,sans-serif">🎬 ${escapeHtml(subj)}</h2>` +
    `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
    `<tr><td><b>Имя</b></td><td>${escapeHtml(cleanName)}</td></tr>` +
    `<tr><td><b>Телефон</b></td><td>${escapeHtml(cleanPhone)}</td></tr>` +
    `<tr><td><b>Страница</b></td><td>${escapeHtml(page || '/')}</td></tr>` +
    `<tr><td><b>Время</b></td><td>${escapeHtml(ts)} (Влд)</td></tr>` +
    `<tr><td><b>IP</b></td><td>${escapeHtml(ip)}</td></tr>` +
    `<tr><td><b>UA</b></td><td>${escapeHtml(String(ua).slice(0, 200))}</td></tr>` +
    `</table>`;

  const tgMsg =
    `<b>🎬 Новая заявка — Кинопремия</b>\n` +
    `<b>Имя:</b> ${escapeHtml(cleanName)}\n` +
    `<b>Телефон:</b> <code>${escapeHtml(cleanPhone)}</code>\n` +
    `<b>Страница:</b> ${escapeHtml(page || '/')}\n` +
    `<b>Время (Влд):</b> ${escapeHtml(ts)}\n` +
    `<b>IP:</b> <code>${escapeHtml(ip)}</code>\n` +
    `<b>UA:</b> ${escapeHtml(String(ua).slice(0, 200))}`;

  const results = await Promise.allSettled([
    HAS_MAIL ? sendSmtpMail({ subject: subj, text: plain, html }) : null,
    HAS_TG   ? sendTelegram(tgMsg) : null
  ].filter(Boolean));

  const anyOk = results.some(r => r.status === 'fulfilled');
  if (!anyOk) {
    const errs = results.map(r => r.reason?.message || String(r.reason)).join(' | ');
    req.log.error({ errs }, 'Все каналы доставки заявки упали');
    return reply.code(502).send({ ok: false, error: 'Не удалось отправить заявку' });
  }

  // если хоть один канал отвалился — лог, но клиенту OK
  for (const r of results) {
    if (r.status === 'rejected') req.log.warn({ err: r.reason?.message }, 'Один из каналов упал');
  }
  return { ok: true };
});

app.get('/api/health', async () => ({ ok: true }));

try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Site → http://${HOST}:${PORT}/`);
} catch (e) {
  app.log.error(e);
  process.exit(1);
}
