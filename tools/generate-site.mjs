import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const siteDir = join(root, 'site');
const privacyPolicyHtml = await readFile(join(root, 'content', 'privacy-policy.html'), 'utf8');

const sourceIndex = await readFile(join(siteDir, 'index.html'), 'utf8');
const styleMatch = sourceIndex.match(/<style>([\s\S]*?)<\/style>/);
let baseCss;
if (styleMatch) {
  baseCss = styleMatch[1].trim();
} else {
  const existingCss = await readFile(join(siteDir, 'styles.css'), 'utf8');
  baseCss = existingCss.split('/* Multi-page structure */')[0].trim();
}

const pages = [
  { href: '/', label: 'Главная', id: 'home' },
  { href: '/about.html', label: 'О премии', id: 'about' },
  { href: '/nominations.html', label: 'Номинации', id: 'nominations' },
  { href: '/orgcommittee.html', label: 'Оргкомитет', id: 'orgcommittee' },
  { href: '/expert-council.html', label: 'Экспертный совет', id: 'expert-council' },
  { href: '/regulation.html', label: 'Регламент', id: 'regulation' },
  { href: '/program.html', label: 'Программа', id: 'program' },
  { href: '/archive.html', label: 'Архив', id: 'archive' },
  { href: '/news.html', label: 'Новости', id: 'news' },
  { href: '/partners.html', label: 'Партнёры', id: 'partners' },
  { href: '/contacts.html', label: 'Контакты', id: 'contacts' },
  { href: '/submit.html', label: 'Подать заявку', id: 'submit', cta: true },
];

const nominations = [
  ['I', 'Лучший полнометражный игровой, неигровой, анимационный фильм или сериал', 'Вручается продюсеру картины. Хронометраж: от 60 минут для игровых, от 52 минут для неигровых.'],
  ['II', 'Лучшая режиссёрская работа', 'Награда режиссёру за выдающуюся постановочную работу в полнометражном игровом, неигровом, анимационном фильме или сериале.'],
  ['III', 'Лучший сценарий', 'Приз сценаристу или сценарной группе полнометражного игрового, неигрового, анимационного фильма или сериала.'],
  ['IV', 'Лучший дебют', 'Присуждается кинематографисту-дебютанту, чья первая работа в полном метре или сериале признана наиболее успешной.'],
  ['V', 'Лучший короткометражный игровой, неигровой или анимационный фильм', 'Вручается продюсеру короткометражной картины: до 60 минут для игровых, до 52 минут для неигровых.'],
  ['VI', 'За вклад в развитие киноиндустрии Дальнего Востока', 'Специальный приз оргкомитета для профессионалов и организаций, внёсших значимый вклад в развитие кино региона.'],
];

const newsItems = [
  ['Апрель 2026', 'Приём заявок на премию 2026 готовится к старту', 'Подробная информация о способах подачи будет опубликована после утверждения оргкомитетом технических деталей.'],
  ['Сентябрь 2026', 'III церемония пройдёт в Хабаровске', 'Торжественное вручение Дальневосточной кинопремии состоится 25 сентября 2026 года в Городском дворце культуры.'],
  ['2026', 'Экспертный совет формируется', 'Состав Экспертного совета будет опубликован после утверждения оргкомитетом.'],
];

const winners2024 = [
  ['Победитель · Главная номинация', 'Лучший полнометражный игровой, неигровой фильм или сериал', '«Огненный лис»', 'реж. Дмитрий Шпиленок<br>продюсеры: Анна, Дмитрий и Пётр Шпиленок<br>26 месяцев съёмок в Кроноцком заповеднике', 'Камчатский край'],
  ['Победитель', 'Лучший сценарий', '«Чип внутри меня»', 'режиссёр и автор сценария — Юлия Киселева.<br>Действие — Москва и Медицинский центр ДВФУ', 'Москва · Владивосток'],
  ['Победитель', 'Лучший дебют', '«Далёкие близкие»', 'реж. Иван Соснин.<br>История о героях, живущих в Хабаровске', 'Хабаровский край'],
  ['Победитель', 'Лучшая режиссёрская работа', '«Не хороните меня без Ивана»', 'реж. Любовь Борисова.<br>Мистическое путешествие по дореволюционной Якутии', 'Республика Саха (Якутия)'],
  ['Спецприз оргкомитета', 'За вклад в развитие киноиндустрии Дальнего Востока', 'ГНК «Сахафильм»', 'Государственная национальная кинокомпания — флагман якутского кино', 'Республика Саха (Якутия)'],
];

const winners2025 = [
  ['Победитель · Главная номинация', 'Лучший фильм о Дальнем Востоке и Арктике', '«Легенды вечных снегов»', 'реж. Алексей Романов.<br>Национальный киноэпос о судьбе и любви.', 'Республика Саха (Якутия)'],
  ['Победитель', 'Лучший сценарий', '«Золото Умальты»', 'реж. Андрей Богатырёв, сцен. Ольга Погодина-Кузьмина.<br>Истерн по мотивам реальной истории 1916 года', 'Хабаровский край'],
  ['Победитель', 'Лучший дебют', '«Испытание Севером»', 'реж. Дмитрий Панов.<br>Документальный фильм о суровой природе Камчатки', 'Камчатский край'],
  ['Победитель', 'Лучшая режиссёрская работа', '«9 секунд»', 'реж. Олег Штром.<br>Подвиг матроса Алдара Цыденжапова', 'Бурятия · Приморье'],
  ['Победитель · Новая номинация', 'Лучший короткометражный / анимационный фильм', '«Мунха»', 'Якутская рисованная короткометражка о подлёдной рыбалке.<br>Студия «Тооку»', 'Республика Саха (Якутия)'],
  ['Спецприз оргкомитета', 'За масштаб исторического высказывания', '«Челюскин. Первые»', 'реж. Степан Коршунов.<br>Сериал об арктической экспедиции на льдинах', 'Арктика'],
  ['Спецприз оргкомитета', 'За вклад в развитие киноиндустрии Дальнего Востока', 'ВГИК', 'Отмечен за открытие филиалов на Дальнем Востоке и вклад в подготовку новых кадров.', 'Дальний Восток'],
];

const gallery2024 = [
  '3K6A1134_resized.jpg',
  '3K6A1301_resized.jpg',
  '3K6A1358_resized.jpg',
  '3K6A1474_resized.jpg',
  '3K6A1931_resized.jpg',
  '3K6A2040_resized.jpg',
  '3K6A2231_resized.jpg',
  '3K6A2517_resized.jpg',
  '3K6A2829_resized.jpg',
  '3K6A3186_resized.jpg',
  '3K6A3214_resized.jpg',
].map((file) => ({
  src: `/assets/gallery/2024/${file}`,
  caption: 'I Дальневосточная кинопремия · 2024',
}));

