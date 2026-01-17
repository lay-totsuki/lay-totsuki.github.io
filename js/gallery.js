// gallery.js (pagination + modal)
// 対象: gallery-original.html / gallery-fanart.html / gallery-mini.html
(() => {
  // ===== Settings =====
  const PER_PAGE = 12; // 1ページあたりの表示枚数（好みで変更）

  // ===== Elements =====
  const modal = document.getElementById('modal');
  const modalFrame = document.getElementById('modalFrame');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');

  const pager = document.getElementById('pager');

  // grid内のカード一覧（全件）
  const allCards = Array.from(document.querySelectorAll('a.card'));

  // ===== Helpers =====
  function getPageFromURL() {
    const params = new URLSearchParams(location.search);
    const p = parseInt(params.get('page') || '1', 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  }

  function setPageToURL(page) {
    const url = new URL(location.href);
    url.searchParams.set('page', String(page));
    // ハッシュは維持
    history.replaceState({}, '', url.toString());
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // ===== Pagination State =====
  const totalItems = allCards.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  let currentPage = clamp(getPageFromURL(), 1, totalPages);

  // 表示中ページのカードだけを使ってモーダルの前後移動をする
  let pageCards = [];
  let pageItems = [];
  let currentIndex = -1;

  function rebuildPageItems() {
    pageCards = Array.from(document.querySelectorAll('a.card')).filter(a => !a.hidden);
    pageItems = pageCards.map(a => ({
      href: a.getAttribute('href'),
      caption: a.getAttribute('data-caption') || ''
    }));
  }

  function renderPager() {
    if (!pager) return;
    pager.innerHTML = '';

    if (totalPages <= 1) return;

    const makeBtn = (label, page, disabled = false, isCurrent = false) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.disabled = disabled;
      btn.setAttribute('aria-disabled', String(disabled));
      if (isCurrent) btn.setAttribute('aria-current', 'page');

      btn.addEventListener('click', () => {
        if (disabled) return;
        goToPage(page);
      });
      return btn;
    };

    // Prev
    pager.appendChild(makeBtn('‹ Prev', currentPage - 1, currentPage === 1));

    // Page numbers（多すぎると邪魔なので簡易ウィンドウ表示）
    const windowSize = 7; // 表示するページ番号数
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    if (start > 1) {
      pager.appendChild(makeBtn('1', 1, false, currentPage === 1));
      if (start > 2) {
        const span = document.createElement('span');
        span.textContent = '…';
        span.style.padding = '0 6px';
        pager.appendChild(span);
      }
    }

    for (let p = start; p <= end; p++) {
      pager.appendChild(makeBtn(String(p), p, false, p === currentPage));
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        const span = document.createElement('span');
        span.textContent = '…';
        span.style.padding = '0 6px';
        pager.appendChild(span);
      }
      pager.appendChild(makeBtn(String(totalPages), totalPages, false, currentPage === totalPages));
    }

    // Next
    pager.appendChild(makeBtn('Next ›', currentPage + 1, currentPage === totalPages));
  }

  function applyPagination() {
    const startIdx = (currentPage - 1) * PER_PAGE;
    const endIdx = startIdx + PER_PAGE;

    allCards.forEach((card, idx) => {
      card.hidden = !(idx >= startIdx && idx < endIdx);
    });

    setPageToURL(currentPage);
    renderPager();
    rebuildPageItems();
    updateModalNavButtons();
  }

  function goToPage(page) {
    currentPage = clamp(page, 1, totalPages);
    // モーダル開いてたら閉じる（ページ跨ぎでインデックスがズレるため）
    if (isOpen()) closeModal();
    applyPagination();
    // ページトップに戻したい場合はコメント解除
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== Modal =====
  function isOpen() {
    return modal && modal.classList.contains('is-open');
  }

  function updateModalNavButtons() {
    if (!navPrev || !navNext) return;
    const hasMany = pageItems.length > 1;
    navPrev.disabled = !hasMany;
    navNext.disabled = !hasMany;
    navPrev.classList.toggle('is-disabled', !hasMany);
    navNext.classList.toggle('is-disabled', !hasMany);
  }

  function openByIndex(index) {
    if (!modal || !modalImg || !modalCaption) return;
    if (!pageItems.length) return;

    currentIndex = (index + pageItems.length) % pageItems.length;
    const item = pageItems[currentIndex];

    modalImg.src = item.href;
    modalImg.alt = item.caption || '';
    modalCaption.textContent = item.caption || '';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateModalNavButtons();
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
    if (pageItems.length <= 1) return;
    openByIndex(currentIndex + 1);
  }

  function prev() {
    if (pageItems.length <= 1) return;
    openByIndex(currentIndex - 1);
  }

  // ===== Click to open modal (表示中のみ) =====
  document.addEventListener('click', (e) => {
    const card = e.target.closest('a.card');
    if (!card) return;
    if (card.hidden) return; // 非表示カードは反応しない

    e.preventDefault();

    // 現在ページのリストからインデックスを引く
    const href = card.getAttribute('href');
    const idx = pageItems.findIndex(x => x.href === href);
    openByIndex(idx >= 0 ? idx : 0);
  });

  // Close controls
  if (modalClose) modalClose.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
  if (modal) modal.addEventListener('click', () => closeModal());
  if (modalFrame) modalFrame.addEventListener('click', (e) => e.stopPropagation());

  // Nav buttons
  if (navPrev) navPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  if (navNext) navNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe
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

  // ===== Init =====
  applyPagination();
})();
