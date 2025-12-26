/*
  script.js
  Fixes:
  - Arrival (entry) can be returned to seamlessly
  - Tabs always work (no reliance on gap math)
  - Updates hash without breaking entry/rooms
  - Scroll progress bar
  - Click “View menu” smooth jump
*/

(() => {
  const ENTRY_ID = 'entry';
  const ROOMS_SECTION_ID = 'rooms';
  const ROOMS_LIST_ID = 'roomsList';

  const ROOM_SELECTOR = '.room';
  const CHOICE_SELECTOR = '.choice';
  const HUD_BTN_SELECTOR = '.hud-btn';

  const ENTRY_HIDE_CLASS = 'entry-hidden';
  const VISIBLE_CLASS = 'is-visible';

  const entry = document.getElementById(ENTRY_ID);
  const roomsSection = document.getElementById(ROOMS_SECTION_ID);
  const roomsList = document.getElementById(ROOMS_LIST_ID);

  const rooms = Array.from(document.querySelectorAll(ROOM_SELECTOR));
  const choices = Array.from(document.querySelectorAll(CHOICE_SELECTOR));
  const hudButtons = Array.from(document.querySelectorAll(HUD_BTN_SELECTOR));

  const scrollBar = document.getElementById('scrollBar');
  const seeMenuBtn = document.getElementById('seeMenuBtn');

  if (!entry || !roomsSection || !roomsList || rooms.length === 0) return;

  const isDesktop = () => window.matchMedia('(min-width: 981px)').matches;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth scroll helper
  function smoothScrollTo({ top, left, el, duration = 720 }) {
    if (prefersReducedMotion()) {
      if (el && typeof left === 'number') el.scrollLeft = left;
      if (typeof top === 'number') window.scrollTo(0, top);
      return;
    }

    const startTime = performance.now();

    if (el && typeof left === 'number') {
      const start = el.scrollLeft;
      const change = left - start;
      const ease = t => 1 - Math.pow(1 - t, 3);

      function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        el.scrollLeft = Math.round(start + change * ease(t));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      return;
    }

    if (typeof top === 'number') {
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // View switching
  function showEntry() {
    entry.style.display = '';
    entry.classList.remove(ENTRY_HIDE_CLASS);

    // Scroll to top so the hero feels “full”
    smoothScrollTo({ top: 0 });

    // Update active HUD state
    setActive('entry');

    // Hash becomes #arrival (optional) or blank
    history.replaceState(null, '', '#arrival');
  }

  function hideEntry() {
    entry.classList.add(ENTRY_HIDE_CLASS);
    setTimeout(() => {
      entry.style.display = 'none';
    }, 520);
  }

  // Find left offset of a room inside the horizontal scroller (real math, no guessing)
  function getRoomLeft(target) {
    const containerRect = roomsList.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const delta = targetRect.left - containerRect.left;
    return roomsList.scrollLeft + delta - 0; // no extra shift
  }

  function navigateToRoom(id, { instant = false } = {}) {
    const target = document.getElementById(id);
    if (!target) return;

    // If they click "ARRIVAL"
    if (id === 'entry' || id === 'arrival') {
      showEntry();
      return;
    }

    // Ensure rooms view is visible
    if (entry.style.display !== 'none') hideEntry();

    // Focus rooms section
    roomsSection.focus({ preventScroll: true });

    if (isDesktop()) {
      const left = getRoomLeft(target);
      if (instant) roomsList.scrollLeft = left;
      else smoothScrollTo({ el: roomsList, left, duration: 760 });
      target.focus({ preventScroll: true });
    } else {
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - 18;
      if (instant) window.scrollTo(0, top);
      else smoothScrollTo({ top });
      target.focus();
    }
  }

  function setActive(id) {
    hudButtons.forEach(btn => {
      const t = btn.getAttribute('data-target');
      const active = (t === id) || (id === 'arrival' && t === 'entry');
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  // Entry choice click
  choices.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      hideEntry();
      setTimeout(() => navigateToRoom(targetId), 120);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // HUD buttons
  hudButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      navigateToRoom(target);
    });
  });

  // Inline jump buttons inside rooms
  document.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-jump');
      navigateToRoom(target);
    });
  });

  // "View menu" button from hero
  if (seeMenuBtn) {
    seeMenuBtn.addEventListener('click', () => {
      hideEntry();
      setTimeout(() => navigateToRoom('counter'), 120);
    });
  }

  // Reveal observer + update hash for rooms
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      const el = ent.target;
      if (ent.isIntersecting && ent.intersectionRatio >= 0.55) {
        el.classList.add(VISIBLE_CLASS);
        setActive(el.id);
        history.replaceState(null, '', `#${el.id}`);
      }
    });
  }, { threshold: [0.55] });

  rooms.forEach(r => {
    r.setAttribute('tabindex', '-1');
    observer.observe(r);
  });

  // Scroll progress (page based)
  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const y = window.scrollY;
    const pct = max <= 0 ? 0 : (y / max) * 100;
    if (scrollBar) scrollBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Respect hash on load
  window.addEventListener('load', () => {
    const raw = location.hash.replace('#', '').trim();

    if (!raw || raw === 'arrival') {
      showEntry();
      return;
    }

    if (raw && document.getElementById(raw)) {
      // Direct deep link -> open rooms
      entry.style.display = 'none';
      navigateToRoom(raw, { instant: true });
    } else {
      showEntry();
    }
  });

  // Keep current room aligned on resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const hash = location.hash.replace('#', '');
      const current = document.getElementById(hash) || rooms[0];
      if (current) navigateToRoom(current.id, { instant: true });
    }, 140);
  });

})();