const gallery2025 = [
  'LX3A5728_resized.jpg',
  'LX3A5732_resized.jpg',
  'LX3A5740_resized.jpg',
  'LX3A5746_resized.jpg',
  'LX3A5765_resized.jpg',
  'LX3A5778_resized.jpg',
  'LX3A5786_resized.jpg',
  'LX3A5961_resized.jpg',
  'LX3A6180_resized.jpg',
  'LX3A6184_resized.jpg',
  'LX3A6215_resized.jpg',
  'LX3A6248_resized.jpg',
  'LX3A6615_resized.jpg',
  'LX3A6620_resized.jpg',
  'LX3A6647_resized.jpg',
  'LX3A6690_resized.jpg',
].map((file) => ({
  src: `/assets/gallery/2025/${file}`,
  caption: 'II Дальневосточная кинопремия · Улан-Удэ · 2025',
}));

const homeGallery = [
  gallery2025[0],
  gallery2024[0],
  gallery2025[3],
  gallery2024[5],
  gallery2025[8],
  gallery2024[8],
  gallery2025[12],
  gallery2024[10],
];

function nav(active) {
  return `
<nav class="site-nav">
  <a href="/" class="nav-logo" aria-label="Дальневосточная Кинопремия">
    <img class="nav-logo-mark" src="/assets/logo/logo-2-mark.png" alt="" aria-hidden="true">
    <div class="nav-wordmark">
      <span class="top">Дальневосточная</span>
      <span class="bot">КИНОПРЕМИЯ</span>
    </div>
  </a>
  <button class="nav-toggle" type="button" aria-label="Открыть меню" aria-expanded="false" data-nav-toggle>
    <span></span><span></span><span></span>
  </button>
  <ul class="nav-links" data-nav-menu>
    ${pages.map((page) => `<li><a href="${page.href}" class="${page.cta ? 'nav-cta ' : ''}${active === page.id ? 'active' : ''}">${page.label}</a></li>`).join('\n    ')}
  </ul>
</nav>`;
}

function footer() {
  return `
<footer>
  <div class="footer-top">
    <div class="footer-logo">
      <img class="nav-logo-mark" src="/assets/logo/logo-2-mark.png" alt="" aria-hidden="true">
      <div class="nav-wordmark">
        <span class="top">Дальневосточная</span>
        <span class="bot">КИНОПРЕМИЯ</span>
      </div>
    </div>
    <div class="footer-cols">
      <div class="footer-col">
        <h4>Премия</h4>
        <ul>
          <li><a href="/about.html">О премии</a></li>
          <li><a href="/nominations.html">Номинации</a></li>
          <li><a href="/orgcommittee.html">Оргкомитет</a></li>
          <li><a href="/expert-council.html">Экспертный совет</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Участие</h4>
        <ul>
          <li><a href="/submit.html">Подать заявку</a></li>
          <li><a href="/regulation.html">Регламент</a></li>
          <li><a href="/program.html">Деловая программа</a></li>
          <li><a href="/archive.html">Архив победителей</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Контакты</h4>
        <ul>
          <li><a href="/contacts.html">Контакты</a></li>
          <li><a href="/news.html">Новости</a></li>
          <li><a href="/partners.html">Партнёры</a></li>
          <li><a href="/privacy.html">Политика данных</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2026 Дальневосточная кинопремия · ООО «Сердце Русского»</p>
    <span class="tagline">Первый рассвет России</span>
  </div>
</footer>`;
}

function modal() {
  return `
<div class="modal-backdrop" id="leadModal" aria-hidden="true">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="leadTitle">
    <button class="modal-close" type="button" data-lead-close aria-label="Закрыть">×</button>
    <h3 id="leadTitle">Оставить контакт</h3>
    <div class="modal-sub">Мы свяжемся с вами</div>
    <form id="leadForm" novalidate>
      <label for="lead-name">Имя</label>
      <input type="text" id="lead-name" name="name" required minlength="2" maxlength="80" autocomplete="name">

      <label for="lead-phone">Телефон</label>
      <input type="tel" id="lead-phone" name="phone" required minlength="6" maxlength="32" autocomplete="tel" placeholder="+7 ___ ___-__-__">

      <input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">

      <label class="consent">
        <input type="checkbox" name="consent" required>
        <span>Согласен на обработку персональных данных согласно <a href="/privacy.html">политике конфиденциальности</a>.</span>
      </label>

      <button type="submit" class="btn-primary">Отправить →</button>
      <div class="modal-status" id="leadStatus" aria-live="polite"></div>
    </form>
  </div>
</div>`;
}

function photoLightbox() {
  return `
<div class="photo-lightbox" data-lightbox aria-hidden="true">
  <button class="photo-lightbox-close" type="button" data-lightbox-close aria-label="Закрыть">×</button>
  <button class="photo-lightbox-nav prev" type="button" data-lightbox-prev aria-label="Предыдущее фото">←</button>
  <figure>
    <img src="" alt="" data-lightbox-image>
    <figcaption data-lightbox-caption></figcaption>
  </figure>
  <button class="photo-lightbox-nav next" type="button" data-lightbox-next aria-label="Следующее фото">→</button>
</div>`;
}

