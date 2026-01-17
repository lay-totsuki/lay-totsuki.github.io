// gallery.js
// 対象ページ：gallery-original.html / gallery-fanart.html / gallery-mini.html
// 仕様：ページ内の a.card を一覧化し、モーダル表示＋矢印・スワイプで移動

(() => {
  const modal = document.getElementById('modal');
  const modalFrame = document.getElementById('modalFrame');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');

  // ページによってはカードが0枚のことがある（準備中など）
  const cards = Array.from(document.querySelectorAll('a.card'));
  const items = cards.map(a => ({
    href: a.getAttribute('href'),
    caption: a.getAttribute('data-caption') || ''
  }));

  let currentIndex = -1;

  function isOpen() {
    return modal && modal.classList.contains('is-open');
  }

  function updateNavButtons() {
    if (!navPrev || !navNext) return;
    const hasMany = items.length > 1;
    navPrev.disabled = !hasMany;
    navNext.disabled = !hasMany;
    navPrev.classList.toggle('is-disabled', !hasMany);
    navNext.classList.toggle('is-disabled', !hasMany);
  }

  function openByIndex(index) {
    if (!modal || !modalImg || !modalCaption) return;
    if (!items.length) return;

    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];

    modalImg.src = item.href;
    modalImg.alt = item.caption || '';
    modalCaption.textContent = item.caption || '';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateNavButtons();
  }

  function closeModal() {
    if (!modal || !modalImg || !modalCaption) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    modalImg.src = '';
    modalImg.alt = '';
    modalCaption.textContent = '';

    document.body.style.overflow = '';
    currentIndex = -1;
  }

  function next() {
    if (items.length <= 1) return;
    openByIndex(currentIndex + 1);
  }

  function prev() {
    if (items.length <= 1) return;
    openByIndex(currentIndex - 1);
  }

  // ===== Click (open modal) =====
  document.addEventListener('click', (e) => {
    const card = e.target.closest('a.card');
    if (!card) return;

    e.preventDefault();

    const href = card.getAttribute('href');
    const idx = items.findIndex(x => x.href === href);
    openByIndex(idx >= 0 ? idx : 0);
  });

  // ===== Close controls =====
  if (modalClose) {
    modalClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', () => closeModal());
  }

  if (modalFrame) {
    modalFrame.addEventListener('click', (e) => e.stopPropagation());
  }

  // ===== Nav buttons =====
  if (navPrev) navPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  if (navNext) navNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // ===== Keyboard =====
  window.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // ===== Swipe (Mobile) =====
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;

  function isMostlyHorizontalSwipe(dx, dy) {
    return Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2;
  }

  if (modalFrame) {
    modalFrame.addEventListener('touchstart', (e) => {
      if (!isOpen()) return;
      if (e.touches.length !== 1) return;

      touchActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    modalFrame.addEventListener('touchend', (e) => {
      if (!touchActive) return;
      touchActive = false;

      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      if (!isMostlyHorizontalSwipe(dx, dy)) return;

      if (dx < 0) next();
      else prev();
    }, { passive: true });
  }

  updateNavButtons();
})();
