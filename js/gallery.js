// gallery.js (infinite scroll-like + modal)
// 対象: gallery-original.html / gallery-fanart.html / gallery-mini.html
(() => {
  // ===== Settings =====
  const BATCH = 12; // 1回で追加表示する枚数

  // ===== Elements =====
  const modal = document.getElementById('modal');
  const modalFrame = document.getElementById('modalFrame');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');

  const trigger = document.getElementById('infiniteTrigger');
  const loadMoreBtn = document.getElementById('loadMore');

  // grid内カード全件（DOMには全部置いておく方式）
  const allCards = Array.from(document.querySelectorAll('a.card'));
  const total = allCards.length;

  // ===== State =====
  let shown = 0; // 現在表示している枚数
  let currentIndex = -1;

  function isOpen() {
    return modal && modal.classList.contains('is-open');
  }

  function hideAllCards() {
    allCards.forEach(card => { card.hidden = true; });
  }

  function showNextBatch() {
    const next = Math.min(total, shown + BATCH);
    for (let i = shown; i < next; i++) {
      allCards[i].hidden = false;
    }
    shown = next;

    // もう全部出たらボタン消す
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (shown >= total) ? 'none' : 'inline-flex';
      loadMoreBtn.disabled = shown >= total;
    }
  }

  function getVisibleCards() {
    // 「表示済み」のカードだけを対象にモーダル移動させる
    return allCards.slice(0, shown);
  }

  function getVisibleItems() {
    return getVisibleCards().map(a => ({
      href: a.getAttribute('href'),
      caption: a.getAttribute('data-caption') || ''
    }));
  }

  function updateModalNavButtons(items) {
    if (!navPrev || !navNext) return;
    const hasMany = items.length > 1;
    navPrev.disabled = !hasMany;
    navNext.disabled = !hasMany;
    navPrev.classList.toggle('is-disabled', !hasMany);
    navNext.classList.toggle('is-disabled', !hasMany);
  }

  function openByIndex(index) {
    if (!modal || !modalImg || !modalCaption) return;

    const items = getVisibleItems();
    if (!items.length) return;

    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];

    modalImg.src = item.href;
    modalImg.alt = item.caption || '';
    modalCaption.textContent = item.caption || '';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateModalNavButtons(items);
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
    const items = getVisibleItems();
    if (items.length <= 1) return;
    openByIndex(currentIndex + 1);
  }

  function prev() {
    const items = getVisibleItems();
    if (items.length <= 1) return;
    openByIndex(currentIndex - 1);
  }

  // ===== Click to open modal (表示済みのみ) =====
  document.addEventListener('click', (e) => {
    const card = e.target.closest('a.card');
    if (!card) return;
    if (card.hidden) return;

    e.preventDefault();

    const visibleCards = getVisibleCards();
    const href = card.getAttribute('href');
    const idx = visibleCards.findIndex(x => x.getAttribute('href') === href);
    openByIndex(idx >= 0 ? idx : 0);
  });

  // ===== Close controls =====
  if (modalClose) modalClose.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
  if (modal) modal.addEventListener('click', () => closeModal());
  if (modalFrame) modalFrame.addEventListener('click', (e) => e.stopPropagation());

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
  let touchStartX = 0, touchStartY = 0, touchActive = false;
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
      if (dx < 0) next(); else prev();
    }, { passive: true });
  }

  // ===== Infinite trigger =====
  function setupInfinite() {
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => showNextBatch());
    }

    // IntersectionObserver が使えるなら自動読み込み
    if (trigger && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (shown >= total) return;
          showNextBatch();
        });
      }, {
        root: null,
        rootMargin: '600px 0px', // 早めに読み込む（体感が滑らか）
        threshold: 0
      });

      io.observe(trigger);
    }
  }

  // ===== Init =====
  hideAllCards();
  showNextBatch(); // 初回表示
  setupInfinite();
})();