function layout({ title, active, body }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · Дальневосточная Кинопремия 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
${nav(active)}
${body}
${footer()}
${modal()}
${photoLightbox()}
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
<script src="/anim.js?v=grid-fix-2" defer></script>
<script src="/app.js" defer></script>
</body>
</html>
`;
}

function sectionHead(eyebrow, title, body = '') {
  return `
  <div class="section-headline">
    <div class="section-eyebrow">${eyebrow}</div>
    <h2 class="section-title">${title}</h2>
    ${body ? `<p class="section-body">${body}</p>` : ''}
  </div>`;
}

function newsStrip() {
  return `
<section class="press-strip theme-light" id="news-preview">
  <div class="strip-head">
    <h2>Новости</h2>
    <a href="/news.html">Все новости</a>
  </div>
  <div class="press-rail" data-rail>
    ${newsItems.map(([date, title, text]) => `
    <article class="press-card">
      <div class="press-mark"></div>
      <div class="news-date">${date}</div>
      <h3>${title}</h3>
      <p>${text}</p>
      <a class="card-plus" href="/news.html" aria-label="Открыть новость">+</a>
    </article>`).join('\n    ')}
  </div>
  <div class="rail-controls">
    <button type="button" data-rail-prev aria-label="Назад">←</button>
    <span></span>
    <button type="button" data-rail-next aria-label="Вперёд">→</button>
  </div>
</section>`;
}

function partnerBlock() {
  return `
<section class="partners" id="partners">
  <div class="section-eyebrow">Партнёры и учредители</div>
  <h2 class="section-title">Вместе<br>делаем <span class="hl">кино</span></h2>
  <div class="partner-logos">
    <div class="partner-item"><div class="partner-abbr">МВР</div><div class="partner-name">Министерство развития Дальнего Востока и Арктики</div></div>
    <div class="partner-item"><div class="partner-abbr">КРДВ</div><div class="partner-name">Корпорация развития Дальнего Востока и Арктики</div></div>
    <div class="partner-item"><div class="partner-abbr">ФК</div><div class="partner-name">Фонд кино</div></div>
    <div class="partner-item"><div class="partner-abbr">ФРСИ</div><div class="partner-name">Фонд развития социальных инициатив</div></div>
    <div class="partner-item"><div class="partner-abbr">СР</div><div class="partner-name">ООО «Сердце Русского»</div></div>
  </div>
</section>`;
}

function photoGallery(title, subtitle, images) {
  return `
<section class="photo-section">
  <div class="photo-head">
    <div>
      <div class="section-eyebrow">Фотоархив</div>
      <h2 class="section-title">${title}</h2>
      <p class="section-body">${subtitle}</p>
    </div>
    <div class="photo-controls">
      <button type="button" data-gallery-prev aria-label="Прокрутить фото назад">←</button>
      <button type="button" data-gallery-next aria-label="Прокрутить фото вперёд">→</button>
    </div>
  </div>
  <div class="photo-rail" data-gallery-rail>
    ${images.map((image, index) => `
    <button class="photo-card" type="button" data-lightbox-src="${image.src}" data-lightbox-caption="${image.caption}" aria-label="Открыть фото ${index + 1}">
      <img src="${image.src}" alt="${image.caption}" loading="lazy">
      <span>${image.caption}</span>
    </button>`).join('\n    ')}
  </div>
</section>`;
}

function nominationGrid() {
  return `
  <div class="nom-grid nom-grid-six">
    ${nominations.map(([num, title, text]) => `<div class="nom-card"><div class="nom-card-top"></div><div class="nom-icon">${num}</div><div class="nom-title">${title}</div><p class="nom-desc">${text}</p></div>`).join('\n    ')}
  </div>`;
}

function winnerCards(items) {
  return items.map(([badge, category, title, text, region]) => `
      <article class="film-card winner">
        <div class="film-badge">${badge}</div>
        <div class="film-cat">${category}</div>
        <h3 class="film-title">${title}</h3>
        <div class="film-meta">${text} <span class="film-region">${region}</span></div>
      </article>`).join('\n');
}

const home = layout({
  title: 'Главная',
  active: 'home',
  body: `
<section class="hero home-hero">
  <div class="hero-bg">
    <div class="layer-base"></div>
    <div class="layer-grid"></div>
    <div class="layer-ray"></div>
    <div class="layer-ray2"></div>
    <div class="layer-glow"></div>
  </div>
  <div class="hero-content">
    <div class="hero-eyebrow">
      <div class="h-dot"></div>
      <span>Хабаровск · 25 сентября 2026 · III церемония</span>
    </div>
    <h1 class="hero-title">
      <span class="outline">ДАЛЬНЕ</span><br>
      <span class="outline">ВОСТОЧНАЯ</span><br>
      <span class="accent">КИНО</span>ПРЕМИЯ
    </h1>
    <p class="hero-sub">Профессиональная награда для тех, кто снимает кино на Дальнем Востоке и о Дальнем Востоке.</p>
    <div class="hero-actions">
      <a href="/submit.html" class="btn-primary">Подать заявку →</a>
      <a href="/archive.html" class="btn-ghost">Архив победителей</a>
    </div>
  </div>
  <aside class="hero-aside">
    <div class="hero-aside-tag">Приём заявок · 2026</div>
    <div class="hero-stats">
      <div class="stat-item"><div class="stat-num" data-count="3">3</div><div class="stat-label">сезон<br>премии</div></div>
      <div class="stat-item"><div class="stat-num" data-count="6">6</div><div class="stat-label">основных<br>номинаций</div></div>
      <div class="stat-item"><div class="stat-num" data-count="2026">2026</div><div class="stat-label">Хабаровск<br>церемония</div></div>
    </div>
    <div class="hero-aside-meta"><span>Первый рассвет России</span><strong>ДФО</strong></div>
  </aside>
  <div class="hero-scroll"><div class="scroll-line"></div></div>
</section>
<div class="band">
  <p>III церемония · Хабаровск · Городской дворец культуры</p>
  <a href="/program.html">Деловая программа →</a>
</div>
<section class="about" id="about">
  <div class="about-grid">
    <div class="about-visual">
      <div class="av-glow"></div>
      <div class="av-grid"></div>
      <div class="av-inner">
        <div class="av-num">ДВК</div>
        <div class="av-sub">Дальневосточная кинопремия</div>
      </div>
      <div class="av-tag">Хабаровск · 2026</div>
    </div>
    <div class="about-text">
      <div class="section-eyebrow">О премии</div>
      <h2 class="section-title">Кино,<br>рождённое<br>на <span class="hl">Востоке</span></h2>
      <p class="section-body">Дальневосточная кинопремия появилась в 2024 году по инициативе Министерства Российской Федерации по развитию Дальнего Востока и Арктики и Корпорации развития Дальнего Востока и Арктики. Оператором премии выступает ООО «Сердце Русского», проект реализуется при поддержке Министерства культуры Российской Федерации.</p>
      <div class="about-pillars">
        <div class="pillar"><div class="pillar-num">01</div><div class="pillar-text"><strong>Поддержка</strong> фильмов и авторов, создающих кино на Дальнем Востоке и о регионе</div></div>
        <div class="pillar"><div class="pillar-num">02</div><div class="pillar-text"><strong>История</strong> от камерной московской церемонии до события в Улан-Удэ и Хабаровске</div></div>
        <div class="pillar"><div class="pillar-num">03</div><div class="pillar-text"><strong>Индустрия</strong> диалог продюсеров, режиссёров, сценаристов, операторов и органов власти</div></div>
      </div>
    </div>
  </div>
</section>
<section class="edition-section">
  <div class="edition-line">
    <h2>III сезон</h2>
    <span></span>
    <div>Хабаровск 2026</div>
  </div>
  <div class="shortlist-card">
    <h3>Номинации 2026</h3>
    <a href="/nominations.html">Смотреть все →</a>
  </div>
</section>
${photoGallery('Фото прошлых церемоний', 'Кадры первого и второго сезонов премии: деловая программа, площадки и церемония.', homeGallery)}
${newsStrip()}
<section class="nominations" id="nominations">
  ${sectionHead('Номинации 2026', 'Шесть <span class="hl">категорий</span>', 'На соискание принимаются игровые, неигровые и анимационные фильмы, сериалы и короткометражные работы, связанные с Дальневосточным федеральным округом.')}
  ${nominationGrid()}
</section>
${partnerBlock()}
<div class="submit-section">
  <div class="submit-inner">
    <div class="submit-text">
      <div class="section-eyebrow">Участие</div>
      <h2 class="section-title">Подайте <span class="hl">заявку</span></h2>
      <p class="section-body">Приём заявок откроется в апреле. Полная форма будет добавлена после утверждения технических деталей оргкомитетом.</p>
    </div>
    <div class="submit-cta-wrap">
      <a href="/submit.html" class="btn-big">К странице заявки →</a>
      <button type="button" class="link-button" data-lead-open>Оставить контакт</button>
    </div>
  </div>
</div>`
});

const about = layout({
  title: 'О премии',
  active: 'about',
  body: `
<section class="page-hero">
  ${sectionHead('О премии', 'Премия для кино<br>о <span class="hl">Дальнем Востоке</span>', 'Профессиональная награда за высокие достижения в области кинематографии и вклад в развитие киноиндустрии Дальнего Востока России.')}
</section>
<section class="content-section">
  <div class="text-grid">
    <article class="prose-block">
      <h3>Миссия</h3>
      <p>Премия учреждена для поддержки кинематографистов, чьи работы создаются на Дальнем Востоке России и рассказывают об этом регионе — его природе, истории, культуре и людях.</p>
      <p>Если ваш фильм вырос из дальневосточной земли, природы, характеров и историй — вам сюда.</p>
    </article>
    <article class="prose-block">
      <h3>История</h3>
      <p>За два года проект вырос из московской камерной церемонии в КРДВ до масштабного события на площадках Улан-Удэ и Хабаровска, объединив продюсеров, режиссёров, сценаристов, операторов и представителей органов власти.</p>
      <p>В 2024 году главный приз получил камчатский «Огненный лис». Через год список номинаций расширился: добавился короткий метр, а специальными призами были отмечены проекты и организации, важные для киноиндустрии региона.</p>
    </article>
  </div>
</section>
`
});

const nominationsPage = layout({
  title: 'Номинации',
  active: 'nominations',
  body: `
<section class="page-hero">
  ${sectionHead('Номинации', 'Номинации <span class="hl">2026</span>', 'Победители определяются в шести категориях. Перечень номинаций может уточняться решением оргкомитета.')}
</section>
<section class="nominations page-section">
  ${nominationGrid()}
</section>
`
});

const orgcommittee = layout({
  title: 'Оргкомитет',
  active: 'orgcommittee',
  body: `
<section class="page-hero">
  ${sectionHead('Оргкомитет', 'Организаторы<br><span class="hl">премии</span>', 'Оргкомитет формируется ежегодно из представителей организаций-учредителей.')}
</section>
<section class="content-section">
  <div class="org-list">
    <article><span>01</span><h3>Министерство Российской Федерации по развитию Дальнего Востока и Арктики</h3></article>
    <article><span>02</span><h3>АО «Корпорация развития Дальнего Востока и Арктики»</h3></article>
    <article><span>03</span><h3>Некоммерческая организация «Фонд развития социальных инициатив»</h3></article>
    <article><span>04</span><h3>ООО «Сердце Русского»</h3><p>Оператор премии · Владивосток</p></article>
  </div>
  <div class="text-grid">
    <article class="prose-block">
      <h3>Задачи оргкомитета</h3>
      <p>Оргкомитет определяет место и дату проведения церемонии, утверждает состав экспертного совета, регламент приёма заявок и принимает коллегиальное решение о присуждении специального приза.</p>
    </article>
    <article class="prose-block contact-card">
      <h3>Сотрудничество и аккредитация</h3>
      <p><a href="mailto:ptichka595@mail.ru">ptichka595@mail.ru</a></p>
      <p><a href="tel:+79147092193">+7 914 709-21-93</a></p>
    </article>
  </div>
</section>`
});

const regulation = layout({
  title: 'Регламент',
  active: 'regulation',
  body: `
<section class="page-hero">
  ${sectionHead('Регламент', 'Регламент<br><span class="hl">2026</span>', 'Дальневосточная кинопремия присуждается ежегодно по результатам трёхступенчатого конкурса.')}
</section>
<section class="content-section">
  <div class="steps-grid">
    <article><span>01</span><h3>Технический отбор</h3><p>Формирование лонг-листа на основе корректно оформленных заявок.</p></article>
    <article><span>02</span><h3>Отборочная комиссия</h3><p>Эксперты оценивают фильмы по художественным и техническим критериям и формируют шорт-лист.</p></article>
    <article><span>03</span><h3>Экспертный совет</h3><p>Из шорт-листа выбираются победители в каждой номинации.</p></article>
  </div>
  <div class="text-grid">
    <article class="prose-block">
      <h3>К рассмотрению принимаются</h3>
      <p>Фильмы, частично или полностью созданные на территории субъектов ДФО и посвящённые региону. Проекты должны быть обнародованы не ранее 1 января 2025 года, если иное не будет уточнено решением оргкомитета.</p>
    </article>
    <article class="prose-block">
      <h3>Критерии оценки</h3>
      <p>Художественный уровень, новизна концепции, техническое исполнение, экономическая эффективность, фестивальные призы, отражение образа Дальнего Востока и продвижение актуальных для региона тем.</p>
    </article>
  </div>
</section>
`
});

const submit = layout({
  title: 'Подать заявку',
  active: 'submit',
  body: `
<section class="page-hero">
  ${sectionHead('Подать заявку', 'Участие<br>в конкурсе <span class="hl">2026</span>', 'Приём заявок откроется в апреле. Точные технические детали появятся после утверждения оргкомитетом.')}
</section>
<section class="content-section">
  <div class="submit-options">
    <article class="submit-option"><div class="nom-icon">I</div><h3>MovieStart</h3><p>Подача через платформу-агрегатор будет подключена после утверждения ссылки.</p><button type="button" data-lead-open>Уведомить о старте</button></article>
    <article class="submit-option"><div class="nom-icon">II</div><h3>Наши Фестивали</h3><p>Альтернативный агрегатор фестивалей. Интеграция будет добавлена отдельным этапом.</p><button type="button" data-lead-open>Оставить контакт</button></article>
    <article class="submit-option"><div class="nom-icon">III</div><h3>Форма на сайте</h3><p>Полноценная форма заявки с отправкой в Telegram будет реализована позже. Сейчас доступна контактная форма.</p><button type="button" data-lead-open>Связаться</button></article>
  </div>
  <div class="prose-block wide">
    <h3>Что подготовить заранее</h3>
    <p>Для подачи работы потребуется указать данные о фильме, правообладателе, приложить ссылки на материалы и документы. Все фильмы, поступившие после официального старта и до установленного дедлайна, проходят одинаковую процедуру рассмотрения.</p>
    <p>Вопросы по оформлению заявки можно направлять на <a href="mailto:ptichka595@mail.ru">ptichka595@mail.ru</a>.</p>
  </div>
</section>`
});

const archive = layout({
  title: 'Архив победителей',
  active: 'archive',
  body: `
<section class="archive" id="archive">
  <div class="archive-head">
    <div class="section-eyebrow">Архив сезонов · 2024–2025</div>
    <h2 class="section-title">Номинанты<br>и <span class="hl">победители</span></h2>
    <p class="section-body">Хроника двух сезонов Дальневосточной кинопремии. Лауреаты выбраны экспертным советом, а специальные призы присуждены решением оргкомитета.</p>
  </div>
  <div class="archive-year">
    <div class="archive-year-head">
      <div class="archive-year-num">2024</div>
      <div class="archive-year-meta">I премия · 23 декабря 2024<br>Москва · Площадка <b>КРДВ</b></div>
    </div>
    <div class="archive-grid">${winnerCards(winners2024)}</div>
  </div>
  <div class="archive-year">
    <div class="archive-year-head">
      <div class="archive-year-num">2025</div>
      <div class="archive-year-meta">II премия · 6 октября 2025<br>Улан-Удэ · Русский драматический театр им. Н. А. Бестужева<br>Шорт-лист — <b>21 картина</b> из 8 регионов ДФО</div>
    </div>
    <div class="archive-grid">${winnerCards(winners2025)}</div>
  </div>
</section>
${photoGallery('I премия · 2024', 'Москва · площадка КРДВ. Фото деловой программы и церемонии первого сезона.', gallery2024)}
${photoGallery('II премия · 2025', 'Улан-Удэ. Фото площадки, гостей, деловой программы и церемонии второго сезона.', gallery2025)}`
});

const program = layout({
  title: 'Деловая программа',
  active: 'program',
  body: `
<section class="page-hero">
  ${sectionHead('Деловая программа', 'Хабаровск · <span class="hl">2026</span>', '25 сентября 2026 года в Хабаровске, в Городском дворце культуры, состоится третья торжественная церемония вручения Дальневосточной кинопремии.')}
</section>
<section class="programme">
  <div class="prog-grid">
    <div class="prog-day">
      <div class="prog-day-label">Форматы</div>
      <div>
        <div class="prog-event"><span class="prog-time">01</span><div><div class="prog-name">Мастер-классы</div><div class="prog-detail">Практические встречи с профессионалами киноиндустрии</div></div></div>
        <div class="prog-event"><span class="prog-time">02</span><div><div class="prog-name">Круглые столы</div><div class="prog-detail">Обсуждение развития регионального кинопроизводства</div></div></div>
        <div class="prog-event"><span class="prog-time">03</span><div><div class="prog-name">Питчинги проектов</div><div class="prog-detail">Презентация новых дальневосточных историй</div></div></div>
      </div>
    </div>
    <div class="prog-day">
      <div class="prog-day-label">Церемония</div>
      <div>
        <div class="prog-event"><span class="prog-time">25.09</span><div><div class="prog-name">Городской дворец культуры</div><div class="prog-detail">Хабаровск · III Дальневосточная кинопремия</div></div></div>
        <div class="prog-event highlight"><span class="prog-time">2026</span><div><div class="prog-name">Точная программа будет опубликована ближе к сентябрю</div><div class="prog-detail">После утверждения оргкомитетом</div></div></div>
      </div>
    </div>
  </div>
</section>`
});

const expertCouncil = layout({
  title: 'Экспертный совет',
  active: 'expert-council',
  body: `
<section class="page-hero">
  ${sectionHead('Экспертный совет', 'Состав<br><span class="hl">формируется</span>', 'Состав Экспертного совета 2026 года находится на стадии формирования и будет опубликован после утверждения оргкомитетом.')}
</section>
<section class="content-section">
  <div class="prose-block wide">
    <h3>О совете</h3>
    <p>В предыдущие годы в совет входили ведущие режиссёры, продюсеры, киноведы и представители институтов развития Дальнего Востока. Совет определяет победителей по заявленным номинациям на основе шорт-листа.</p>
  </div>
</section>`
});

const partners = layout({
  title: 'Партнёры',
  active: 'partners',
  body: `${partnerBlock()}`
});

const contacts = layout({
  title: 'Контакты',
  active: 'contacts',
  body: `
<section class="page-hero">
  ${sectionHead('Контакты', 'Оператор<br><span class="hl">премии</span>', 'ООО «Сердце Русского» · Владивосток')}
</section>
<section class="content-section">
  <div class="contact-grid">
    <article class="contact-tile"><span>Адрес</span><p>690012, Приморский край, г. Владивосток, ул. Харьковская, д. 8, пом. 2</p></article>
    <article class="contact-tile"><span>Телефон</span><p><a href="tel:+79147092193">+7 914 709-21-93</a></p></article>
    <article class="contact-tile"><span>E-mail</span><p><a href="mailto:ptichka595@mail.ru">ptichka595@mail.ru</a></p></article>
  </div>
  <div class="prose-block wide">
    <p>По вопросам партнёрства, аккредитации СМИ, включения в деловую программу и приглашения спикеров просьба писать на указанный адрес с темой «ДВ Кинопремия — сотрудничество».</p>
  </div>
</section>`
});

const news = layout({
  title: 'Новости',
  active: 'news',
  body: `
<section class="page-hero">
  ${sectionHead('Новости', 'Новости<br>и <span class="hl">анонсы</span>', 'Лента публикаций о старте приёма заявок, экспертном совете, деловой программе и итогах церемонии.')}
</section>
${newsStrip()}`
});

const privacy = layout({
  title: 'Политика конфиденциальности',
  active: 'privacy',
  body: `
<section class="page-hero">
  ${sectionHead('Политика конфиденциальности', 'Обработка<br><span class="hl">персональных данных</span>', 'Актуальная редакция документа для сайта Дальневосточной кинопремии.')}
</section>
<section class="content-section">
  <div class="prose-block wide policy-document">
    ${privacyPolicyHtml}
  </div>
</section>`
});

const extraCss = `

/* Multi-page structure */
.site-nav .nav-links a.active{color:var(--amber2)}
.site-nav{gap:22px;padding:0 34px}
.nav-logo{min-width:260px}
.nav-logo-mark{display:block;width:54px;height:54px;object-fit:contain;flex:0 0 auto;filter:drop-shadow(0 0 14px rgba(255,149,0,.18))}
.footer-logo .nav-logo-mark{width:92px;height:92px}
.site-nav .nav-links{gap:14px;justify-content:flex-end}
.site-nav .nav-links a{white-space:nowrap}
.nav-toggle{display:none;background:none;border:1px solid rgba(255,149,0,0.28);width:42px;height:36px;align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer}
.nav-toggle span{width:18px;height:1px;background:var(--amber2);display:block}
.page-hero{position:relative;overflow:hidden;min-height:54vh;padding-top:150px;background:var(--deep);border-bottom:1px solid rgba(255,149,0,0.12)}
.page-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 15% 30%,rgba(255,149,0,0.12),transparent 62%),radial-gradient(ellipse 60% 70% at 90% 70%,rgba(232,52,26,0.08),transparent 58%);pointer-events:none}
.page-hero > *{position:relative;z-index:1}
.section-headline{max-width:880px}
.content-section,.page-section{background:var(--dark);border-top:1px solid rgba(255,149,0,0.12)}
.text-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:24px}
.prose-block{background:var(--card);border:1px solid rgba(255,149,0,0.12);padding:34px 32px}
.prose-block.wide{max-width:940px}
.prose-block h3,.contact-tile span,.submit-option h3{font-family:'Space Mono',monospace;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;color:var(--amber2);margin-bottom:16px}
.prose-block p,.contact-tile p,.submit-option p{font-size:21px;line-height:1.65;color:rgba(255,255,255,0.78)}
.prose-block a,.contact-tile a{color:var(--amber2);text-decoration:none;border-bottom:1px solid rgba(255,208,0,0.35)}
.edition-section{background:linear-gradient(135deg,#1a0800 0%,#0f0510 40%,#00081a 100%);padding:90px 80px 120px;border-top:1px solid rgba(255,149,0,0.16)}
.edition-line{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:26px;margin-bottom:64px}
.edition-line h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(56px,10vw,120px);line-height:.9;color:var(--white);letter-spacing:.02em}
.edition-line span{height:1px;background:rgba(255,149,0,0.45)}
.edition-line div{font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.24em;color:var(--amber2);text-transform:uppercase}
.shortlist-card{position:relative;width:min(520px,100%);min-height:220px;border:1px solid rgba(255,149,0,0.55);padding:72px 36px;background:rgba(255,149,0,0.04);box-shadow:18px -14px 0 rgba(255,149,0,0.08)}
.shortlist-card h3{font-family:'Cormorant Garamond',serif;font-size:30px;color:var(--white);margin-bottom:18px}
.shortlist-card a{font-family:'Space Mono',monospace;color:var(--amber2);text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.18em}
.strip-head h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(38px,5vw,62px);color:var(--white);letter-spacing:.02em;margin-bottom:24px}
.theme-light{background:var(--dark);color:var(--text);border-top:1px solid rgba(255,149,0,0.12)}
.press-strip{padding:86px 80px;overflow:hidden}
.strip-head{display:flex;align-items:baseline;gap:18px;margin-bottom:42px}
.strip-head h2{color:var(--white);margin-bottom:0}
.strip-head a{font-family:'Space Mono',monospace;color:var(--amber2);text-decoration:none;font-size:13px;border-bottom:1px solid rgba(255,208,0,.35)}
.press-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(310px,31vw);gap:34px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:22px}
.press-rail::-webkit-scrollbar{height:4px}
.press-rail::-webkit-scrollbar-thumb{background:var(--amber)}
.press-card{position:relative;scroll-snap-align:start;min-height:260px;color:var(--text);border-top:3px solid rgba(255,149,0,.65);padding-top:34px;background:linear-gradient(180deg,rgba(255,149,0,.04),rgba(19,19,28,.12));padding-left:18px;padding-right:18px}
.press-card h3{font-family:'Cormorant Garamond',serif;font-size:27px;line-height:1.25;margin:10px 54px 10px 0;color:var(--white)}
.press-card p{font-size:18px;line-height:1.5;color:rgba(255,255,255,.72)}
.press-card .news-date{color:var(--amber)}
.press-mark{position:absolute;top:0;left:18px;width:3px;height:28px;background:var(--amber2)}
.card-plus{position:absolute;right:18px;top:42px;width:38px;height:38px;background:linear-gradient(135deg,var(--amber2),var(--amber));color:var(--deep);text-decoration:none;display:flex;align-items:center;justify-content:center;font-size:26px;font-family:Arial,sans-serif}
.rail-controls{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:24px;margin-top:8px}
.rail-controls span{height:2px;background:linear-gradient(90deg,var(--amber) 0 18%,rgba(255,149,0,.16) 18%)}
.rail-controls button{border:none;width:40px;height:40px;background:rgba(255,149,0,.1);cursor:pointer;font-size:20px;color:var(--amber2)}
.photo-section{background:var(--deep);padding:86px 80px;border-top:1px solid rgba(255,149,0,.14);overflow:hidden}
.photo-head{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:42px}
.photo-head .section-body{max-width:760px}
.photo-controls{display:flex;gap:10px;flex:0 0 auto}
.photo-controls button{width:44px;height:44px;border:1px solid rgba(255,149,0,.28);background:rgba(255,149,0,.08);color:var(--amber2);font-size:22px;cursor:pointer}
.photo-controls button:hover{background:rgba(255,149,0,.18)}
.photo-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(310px,31vw);gap:22px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 0 24px}
.photo-rail::-webkit-scrollbar{height:4px}
.photo-rail::-webkit-scrollbar-thumb{background:var(--amber)}
.photo-card{position:relative;display:block;scroll-snap-align:start;border:1px solid rgba(255,149,0,.18);background:var(--card);padding:0;cursor:pointer;text-align:left;overflow:hidden}
.photo-card::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.72));z-index:1;pointer-events:none}
.photo-card img{display:block;width:100%;height:clamp(230px,25vw,390px);object-fit:cover;filter:saturate(.96) contrast(1.04);transition:transform .35s ease,filter .35s ease}
.photo-card:hover img{transform:scale(1.035);filter:saturate(1.08) contrast(1.08)}
.photo-card span{position:absolute;left:18px;right:18px;bottom:16px;z-index:2;font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.12em;line-height:1.45;text-transform:uppercase;color:rgba(255,255,255,.86)}
.photo-lightbox{position:fixed;inset:0;z-index:2000;background:rgba(3,3,6,.94);display:none;align-items:center;justify-content:center;padding:72px 86px}
.photo-lightbox.open{display:flex}
.photo-lightbox figure{margin:0;max-width:100%;max-height:100%;display:flex;flex-direction:column;align-items:center;gap:18px}
.photo-lightbox img{max-width:86vw;max-height:78vh;object-fit:contain;border:1px solid rgba(255,149,0,.28);box-shadow:0 20px 80px rgba(0,0,0,.6)}
.photo-lightbox figcaption{font-family:'Space Mono',monospace;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--amber2);text-align:center}
.photo-lightbox-close,.photo-lightbox-nav{position:absolute;border:1px solid rgba(255,149,0,.28);background:rgba(10,10,15,.78);color:var(--amber2);cursor:pointer}
.photo-lightbox-close{top:24px;right:28px;width:46px;height:46px;font-size:32px;line-height:1}
.photo-lightbox-nav{top:50%;transform:translateY(-50%);width:52px;height:72px;font-size:28px}
.photo-lightbox-nav.prev{left:24px}
.photo-lightbox-nav.next{right:24px}
.nom-grid.nom-grid-six{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;background:transparent;align-items:stretch;align-content:start;grid-auto-rows:minmax(390px,auto)}
.nom-grid-six .nom-card{min-height:390px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;border:1px solid rgba(255,149,0,.16);background:linear-gradient(180deg,rgba(255,149,0,.05) 0%,var(--card) 62%);padding:38px 32px;transform:none!important}
.nom-grid-six .nom-card-top{height:3px;transform:scaleX(1);opacity:.85}
.nom-grid-six .nom-icon{font-size:66px;min-height:70px;margin-bottom:22px}
.nom-grid-six .nom-title{min-height:52px;margin-bottom:18px}
.nom-grid-six .nom-desc{margin:0;line-height:1.5}
.nom-grid-six .nom-card:hover{transform:none;background:linear-gradient(180deg,rgba(255,149,0,.07) 0%,var(--card) 62%)}
.archive-grid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;grid-auto-rows:1fr}
.archive-grid .film-card{min-height:292px;height:100%;padding:30px 30px 28px;gap:16px;transform:none!important}
.archive-grid .film-cat{min-height:46px}
.archive-grid .film-title{min-height:76px}
.archive-grid .film-card:last-child:nth-child(odd){grid-column:1 / -1;justify-self:center;width:calc(50% - 10px)}
.archive-grid .film-card:hover{transform:none}
.archive-grid .film-region{display:block;margin-top:12px}
.org-list{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:rgba(255,149,0,0.1);margin-bottom:42px}
.org-list article,.steps-grid article,.submit-option,.contact-tile{background:var(--card);padding:30px 26px;border:1px solid rgba(255,255,255,0.04)}
.org-list span,.steps-grid span{font-family:'Bebas Neue',sans-serif;font-size:42px;color:var(--amber);opacity:.75}
.org-list h3,.steps-grid h3{font-family:'Cormorant Garamond',serif;font-size:23px;line-height:1.28;color:var(--white);margin-top:16px}
.org-list p,.steps-grid p{font-size:18px;line-height:1.55;color:rgba(255,255,255,.68);margin-top:10px}
.steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:42px}
.submit-options{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:42px}
.submit-option button,.link-button{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--deep);background:linear-gradient(135deg,#FFD000 0%,#FF9500 100%);border:none;padding:14px 18px;cursor:pointer;margin-top:22px}
.link-button{background:none;color:var(--amber2);border-bottom:1px solid rgba(255,208,0,.4);padding:0 0 6px;margin:0}
.contact-grid{display:grid;grid-template-columns:2fr 1fr 1.2fr;gap:18px;margin-bottom:32px}
body.nav-open{overflow:hidden}

/* Readability pass (small fonts +30%) */
body{font-size:21px}
.nav-links a{font-size:14px;letter-spacing:0.1em}
.nav-wordmark .top{font-size:14px;letter-spacing:0.28em}
.nav-wordmark .bot{font-size:30px}
.nav-cta{font-size:14px;letter-spacing:0.1em;padding:13px 18px}
.hero-eyebrow span,.hero-aside-tag,.section-eyebrow{font-size:17px;letter-spacing:0.22em}
.hero-sub{font-size:clamp(24px,2.2vw,32px);line-height:1.45;color:rgba(255,255,255,0.74)}
.section-body{font-size:29px;line-height:1.7;color:rgba(255,255,255,0.82)}
.btn-primary,.btn-ghost,.btn-big{font-size:16px;letter-spacing:0.18em}
.stat-label,.hero-aside-meta,.band p,.band a,.submit-fineprint,.deadline-badge,.news-date,.news-arrow,.film-cat,.film-region,.prog-detail,.partner-name,.modal label,.modal-status{font-size:16px;letter-spacing:0.16em}
.pillar-text,.nom-desc,.prog-name,.film-meta,.news-excerpt,.footer-col ul li a{font-size:25px;line-height:1.6}
.nom-title{font-size:17px;letter-spacing:0.16em;line-height:1.45}
.news-headline{font-size:33px}
.news-card.featured .news-headline{font-size:42px}
.archive-foot{font-size:17px;letter-spacing:0.12em}
.modal input[type=text],.modal input[type=tel]{font-size:24px}
.modal .consent{font-size:19px;line-height:1.55}
.footer-bottom p{font-size:16px;letter-spacing:0.1em}
.footer-bottom .tagline{font-size:24px}
.press-card h3{font-size:38px;line-height:1.22}
.press-card p{font-size:27px;line-height:1.5}
.press-card .news-date{font-size:18px;letter-spacing:0.18em}
.prose-block p,.contact-tile p,.submit-option p{font-size:25px}
.hero-title .outline{-webkit-text-stroke:2px rgba(255,255,255,0.34);text-shadow:0 0 22px rgba(255,149,0,0.18)}
.policy-document{max-width:1120px}
.policy-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(46px,6vw,82px);line-height:.95;color:var(--white);letter-spacing:.02em;margin:0 0 30px}
.policy-section{font-family:'Space Mono',monospace;font-size:19px;line-height:1.5;letter-spacing:.16em;text-transform:uppercase;color:var(--amber2);margin:34px 0 14px}
.policy-paragraph{font-size:25px;line-height:1.7;color:rgba(255,255,255,.8);margin:0 0 14px}
.policy-space{height:14px}
.policy-table-wrap{overflow-x:auto;margin:22px 0 30px;border:1px solid rgba(255,149,0,.18)}
.policy-table{width:100%;border-collapse:collapse;min-width:720px}
.policy-table td{vertical-align:top;border:1px solid rgba(255,149,0,.16);padding:18px 20px;font-size:22px;line-height:1.55;color:rgba(255,255,255,.82)}
.policy-table td:first-child{width:28%;font-family:'Space Mono',monospace;font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:var(--amber2);background:rgba(255,149,0,.06)}
@media(max-width:1440px){
  .nav-toggle{display:flex}
  .site-nav .nav-links{position:fixed;top:68px;left:0;right:0;display:none;flex-direction:column;align-items:stretch;gap:0;background:rgba(10,10,15,.98);border-bottom:1px solid rgba(255,149,0,.22);padding:16px 24px 24px}
  .site-nav .nav-links.open{display:flex}
  .site-nav .nav-links a{display:block;padding:14px 0;font-size:14px;letter-spacing:.14em}
}
@media(max-width:1100px){
  .nom-grid.nom-grid-six{grid-template-columns:1fr 1fr}
  .nom-grid.nom-grid-six{grid-auto-rows:auto}
  .nom-grid-six .nom-card{height:auto;min-height:330px}
  .nom-grid-six,.org-list,.steps-grid,.submit-options,.contact-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:900px){
  .nav-toggle{display:flex}
  .site-nav .nav-links{position:fixed;top:68px;left:0;right:0;display:none;flex-direction:column;align-items:stretch;gap:0;background:rgba(10,10,15,.98);border-bottom:1px solid rgba(255,149,0,.22);padding:16px 24px 24px}
  .site-nav .nav-links.open{display:flex}
  .site-nav .nav-links a{display:block;padding:14px 0}
  .page-hero{padding-top:120px;min-height:auto}
  .edition-section,.press-strip,.photo-section{padding:62px 24px}
  .photo-head{flex-direction:column;align-items:flex-start}
  .nom-grid.nom-grid-six{grid-template-columns:1fr}
  .nom-grid-six .nom-card{min-height:auto}
  .text-grid,.nom-grid-six,.org-list,.steps-grid,.submit-options,.contact-grid{grid-template-columns:1fr}
  .archive-grid{grid-template-columns:1fr}
  .archive-grid .film-card:last-child:nth-child(odd){grid-column:auto;justify-self:stretch;width:100%}
  .press-rail{grid-auto-columns:minmax(280px,82vw)}
  .photo-rail{grid-auto-columns:minmax(280px,82vw)}
  .photo-lightbox{padding:66px 18px}
  .photo-lightbox img{max-width:94vw;max-height:72vh}
  .photo-lightbox-nav{top:auto;bottom:18px;transform:none;height:46px}
  .edition-line{grid-template-columns:1fr;gap:18px}
  .edition-line span{width:100%}
}
@media(max-width:560px){
  .site-nav{padding:0 18px}
  .nav-logo{min-width:0;gap:8px}
  .nav-logo-mark{width:40px;height:40px}
  .nav-wordmark .top{font-size:11px;letter-spacing:.18em}
  .nav-wordmark .bot{font-size:24px;letter-spacing:.06em}
  .nav-toggle{width:38px;height:34px}
  .prose-block{padding:28px 22px}
  .photo-card img{height:260px}
  .section-body{font-size:23px}
  .hero-sub{font-size:22px}
  .pillar-text,.nom-desc,.prog-name,.film-meta,.news-excerpt,.footer-col ul li a{font-size:22px}
  .prose-block p,.contact-tile p,.submit-option p{font-size:23px}
  .policy-paragraph{font-size:21px}
  .policy-section{font-size:15px}
  .news-headline{font-size:27px}
  .news-card.featured .news-headline{font-size:32px}
  .nav-links a{font-size:16px}
  .stat-label,.hero-aside-meta,.band p,.band a,.submit-fineprint,.deadline-badge,.news-date,.news-arrow,.film-cat,.film-region,.prog-detail,.partner-name,.modal label,.modal-status{font-size:14px;letter-spacing:0.14em}
}
`;

const appJs = `// Общая логика сайта: мобильное меню, модалка контакта, отправка /api/lead, простые горизонтальные ленты.
(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
})();

