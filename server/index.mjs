// Минимальный сервер: статика site/ + POST /api/lead -> Telegram
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = join(ROOT, 'site');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.warn('[WARN] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — заявки не будут отправляться.');
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

  if (!BOT_TOKEN || !CHAT_ID) {
    req.log.error({ name: cleanName, phone: cleanPhone }, 'Telegram не настроен — заявка не доставлена');
    return reply.code(503).send({ ok: false, error: 'Сервер временно недоступен' });
  }

  const ip = req.ip;
  const ua = req.headers['user-agent'] || '';
  const ts = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Vladivostok' });

  const msg =
    `<b>🎬 Новая заявка — Кинопремия</b>\n` +
    `<b>Имя:</b> ${escapeHtml(cleanName)}\n` +
    `<b>Телефон:</b> <code>${escapeHtml(cleanPhone)}</code>\n` +
    `<b>Страница:</b> ${escapeHtml(page || '/')}\n` +
    `<b>Время (Влд):</b> ${escapeHtml(ts)}\n` +
    `<b>IP:</b> <code>${escapeHtml(ip)}</code>\n` +
    `<b>UA:</b> ${escapeHtml(String(ua).slice(0, 200))}`;

  try {
    await sendTelegram(msg);
    return { ok: true };
  } catch (err) {
    req.log.error({ err: err.message }, 'Ошибка отправки в Telegram');
    return reply.code(502).send({ ok: false, error: 'Не удалось отправить заявку' });
  }
});

app.get('/api/health', async () => ({ ok: true }));

try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Site → http://${HOST}:${PORT}/`);
} catch (e) {
  app.log.error(e);
  process.exit(1);
}
