// Лёгкая модалка "Оставить заявку" + отправка на /api/lead
(function () {
  const modal = document.getElementById('leadModal');
  const form = document.getElementById('leadForm');
  const status = document.getElementById('leadStatus');
  const nameI = document.getElementById('lead-name');
  const phoneI = document.getElementById('lead-phone');

  function open(e) {
    if (e) e.preventDefault();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => nameI.focus(), 50);
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-lead-open]').forEach(el => el.addEventListener('click', open));
  document.querySelectorAll('[data-lead-close]').forEach(el => el.addEventListener('click', close));
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  // Простейшее автоформатирование телефона
  phoneI.addEventListener('input', () => {
    let v = phoneI.value.replace(/[^\d+]/g, '');
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
    if (phone.replace(/\D/g, '').length < 6) return setStatus('Укажите телефон', 'err');
    if (!consent) return setStatus('Нужно согласие на обработку данных', 'err');

    submitting = true;
    setStatus('Отправляем...', '');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, company: hp, page: location.pathname })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Ошибка отправки');

      setStatus('Заявка отправлена. Мы свяжемся с вами.', 'ok');
      form.reset();
      setTimeout(close, 1800);
    } catch (err) {
      setStatus(err.message || 'Не удалось отправить', 'err');
    } finally {
      submitting = false;
    }
  });
})();

// Подсветка ключевых слов в section-title при появлении в viewport
(function () {
  const targets = document.querySelectorAll('.section-title .hl');
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('lit'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lit');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6, rootMargin: '0px 0px -10% 0px' }
  );
  targets.forEach((el) => io.observe(el));
})();