(function () {
  const modal = document.getElementById('leadModal');
  const form = document.getElementById('leadForm');
  const status = document.getElementById('leadStatus');
  const nameI = document.getElementById('lead-name');
  const phoneI = document.getElementById('lead-phone');
  if (!modal || !form || !status || !nameI || !phoneI) return;

  let lastFocus = null;
  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => nameI.focus(), 50);
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  document.querySelectorAll('[data-lead-open]').forEach(el => el.addEventListener('click', open));
  document.querySelectorAll('[data-lead-close]').forEach(el => el.addEventListener('click', close));
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  phoneI.addEventListener('input', () => {
    let v = phoneI.value.replace(/[^\\d+]/g, '');
    if (v.length > 16) v = v.slice(0, 16);
    phoneI.value = v;
  });

  function setStatus(msg, kind) {
    status.textContent = msg || '';
    status.className = 'modal-status' + (kind ? ' ' + kind : '');
  }

  let submitting = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    setStatus('');

    const name = nameI.value.trim();
    const phone = phoneI.value.trim();
    const consent = form.elements.consent.checked;
    const hp = form.elements.company.value;

    if (name.length < 2) return setStatus('Укажите имя', 'err');
    if (phone.replace(/\\D/g, '').length < 6) return setStatus('Укажите телефон', 'err');
    if (!consent) return setStatus('Нужно согласие на обработку данных', 'err');

    submitting = true;
    setStatus('Отправляем...', '');

    const payload = JSON.stringify({ name, phone, company: hp, page: location.pathname });
    const endpoints = ['/mail.php', '/api/lead'];

    let data = null;
    let lastErr = null;
    try {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          });
          if (res.status === 404 || res.status === 405) continue;
          data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) throw new Error(data.error || 'Ошибка отправки');
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
        }
      }
      if (!data || !data.ok) throw lastErr || new Error('Ошибка отправки');

      setStatus('Контакт отправлен. Мы свяжемся с вами.', 'ok');
      form.reset();
      setTimeout(close, 1800);
    } catch (err) {
      setStatus(err.message || 'Не удалось отправить', 'err');
    } finally {
      submitting = false;
    }
  });
})();

