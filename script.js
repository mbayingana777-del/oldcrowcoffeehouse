/*
  script.js — upgraded
  Goals:
  1) Seamless return to Arrival (green hero) via HUD Home button
  2) Smooth “enter” transition + menu peek button
  3) Better horizontal scroll math + active tab tracking + progress bar
  4) Winter snow effect + subtle parallax on hero background
*/

(() => {
  const ENTRY_ID = 'entry';
  const ROOMS_LIST_ID = 'roomsList';
  const ROOMS_SECTION_ID = 'rooms';
  const ROOM_SELECTOR = '.room';
  const CHOICE_SELECTOR = '.choice';
  const HUD_BTN_SELECTOR = '.hud-btn';
  const HUD_HOME_ID = 'hudHome';
  const PEEK_MENU_ID = 'peekMenu';
  const PROGRESS_ID = 'progressBar';

  const ENTRY_HIDE_CLASS = 'entry-hidden';
  const ENTRY_OFF_CLASS = 'entry-off';
  const VISIBLE_CLASS = 'is-visible';

  const ORDER_URL =
    'https://www.oldcrowcoffeehouse.com/s/order?location=L997DRP29E90H#XBLGAQVX3LQYZWHLURH52C2N';

  const entry = document.getElementById(ENTRY_ID);
  const roomsEl = document.getElementById(ROOMS_LIST_ID);
  const roomsSection = document.getElementById(ROOMS_SECTION_ID);
  const rooms = Array.from(document.querySelectorAll(ROOM_SELECTOR));
  const choices = Array.from(document.querySelectorAll(CHOICE_SELECTOR));
  const hudButtons = Array.from(document.querySelectorAll(HUD_BTN_SELECTOR));
  const hudHome = document.getElementById(HUD_HOME_ID);
  const peekMenu = document.getElementById(PEEK_MENU_ID);
  const progressBar = document.getElementById(PROGRESS_ID);

  if (!entry || !roomsEl || !roomsSection || rooms.length === 0) return;

  // Force all [data-order] links to the correct official URL
  document.querySelectorAll('[data-order]').forEach((a) => {
    a.href = ORDER_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isDesktop() {
    return window.matchMedia('(min-width: 901px)').matches;
  }

  // --- Smooth horizontal scroll with easing ---
  function smoothHorizontalScroll(container, targetX, duration = 720) {
    if (prefersReduced) {
      container.scrollLeft = targetX;
      return;
    }
    const start = container.scrollLeft;
    const change = targetX - start;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      container.scrollLeft = start + change * ease(t);
      if (t < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // Find room by id
  function getRoomById(id) {
    return document.getElementById(id);
  }

  // Compute scrollLeft to center a room in the horizontal container
  function scrollLeftForRoom(room) {
    const containerRect = roomsEl.getBoundingClientRect();
    const roomRect = room.getBoundingClientRect();
    const currentScroll = roomsEl.scrollLeft;

    // room's left relative to container scroll area
    const roomLeftInContainer = roomRect.left - containerRect.left + currentScroll;
    const target = roomLeftInContainer - (roomsEl.clientWidth - room.clientWidth) / 2;
    return Math.max(0, target);
  }

  // Navigate to room by id
  function navigateToRoom(id, { instant = false } = {}) {
    const target = getRoomById(id);
    if (!target) return;

    if (isDesktop()) {
      const left = scrollLeftForRoom(target);
      if (instant) roomsEl.scrollLeft = left;
      else smoothHorizontalScroll(roomsEl, left, 760);
      target.focus({ preventScroll: true });
    } else {
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - 18;
      if (instant || prefersReduced) window.scrollTo(0, top);
      else window.scrollTo({ top, behavior: 'smooth' });
      target.focus({ preventScroll: true });
    }
  }

  // Entry -> rooms transition
  function enterRooms(targetId) {
    entry.classList.add(ENTRY_HIDE_CLASS);

    // Wait for CSS fade then remove from layout
    window.setTimeout(() => {
      entry.classList.add(ENTRY_OFF_CLASS);

      // Focus rooms section and move
      roomsSection.focus({ preventScroll: true });
      roomsSection.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });

      window.setTimeout(() => {
        navigateToRoom(targetId, { instant: false });
      }, prefersReduced ? 0 : 220);
    }, prefersReduced ? 0 : 480);
  }

  // Return to Arrival (hero)
  function returnToArrival() {
    // Show entry again
    entry.classList.remove(ENTRY_OFF_CLASS);
    // Small frame to allow layout, then remove hidden class for smooth fade in
    requestAnimationFrame(() => {
      entry.classList.remove(ENTRY_HIDE_CLASS);

      // Reset scroll state
      if (isDesktop()) roomsEl.scrollLeft = 0;
      else window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });

      // Update hash to nothing (clean)
      history.replaceState(null, '', location.pathname + location.search);
      setActive('counter'); // default highlight
      updateProgress();
    });

    // Focus top
    entry.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  }

  // Hook up entry choice buttons
  choices.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      enterRooms(targetId);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // HUD buttons
  hudButtons.forEach((b) => {
    b.addEventListener('click', () => {
      const target = b.getAttribute('data-target');
      navigateToRoom(target);
    });

    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        b.click();
      }
    });
  });

  // HUD Home
  if (hudHome) {
    hudHome.addEventListener('click', returnToArrival);
    hudHome.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        returnToArrival();
      }
    });
  }

  // Peek menu button on hero
  if (peekMenu) {
    peekMenu.addEventListener('click', () => {
      // don't hide entry; just scroll to rooms title preview
      roomsSection.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // Active state
  function setActive(id) {
    hudButtons.forEach((b) => {
      const on = b.getAttribute('data-target') === id;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // Reveal animation + HUD update
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entryObs) => {
        const el = entryObs.target;
        const id = el.id;

        if (entryObs.isIntersecting && entryObs.intersectionRatio >= 0.45) {
          el.classList.add(VISIBLE_CLASS);
          setActive(id);
          history.replaceState(null, '', `#${id}`);
          updateProgress();
        }
      });
    },
    { threshold: [0.45] }
  );

  rooms.forEach((r) => observer.observe(r));
  rooms.forEach((r) => r.setAttribute('tabindex', '-1'));

  // Keyboard left/right navigation on desktop (when roomsEl focused)
  roomsEl.addEventListener('keydown', (e) => {
    if (!isDesktop()) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const visibleIndex = rooms.findIndex((r) => r.classList.contains(VISIBLE_CLASS));
      let next = visibleIndex === -1 ? 0 : visibleIndex;

      if (e.key === 'ArrowRight') next = Math.min(rooms.length - 1, next + 1);
      if (e.key === 'ArrowLeft') next = Math.max(0, next - 1);

      navigateToRoom(rooms[next].id);
    }
  });

  // Progress bar based on scroll position
  function updateProgress() {
    if (!progressBar) return;

    if (isDesktop()) {
      const maxScroll = roomsEl.scrollWidth - roomsEl.clientWidth;
      const pct = maxScroll <= 0 ? 0 : (roomsEl.scrollLeft / maxScroll) * 100;
      progressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    } else {
      // mobile: approximate based on which room is active
      const idx = rooms.findIndex((r) => r.classList.contains(VISIBLE_CLASS));
      const pct = idx <= 0 ? 0 : (idx / (rooms.length - 1)) * 100;
      progressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    }
  }

  roomsEl.addEventListener('scroll', () => requestAnimationFrame(updateProgress), { passive: true });
  window.addEventListener('scroll', () => requestAnimationFrame(updateProgress), { passive: true });

  // Deep link behavior:
  // If user visits with #breakfast etc, auto-enter after a short beat (feels cinematic)
  window.addEventListener('load', () => {
    // Snow canvas init
    initSnow();

    const hash = location.hash.replace('#', '');
    if (hash && getRoomById(hash)) {
      // show hero for a moment, then enter
      if (!prefersReduced) {
        setTimeout(() => enterRooms(hash), 650);
      } else {
        // reduced motion: go straight
        entry.classList.add(ENTRY_OFF_CLASS);
        navigateToRoom(hash, { instant: true });
      }
    } else {
      setActive('counter');
      updateProgress();
    }
  });

  // Resize keep active centered
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateProgress();
      const active = rooms.find((r) => r.classList.contains(VISIBLE_CLASS)) || rooms[0];
      if (active) navigateToRoom(active.id, { instant: true });
    }, 160);
  });

  // Skip link handling: hide entry if skipping
  const skip = document.getElementById('skip');
  skip.addEventListener('click', (e) => {
    e.preventDefault();
    // do not fully hide entry; just scroll to rooms section
    roomsSection.focus({ preventScroll: true });
    roomsSection.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  });

  // ---- HERO PARALLAX (subtle) ----
  const heroBg = document.querySelector('.hero-bg');
  window.addEventListener(
    'mousemove',
    (e) => {
      if (!heroBg || prefersReduced) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      heroBg.style.transform = `scale(1.03) translate(${x}px, ${y}px)`;
    },
    { passive: true }
  );

  // ---- SNOW CANVAS (lightweight) ----
  function initSnow() {
    const canvas = document.getElementById('snow');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0;
    let raf = null;

    const flakes = [];
    const FLAKE_COUNT = 110; // subtle but noticeable

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function makeFlake() {
      return {
        x: rand(0, w),
        y: rand(-h, 0),
        r: rand(0.6, 2.2),
        vx: rand(-0.4, 0.4),
        vy: rand(0.6, 1.7),
        a: rand(0.18, 0.55)
      };
    }

    for (let i = 0; i < FLAKE_COUNT; i++) flakes.push(makeFlake());

    function tick() {
      ctx.clearRect(0, 0, w, h);

      // Only draw snow when hero is visible (entry not off)
      const entryVisible = !entry.classList.contains(ENTRY_OFF_CLASS);
      if (!entryVisible) {
        raf = requestAnimationFrame(tick);
        return;
      }

      for (const f of flakes) {
        f.x += f.vx;
        f.y += f.vy;

        if (f.y > h + 10) {
          f.x = rand(0, w);
          f.y = rand(-40, -10);
        }
        if (f.x > w + 10) f.x = -10;
        if (f.x < -10) f.x = w + 10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${f.a})`;
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    // Respect reduced motion: lower intensity
    if (prefersReduced) {
      // just a static faint overlay by stopping early
      return;
    }

    tick();

    // Cleanup if needed
    window.addEventListener('beforeunload', () => {
      if (raf) cancelAnimationFrame(raf);
    });
  }
})();
