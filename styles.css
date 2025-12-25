/* Old Crow Coffeehouse — styles
   Production-quality, organized, responsive
*/

/* ---------- Root theme variables ---------- */
:root{
  --bg: #0b0a09;
  --panel: rgba(24,20,18,0.45);
  --panel-strong: rgba(255, 238, 220, 0.06);
  --accent: #f2c48b; /* warm highlight */
  --muted: rgba(255,240,220,0.6);
  --glass-blur: 8px;
  --radius: 14px;
  --ease: cubic-bezier(.2,.9,.25,1);
  --max-content-width: 1100px;
}

/* ---------- Reset & base ---------- */
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: linear-gradient(180deg, rgba(10,9,8,1) 0%, rgba(6,5,5,1) 100%);
  color: var(--muted);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  line-height:1.45;
  overflow-x:hidden;
}

/* Accessibility helpers */
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip-link{
  position:fixed;left:12px;top:12px;background:#fff;color:#111;padding:8px 12px;border-radius:8px;z-index:60;font-weight:600;display:none;
}
@media (max-width:900px){.skip-link{display:block}}

/* ---------- Header / Footer ---------- */
.site-header{
  position:fixed;top:18px;left:18px;z-index:60;pointer-events:none;
}
.brand{display:flex;align-items:center;gap:10px;pointer-events:none}
.site-footer{
  position:fixed;right:18px;bottom:18px;color:rgba(255,255,255,0.25);font-size:13px;pointer-events:none;
}

/* ---------- ENTRY SCENE ---------- */
.entry-scene{
  height:100vh;
  min-height:640px;
  position:relative;
  display:grid;
  place-items:center;
  overflow:hidden;
}

/* scene background — replace images/exterior.jpg with your full-screen photo */
.scene-image{
  position:absolute;inset:0;background:
    linear-gradient(180deg, rgba(7,5,4,0.55), rgba(6,4,3,0.6)),
    url('images/exterior.jpg') center/cover no-repeat;
  transform:scale(1.03);
  filter:contrast(0.95) saturate(1.06);
  will-change:transform;
}

/* grain overlay (subtle texture) */
.grain{
  position:absolute;inset:0;mix-blend-mode:overlay;opacity:0.08;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6' fill='%23ffffff'/%3E%3C/svg%3E");
  background-size:cover;
  pointer-events:none;
}

/* overlay content */
.scene-overlay{
  position:relative;z-index:30;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:40px;width:100%;
  text-align:center;
}

/* headline / copy */
.headline{
  font-family: "Playfair Display", Georgia, serif;
  color: #fff;
  letter-spacing: 0.08em;
  margin:0 0 6px 0;
  font-weight:600;
  font-size: clamp(22px, 4.5vw, 46px);
  text-transform:uppercase;
  text-shadow: 0 6px 24px rgba(6,4,3,0.6);
}

.subtext{
  margin:0 0 18px 0;
  color:rgba(255,244,230,0.8);
  font-weight:300;
  font-size: clamp(14px, 2.2vw, 18px);
}

/* choices buttons (glassy) */
.choices{
  display:flex;gap:12px;align-items:center;justify-content:center;margin:18px 0 6px;flex-wrap:wrap;
}
.choice{
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  color:var(--muted);
  border:1px solid rgba(255,255,255,0.06);
  padding:12px 18px;border-radius:12px;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  font-weight:600;
  cursor:pointer;
  transition: transform 260ms var(--ease), box-shadow 260ms var(--ease), background 260ms var(--ease);
  box-shadow: 0 8px 30px rgba(2,2,2,0.45);
}
.choice:focus{outline:2px solid rgba(242,196,139,0.22);transform:translateY(-3px)}
.choice:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(2,2,2,0.6)}

/* hint */
.hint{margin-top:10px;color:rgba(255,240,220,0.48);font-size:13px}

/* subtle bottom fade */
.edge-fade{
  position:absolute;left:0;right:0;bottom:0;height:20vh;background:linear-gradient(180deg,transparent,rgba(6,4,3,0.8));pointer-events:none
}

