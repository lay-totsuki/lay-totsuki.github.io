// gallery.js (infinite scroll-like + modal nav across ALL items + auto scroll)
// - 一覧はBATCHずつ表示（無限スクロール風）
// - モーダルの次/前は「全件」を対象に回す
// - まだ表示されていない次の画像に進む時は、自動で必要分を表示
// - モーダルで移動したら、一覧側を該当カード位置へ自動スクロール（気持ちいいやつ）

(() => {
  // ===== Settings =====
  const BATCH = 12;              // 1回で追加表示する枚数
  const SCROLL_BEHAVIOR = 'smooth';
  const SCROLL_BLOCK = 'center'; // 'start' / 'center' / 'nearest'
  const SCROLL_DELAY_MS = 40;    // DOM反映後にスクロールするための小さな待ち

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

  // grid内カード全件（DOMに全部置いておく方式）
  const allCards = Array.from(document.querySelectorAll('a.card'));
  const total = allCards.length;

  // ===== State =====
  let shown = 0;          // 現在表示している枚数
  let currentIndex = -1;  // 「全件」基準のインデックス

  function isOpen() {
    return modal && modal.classList.contains('is-open');
  }

  function hideAllCards() {
    allCards.forEach(card => { card.hidden = true; });
  }

  function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    const done = shown >= total;
    loadMoreBtn.style.display = done ? 'none' : 'inline-flex';
    loadMoreBtn.disabled = done;
  }

  function showUntil(targetCount) {
    const next = Math.min(total, targetCount);
    for (let i = shown; i < next; i++) {
      allCards[i].hidden = false;
    }
    shown = next;
    updateLoadMoreButton();
  }

  function showNextBatch() {
    showUntil(shown + BATCH);
  }

  function updateModalNavButtons() {
    if (!navPrev || !navNext) return;
    const hasMany = total > 1;
    navPrev.disabled = !hasMany;
    navNext.disabled = !hasMany;
    navPrev.classList.toggle('is-disabled', !hasMany);
    navNext.classList.toggle('is-disabled', !hasMany);
  }

  function ensureVisibleForIndex(index) {
    const need = index + 1; // 0-basedなので+1枚必要
    if (need > shown) showUntil(need);
  }

  function scrollToCard(index) {
    const card = allCards[index];
    if (!card) return;

    // hidden解除直後はレイアウトが確定してないことがあるので少し待つ
    window.setTimeout(() => {
      try {
        card.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: SCROLL_BLOCK, inline: 'nearest' });
      } catch (_) {
        // 古いブラウザ用フォールバック
        card.scrollIntoView();
      }

      // どれが今のカードか分かりやすいようにフォーカスも当てる（アクセシブル）
      // ただし a 要素に focus するため tabindex を一時付与
      const hadTabIndex = card.hasAttribute('tabindex');
      if (!hadTabIndex) card.setAttribute('tabindex', '-1');
      card.focus({ preventScroll: true });
      if (!hadTabIndex) card.removeAttribute('tabindex');
    }, SCROLL_DELAY_MS);
  }

  function openByIndex(index, { autoScroll = false } = {}) {
    if (!modal || !modalImg || !modalCaption) return;
    if (!total) return;

    // wrap
    currentIndex = ((index % total) + total) % total;

    // まだ一覧で見えてない分なら先に表示しておく
    ensureVisibleForIndex(currentIndex);

    const card = allCards[currentIndex];
    const href = card.getAttribute('href');
    const caption = card.getAttribute('data-caption') || '';

    modalImg.src = href;
    modalImg.alt = caption;
    modalCaption.textContent = caption;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateModalNavButtons();

    if (autoScroll) {
      scrollToCard(currentIndex);
    }
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
    if (total <= 1) return;
    openByIndex(currentIndex + 1, { autoScroll: true });
  }

  function prev() {
    if (total <= 1) return;
    openByIndex(currentIndex - 1, { autoScroll: true });
  }

  // ===== Click to open modal (表示済みのカードだけクリック可) =====
  document.addEventListener('click', (e) => {
    const card = e.target.closest('a.card');
    if (!card) return;
    if (card.hidden) return;

    e.preventDefault();

    const href = card.getAttribute('href');
    const idx = allCards.findIndex(x => x.getAttribute('href') === href);

    // クリックで開いた場合は「既にその場所にいる」ので autoScroll しない
    openByIndex(idx >= 0 ? idx : 0, { autoScroll: false });
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
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => showNextBatch());

    if (trigger && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (shown >= total) continue;
          showNextBatch();
        }
      }, {
        root: null,
        rootMargin: '600px 0px',
        threshold: 0
      });

      io.observe(trigger);
    }
  }

  // ===== Init =====
  hideAllCards();
  showNextBatch();      // 初回表示
  setupInfinite();
  updateModalNavButtons();
})();

// =========================
// Right click save prevention (light protection)
// =========================

document.addEventListener('contextmenu', (e) => {
  const img = e.target.closest('img');
  if (img) {
    e.preventDefault();
  }
});

document.addEventListener('dragstart', (e) => {
  const img = e.target.closest('img');
  if (img) {
    e.preventDefault();
  }
});
