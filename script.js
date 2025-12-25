// Minimal, focused JS for navigation & cinematic scroll
// - Handles entry choices -> horizontal rooms
// - Adds 'is-visible' when a room is in view
// - Responsive behavior: on small screens fall back to vertical scrolling

(() => {
  const choices = Array.from(document.querySelectorAll('.choice'));
  const roomsEl = document.getElementById('roomsList');
  const roomEls = Array.from(document.querySelectorAll('.room'));
  const entry = document.getElementById('entry');

  // Small helper: determines if layout is horizontal
  function isHorizontal() {
    return window.matchMedia('(min-width: 901px)').matches;
  }

  // Smooth scroll for horizontal container with easing
  function smoothScrollHorizontal(container, targetLeft, duration = 700) {
    const start = container.scrollLeft;
    const change = targetLeft - start;
    const startTime = performance.now();

    // cubic easing
    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      container.scrollLeft = Math.round(start + change * ease(t));
      if (t < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // Enter the rooms experience:
  // fade out entry scene (subtle) and move focus to the rooms container.
  function enterRooms(targetId) {
    // animate entry out
    entry.style.transition = 'opacity 520ms ease, transform 520ms ease';
    entry.style.opacity = '0';
    entry.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      entry.style.display = 'none';
      // focus rooms container for keyboard accessibility
      document.getElementById('rooms').focus();
      // scroll to the requested room
      navigateToRoom(targetId, {instant: false});
    }, 520);
  }

  // Navigate to a room by id
  function navigateToRoom(id, {instant = false} = {}) {
    const target = document.getElementById(id);
    if (!target) return;

    if (isHorizontal()) {
      // compute left offset
      const index = roomEls.indexOf(target);
      const left = index * roomsEl.clientWidth;
      if (instant) roomsEl.scrollLeft = left;
      else smoothScrollHorizontal(roomsEl, left, 720);
    } else {
      // vertical: scroll the page to the element
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - 20;
      if (instant) window.scrollTo(0, top);
      else window.scrollTo({top, behavior: 'smooth'});
    }
  }

  // Attach click handlers for the initial choices
  choices.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      // start the cinematic transition
      enterRooms(targetId);
    });
  });

  // Observe rooms to toggle 'is-visible' and keep panel animations tasteful
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      const el = ent.target;
      if (ent.isIntersecting && ent.intersectionRatio > 0.4) {
        el.classList.add('is-visible');
        // Update URL hash for deep-linking
        history.replaceState(null, '', `#${el.id}`);
      } else {
        el.classList.remove('is-visible');
      }
    });
  }, {
    threshold: [0.4, 0.7]
  });

  roomEls.forEach(r => observer.observe(r));

  // Keyboard navigation on rooms: left/right to move between rooms
  document.getElementById('rooms').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      // Find current visible index
      const idx = roomEls.findIndex(r => r.classList.contains('is-visible'));
      let next = idx;
      if (e.key === 'ArrowRight') next = Math.min(roomEls.length - 1, idx + 1);
      if (e.key === 'ArrowLeft') next = Math.max(0, idx - 1);
      // if none visible default to 0
      if (idx === -1) next = 0;
      navigateToRoom(roomEls[next].id);
    }
  });

  // Allow clicking on a room's panel to center it
  roomEls.forEach(r => {
    r.addEventListener('click', (e) => {
      const rect = r.getBoundingClientRect();
      // Only treat clicks in the panel area (avoid accidental clicks on photo)
      navigateToRoom(r.id);
    });
  });

  // Respect hash on load — if user comes with a deep link, jump in
  window.addEventListener('load', () => {
    const hash = location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      // hide entry instantly for deep link
      entry.style.display = 'none';
      // ensure layout/measurements are ready
      setTimeout(() => navigateToRoom(hash, {instant: true}), 80);
    }
  });

  // When resizing, ensure the current room stays centered
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const visible = roomEls.find(r => r.classList.contains('is-visible')) || roomEls[0];
      if (visible) navigateToRoom(visible.id, {instant: true});
    }, 120);
  });

})();
