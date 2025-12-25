/*
  script.js
  Minimal, accessible JS to:
  - Handle entry choices -> cinematic transition into rooms
  - Manage horizontal scroll experience on desktop, vertical on mobile
  - HUD navigation with active highlighting
  - Keyboard navigation and deep-link support
*/

(() => {
  const ENTRY_ID = 'entry';
  const ROOMS_ID = 'roomsList';
  const ROOM_SELECTOR = '.room';
  const CHOICE_SELECTOR = '.choice';
  const HUD_BTN_SELECTOR = '.hud-btn';
  const ENTRY_HIDE_CLASS = 'entry-hidden';
  const VISIBLE_CLASS = 'is-visible';
  const ORDER_URL_HASHLESS = 'https://www.oldcrowcoffeehouse.com/s/order?location=L997DRP29E90H#XBLGAQVX3LQYZWHLURH52C2N';

  const entry = document.getElementById(ENTRY_ID);
  const roomsEl = document.getElementById(ROOMS_ID);
  const rooms = Array.from(document.querySelectorAll(ROOM_SELECTOR));
  const choices = Array.from(document.querySelectorAll(CHOICE_SELECTOR));
  const hudButtons = Array.from(document.querySelectorAll(HUD_BTN_SELECTOR));
  const roomsSection = document.getElementById('rooms');

  if (!roomsEl) return;

  // Detect layout type
  function isDesktop() {
    return window.matchMedia('(min-width: 901px)').matches;
  }

  // Smooth horizontal scroll with easing
  function smoothHorizontalScroll(container, targetX, duration = 700) {
    const start = container.scrollLeft;
    const change = targetX - start;
    const startTime = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      container.scrollLeft = Math.round(start + change * ease(t));
      if (t < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // Navigate to room by id
  function navigateToRoom(id, {instant = false} = {}) {
    const target = document.getElementById(id);
    if (!target) return;
    if (isDesktop()) {
      const index = rooms.indexOf(target);
      const left = index * (roomsEl.clientWidth + parseInt(getComputedStyle(roomsEl).gap || 28));
      if (instant) roomsEl.scrollLeft = left;
      else smoothHorizontalScroll(roomsEl, left, 720);
      target.focus({preventScroll: true});
    } else {
      // mobile / stacked: scroll page to the element
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - 24;
      if (instant) window.scrollTo(0, top);
      else window.scrollTo({top, behavior: 'smooth'});
      target.focus();
    }
  }

  // Entry -> rooms transition
  function enterRooms(targetId) {
    // Add hide class to entry for CSS transitions
    entry.classList.add(ENTRY_HIDE_CLASS);

    // After transition, hide entry from layout and focus rooms
    setTimeout(() => {
      entry.style.display = 'none';
      roomsSection.focus();
      // Navigate to the designated room
      navigateToRoom(targetId, {instant: false});
    }, 480);
  }

  // Hook up choice buttons
  choices.forEach(btn => {
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
  hudButtons.forEach(b => {
    b.addEventListener('click', () => {
      const target = b.getAttribute('data-target');
      navigateToRoom(target);
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); b.click();
      }
    });
  });

  // IntersectionObserver to reveal rooms and update HUD active state & history
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entryObs => {
      const el = entryObs.target;
      const id = el.id;
      if (entryObs.isIntersecting && entryObs.intersectionRatio >= 0.45) {
        el.classList.add(VISIBLE_CLASS);
        // Update HUD active button
        hudButtons.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-target') === id);
          b.setAttribute('aria-pressed', b.getAttribute('data-target') === id ? 'true' : 'false');
        });
        // Update location.hash quietly (no jump)
        history.replaceState(null, '', `#${id}`);
      } else {
        el.classList.remove(VISIBLE_CLASS);
      }
    });
  }, {threshold: [0.45]});

  rooms.forEach(r => {
    observer.observe(r);
  });

  // Keyboard left/right navigation when focused in rooms container
  roomsEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const visibleIndex = rooms.findIndex(r => r.classList.contains(VISIBLE_CLASS));
      let next = visibleIndex;
      if (visibleIndex === -1) next = 0;
      if (e.key === 'ArrowRight') next = Math.min(rooms.length - 1, visibleIndex + 1);
      if (e.key === 'ArrowLeft') next = Math.max(0, visibleIndex - 1);
      navigateToRoom(rooms[next].id);
    }
  });

  // Make each room panel keyboard-focusable
  rooms.forEach(r => {
    r.setAttribute('tabindex', '-1');
  });

  // Respect hash on load (deep link). If hash points to a room, show rooms and jump there.
  window.addEventListener('load', () => {
    const hash = location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      // Hide entry immediately for deep-link
      entry.style.display = 'none';
      // Ensure layout and then jump
      setTimeout(() => navigateToRoom(hash, {instant: true}), 80);
    }
  });

  // Re-center on resize to keep the active room centered
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const visible = rooms.find(r => r.classList.contains(VISIBLE_CLASS)) || rooms[0];
      if (visible) navigateToRoom(visible.id, {instant: true});
    }, 140);
  });

  // Accessibility: Skip link focusing
  const skip = document.getElementById('skip');
  skip.addEventListener('click', (e) => {
    e.preventDefault();
    roomsSection.focus();
    // If entry is visible, hide it when skipping
    if (!entry.classList.contains(ENTRY_HIDE_CLASS)) {
      entry.classList.add(ENTRY_HIDE_CLASS);
      setTimeout(() => entry.style.display = 'none', 480);
    }
  });

  // Graceful fallback: if images don't load, ensure contrast & background color remain readable
  // (No explicit code needed; CSS provides color fallbacks)

  // Enhance focus visibility for keyboard users
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('user-is-tabbing');
  });

})();