(function () {
  document.querySelectorAll('.press-strip').forEach((section) => {
    const rail = section.querySelector('[data-rail]');
    const prev = section.querySelector('[data-rail-prev]');
    const next = section.querySelector('[data-rail-next]');
    if (!rail || !prev || !next) return;
    const step = () => Math.max(280, Math.round(rail.clientWidth * 0.75));
    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  });
})();

(function () {
  document.querySelectorAll('.photo-section').forEach((section) => {
    const rail = section.querySelector('[data-gallery-rail]');
    const prev = section.querySelector('[data-gallery-prev]');
    const next = section.querySelector('[data-gallery-next]');
    if (!rail || !prev || !next) return;
    const step = () => Math.max(300, Math.round(rail.clientWidth * 0.8));
    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  });

  const triggers = Array.from(document.querySelectorAll('[data-lightbox-src]'));
  const lightbox = document.querySelector('[data-lightbox]');
  const image = document.querySelector('[data-lightbox-image]');
  const caption = document.querySelector('[data-lightbox-caption]');
  const closeBtn = document.querySelector('[data-lightbox-close]');
  const prevBtn = document.querySelector('[data-lightbox-prev]');
  const nextBtn = document.querySelector('[data-lightbox-next]');
  if (!triggers.length || !lightbox || !image || !caption) return;

  let current = 0;
  function show(index) {
    current = (index + triggers.length) % triggers.length;
    const trigger = triggers[current];
    image.src = trigger.dataset.lightboxSrc;
    image.alt = trigger.dataset.lightboxCaption || 'Фото Дальневосточной кинопремии';
    caption.textContent = trigger.dataset.lightboxCaption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    image.removeAttribute('src');
  }

  triggers.forEach((trigger, index) => trigger.addEventListener('click', () => show(index)));
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
})();

(function () {
  const targets = document.querySelectorAll('.section-title .hl');
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('lit'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('lit');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6, rootMargin: '0px 0px -10% 0px' });
  targets.forEach((el) => io.observe(el));
})();
`;

await writeFile(join(siteDir, 'styles.css'), `${baseCss}\n${extraCss}\n`, 'utf8');
await writeFile(join(siteDir, 'app.js'), appJs, 'utf8');

const files = new Map([
  ['index.html', home],
  ['about.html', about],
  ['nominations.html', nominationsPage],
  ['orgcommittee.html', orgcommittee],
  ['regulation.html', regulation],
  ['submit.html', submit],
  ['archive.html', archive],
  ['program.html', program],
  ['expert-council.html', expertCouncil],
  ['partners.html', partners],
  ['contacts.html', contacts],
  ['news.html', news],
  ['privacy.html', privacy],
]);

await Promise.all([...files].map(([file, html]) => writeFile(join(siteDir, file), html, 'utf8')));
console.log(`Generated ${files.size} HTML pages, styles.css and app.js`);
