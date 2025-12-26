(() => {
  const entry = document.getElementById('entry');
  const roomsSection = document.getElementById('rooms');
  const roomsEl = document.getElementById('roomsList');

  const rooms = Array.from(document.querySelectorAll('.room'));
  const choices = Array.from(document.querySelectorAll('.choice'));
  const hudButtons = Array.from(document.querySelectorAll('.hud-btn'));

  const backBtn = document.getElementById('backToArrival');
  const viewMenuBtn = document.getElementById('viewMenuBtn');
  const skip = document.getElementById('skip');

  const ENTRY_HIDE_CLASS = 'entry-hidden';
  const VISIBLE_CLASS = 'is-visible';

  if (!entry || !roomsSection || !roomsEl || rooms.length === 0) return;

  function isDesktop(){
    return window.matchMedia('(min-width: 901px)').matches;
  }

  function showEntry(){
    entry.style.display = '';
    entry.classList.remove(ENTRY_HIDE_CLASS);
    // scroll to top smoothly so it feels seamless
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', '#');
  }

  function hideEntry(){
    entry.classList.add(ENTRY_HIDE_CLASS);
    setTimeout(() => {
      entry.style.display = 'none';
    }, 420);
  }

  function smoothHorizontalScroll(container, targetX, duration = 650){
    const start = container.scrollLeft;
    const change = targetX - start;
    const startTime = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);

    function animate(now){
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      container.scrollLeft = start + change * ease(t);
      if (t < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function navigateToRoom(id, { instant = false } = {}){
    const target = document.getElementById(id);
    if (!target) return;

    if (isDesktop()){
      const index = rooms.indexOf(target);
      if (index < 0) return;

      // use actual card width + gap
      const gap = parseFloat(getComputedStyle(roomsEl).gap || '22');
      const cardWidth = rooms[index].getBoundingClientRect().width;
      const left = index * (cardWidth + gap);

      if (instant) roomsEl.scrollLeft = left;
      else smoothHorizontalScroll(roomsEl, left);

      history.replaceState(null, '', `#${id}`);
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - 18;
      if (instant) window.scrollTo(0, top);
      else window.scrollTo({ top, behavior: 'smooth' });

      history.replaceState(null, '', `#${id}`);
    }
  }

  function enterRooms(targetId){
    hideEntry();
    setTimeout(() => {
      roomsSection.focus();
      navigateToRoom(targetId, { instant: false });
    }, 460);
  }

  // Choice buttons
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
      const id = b.getAttribute('data-target');
      navigateToRoom(id);
    });
  });

  // Back to Arrival button
  backBtn.addEventListener('click', () => {
    showEntry();
  });

  // "View menu" on entry
  viewMenuBtn.addEventListener('click', () => {
    enterRooms('counter');
  });

  // Skip link
  skip.addEventListener('click', (e) => {
    e.preventDefault();
    enterRooms('counter');
  });

  // Reveal + active HUD tracking
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      const el = ent.target;
      const id = el.id;
      if (ent.isIntersecting && ent.intersectionRatio >= 0.45) {
        el.classList.add(VISIBLE_CLASS);

        hudButtons.forEach(b => {
          const active = b.getAttribute('data-target') === id;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }
    });
  }, { threshold: [0.45] });

  rooms.forEach(r => observer.observe(r));

  // Deep link support
  window.addEventListener('load', () => {
    const hash = location.hash.replace('#', '').trim();
    if (hash && document.getElementById(hash)) {
      entry.style.display = 'none';
      setTimeout(() => navigateToRoom(hash, { instant: true }), 80);
    }
  });

  // Resize keeps you centered on the active room (desktop)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const activeBtn = hudButtons.find(b => b.classList.contains('active'));
      const id = activeBtn?.getAttribute('data-target') || 'counter';
      navigateToRoom(id, { instant: true });
    }, 180);
  });
})();