/* ---------- ROOMS: horizontal scroll ---------- */
.rooms-container{
  height:100vh;
  max-height:calc(100vh);
  overflow:hidden;
  position:relative;
}

.rooms{
  display:flex;
  height:100%;
  width:100%;
  scroll-snap-type:x mandatory;
  overflow-x:auto;
  overflow-y:hidden;
  -webkit-overflow-scrolling:touch;
  scroll-behavior:smooth;
  scrollbar-width:none; /* Firefox */
  touch-action: pan-y; /* allow vertical scroll for mobile when stacked */
}
.rooms::-webkit-scrollbar{display:none}

.room{
  scroll-snap-align:center;
  flex:0 0 100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:40px;
}

/* inner split layout: panel + photo */
.room-inner{
  display:grid;
  grid-template-columns: minmax(260px, 460px) 1fr;
  gap:36px;
  align-items:center;
  width:100%;
  max-width:var(--max-content-width);
}

/* reverse layout for variety */
.room-inner.reverse{grid-template-columns:1fr minmax(260px, 460px)}

/* glass panel */
.room-panel{
  padding:28px;
  border-radius:var(--radius);
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border:1px solid var(--panel-strong);
  color:var(--muted);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: 0 20px 60px rgba(2,2,2,0.6);
}

/* content in panel */
.room-title{
  font-family:"Playfair Display", serif;
  margin:0 0 6px;
  color:#fff;
  font-size:28px;
}
.room-sub{margin:0 0 16px;color:rgba(255,240,220,0.75)}

.menu{list-style:none;padding:0;margin:0 0 18px;display:grid;gap:12px}
.menu li{display:flex;flex-direction:column}
.menu li strong{color:#fff;font-weight:600}
.menu li .desc{font-size:13px;color:rgba(255,240,220,0.62)}

/* order button */
.order{
  display:inline-block;padding:10px 16px;border-radius:10px;background:linear-gradient(90deg,var(--accent), #d99b68);color:#111;font-weight:700;text-decoration:none;
  transition:transform 220ms var(--ease);box-shadow:0 10px 30px rgba(226,176,122,0.14)
}
.order:hover{transform:translateY(-3px)}

/* room photo area (subtle imagery placeholder) */
.room-photo{
  height:60vh;
  border-radius:12px;
  background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  background-size:cover;
  box-shadow: inset 0 -60px 120px rgba(0,0,0,0.55);
  border:1px solid rgba(255,255,255,0.02);
  min-height:340px;
}

/* Assign individual photos via IDs (replace with your own images) */
#counter .room-photo{ background-image: url('images/counter.jpg'); background-position: center; background-size: cover; }
#breakfast .room-photo{ background-image: url('images/breakfast.jpg'); background-position: center; background-size: cover; }
#donuts .room-photo{ background-image: url('images/donuts.jpg'); background-position: center; background-size: cover; }
#slow .room-photo{ background-image: url('images/slow.jpg'); background-position: center; background-size: cover; }

/* Scarcity note style */
.scarcity{color:rgba(255,200,150,0.9);font-weight:600;margin:8px 0}

/* ---------- Animations & visibility ---------- */
.room-panel, .room-photo{
  transform: translateY(18px);
  opacity:0;
  transition: transform 650ms var(--ease), opacity 650ms var(--ease);
}
.room.is-visible .room-panel,
.room.is-visible .room-photo{
  transform: none;
  opacity:1;
}

/* Small screens: stack vertically and make sections standard vertical flow */
@media (max-width:900px){
  .entry-scene{min-height:560px;padding:28px 18px}
  .rooms{flex-direction:column;overflow-x:visible;scroll-snap-type:none;height:auto}
  .room{flex:0 0 auto;height:auto;padding:28px 18px}
  .room-inner{grid-template-columns:1fr;gap:18px}
  .room-inner.reverse{grid-template-columns:1fr}
  .room-photo{height:260px;min-height:0}
  .room-panel{padding:18px}
  .headline{text-align:center}
  .choices{gap:10px}
}

/* ---------- Fine tuning ---------- */
@media (min-width:1400px){
  .room-inner{gap:60px}
  .room-photo{height:70vh}
}
