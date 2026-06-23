// ============================================================
// PORTFOLIO — PHAM THI HANG — behaviour
// ============================================================

// Theme toggle (default dark)
const tb = document.getElementById('themeBtn');
tb.onclick = () => {
  const cur = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', cur === 'light' ? '' : 'light');
};

// Fade-in on scroll
const io = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4 * 0.08) + 's';
  io.observe(el);
});

// Mobile burger -> scroll to first section
document.getElementById('burger').onclick = () => {
  document.getElementById('about').scrollIntoView();
};

// EXPERIENCE — wheel picker:
// the section pins while you scroll through it; entries rotate through a
// vertical wheel. The selected one sits lit in the middle at full size,
// the previous shifts up + shrinks + fades, the next waits below.
// At the start/end you see 2 entries, in the middle 3 — automatically,
// since only neighbours within 1 step of the selection are visible.
const expSection = document.getElementById('experience');
const exps = [...document.querySelectorAll('#wheel .exp')];
const dotsBox = document.getElementById('wheelDots');
exps.forEach(() => {
  const d = document.createElement('div'); d.className = 'dot'; dotsBox.appendChild(d);
});
const dots = [...dotsBox.children];
const STEP = 165;     // px between wheel positions
const FADE = 0.6;     // opacity lost per step away from selection
const SHRINK = 0.14;  // scale lost per step away from selection
const EASE = 0.09;    // smoothing — lower = floatier, higher = snappier

// scroll picks a TARGET entry (snapped to whole steps); the wheel then
// glides toward it with easing, so a small scroll = one clean step
let wheelPos = 0;
function targetIndex() {
  const r = expSection.getBoundingClientRect();
  const scrollable = r.height - window.innerHeight;
  const p = Math.min(Math.max(-r.top / scrollable, 0), 1); // 0..1 through section
  return Math.round(p * (exps.length - 1));                 // snap to nearest entry
}
function renderWheel(pos) {
  exps.forEach((el, i) => {
    const d = i - pos, ad = Math.abs(d);
    const visible = ad < 1.5;
    el.style.visibility = visible ? 'visible' : 'hidden';
    el.style.opacity = visible ? String(Math.max(0, 1 - FADE * ad)) : '0';
    el.style.transform =
      `translateY(calc(-50% + ${(d * STEP).toFixed(1)}px)) scale(${(1 - SHRINK * Math.min(ad, 2)).toFixed(3)})`;
    el.style.zIndex = String(100 - Math.round(ad * 10));
    el.classList.toggle('lit', ad < 0.5);
  });
  const sel = Math.round(pos);
  dots.forEach((dt, i) => dt.classList.toggle('on', i === sel));
}
function tickWheel() {
  const t = targetIndex();
  wheelPos += (t - wheelPos) * EASE; // ease toward the target
  if (Math.abs(t - wheelPos) < 0.001) wheelPos = t;
  renderWheel(wheelPos);
  requestAnimationFrame(tickWheel);
}
requestAnimationFrame(tickWheel);

// EXPERIENCE — preview galleries + full-size lightbox
// Each .exp-preview[data-images] gets a sliding thumbnail strip (3 visible,
// arrows appear when there are more than 3). Clicking a thumb opens the
// shared lightbox, which can page through that entry's whole image set.
const THUMB = 180, GAP = 12, VISIBLE = 3;

// --- lightbox (shared) ---
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
const lbClose = document.getElementById('lbClose');
const lbCounter = document.getElementById('lbCounter');
const lbZoomIn = document.getElementById('lbZoomIn');
const lbZoomOut = document.getElementById('lbZoomOut');
const MIN_SIDE = 900;           // small images scale up to at least this on their long axis
const ZOOM_MIN = 1, ZOOM_MAX = 4, ZOOM_STEP = 0.5;
let lbSet = [], lbIndex = 0;
let zoom = 1, panX = 0, panY = 0;           // zoom + pan state
let dragging = false, downX = 0, downY = 0, moved = false;

function showLightbox(images, index) {
  lbSet = images; lbIndex = index;
  renderLightbox();
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
}
function renderLightbox() {
  resetZoom();
  lbImg.src = lbSet[lbIndex];
  if (lbImg.complete && lbImg.naturalWidth) fitLightbox();
  const multi = lbSet.length > 1;
  lbPrev.style.display = multi ? 'flex' : 'none';
  lbNext.style.display = multi ? 'flex' : 'none';
  lbCounter.style.display = multi ? 'block' : 'none';
  lbCounter.textContent = `${lbIndex + 1} / ${lbSet.length}`;
}
// give small images a sensible minimum size; viewport caps (max-w/h in CSS) still apply
function fitLightbox() {
  const nw = lbImg.naturalWidth, nh = lbImg.naturalHeight;
  if (!nw) return;
  lbImg.style.width = 'auto'; lbImg.style.height = 'auto';
  if (nw >= nh) lbImg.style.width = Math.max(MIN_SIDE, nw) + 'px';
  else lbImg.style.height = Math.max(MIN_SIDE, nh) + 'px';
}
lbImg.onload = fitLightbox;
function closeLightbox() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  resetZoom();
  lbImg.src = '';
}
function stepLightbox(dir) {
  lbIndex = (lbIndex + dir + lbSet.length) % lbSet.length;
  renderLightbox();
}

// --- zoom & pan ---
function applyTransform() {
  lbImg.style.transform = `translate(${panX}px,${panY}px) scale(${zoom})`;
  lbImg.style.cursor = zoom > 1 ? 'grab' : 'zoom-in';
}
function setZoom(z) {
  zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
  if (zoom === 1) { panX = 0; panY = 0; }
  applyTransform();
}
function resetZoom() { zoom = 1; panX = 0; panY = 0; applyTransform(); }

lbZoomIn.onclick = (e) => { e.stopPropagation(); setZoom(zoom + ZOOM_STEP); };
lbZoomOut.onclick = (e) => { e.stopPropagation(); setZoom(zoom - ZOOM_STEP); };
lbImg.addEventListener('wheel', (e) => {
  e.preventDefault();
  setZoom(zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
}, { passive: false });
// click image toggles zoom (unless it was a pan drag)
lbImg.addEventListener('click', (e) => {
  e.stopPropagation();
  if (moved) { moved = false; return; }
  if (zoom === 1) setZoom(2); else resetZoom();
});
// drag to pan while zoomed
lbImg.addEventListener('mousedown', (e) => {
  if (zoom <= 1) return;
  dragging = true; moved = false;
  downX = e.clientX - panX; downY = e.clientY - panY;
  lbImg.style.cursor = 'grabbing'; e.preventDefault();
});
window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  panX = e.clientX - downX; panY = e.clientY - downY; moved = true;
  applyTransform();
});
window.addEventListener('mouseup', () => {
  if (dragging) { dragging = false; lbImg.style.cursor = 'grab'; }
});

lbPrev.onclick = () => stepLightbox(-1);
lbNext.onclick = () => stepLightbox(1);
lbClose.onclick = closeLightbox;
lb.onclick = (e) => { if (e.target === lb) closeLightbox(); }; // click backdrop to close
document.addEventListener('keydown', (e) => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') stepLightbox(-1);
  else if (e.key === 'ArrowRight') stepLightbox(1);
  else if (e.key === '+' || e.key === '=') setZoom(zoom + ZOOM_STEP);
  else if (e.key === '-') setZoom(zoom - ZOOM_STEP);
});

// --- card covers that open the lightbox directly (e.g. blog) ---
document.querySelectorAll('.gallery-trigger[data-images]').forEach((el) => {
  const images = el.dataset.images.split(',').map(s => s.trim()).filter(Boolean);
  if (!images.length) return;
  el.style.cursor = 'pointer';
  el.onclick = () => showLightbox(images, 0);
});

// --- build each entry's thumbnail gallery ---
document.querySelectorAll('.exp-preview[data-images]').forEach((box) => {
  const images = box.dataset.images.split(',').map(s => s.trim()).filter(Boolean);
  if (!images.length) return;

  const viewport = document.createElement('div');
  viewport.className = 'pv-viewport';
  const track = document.createElement('div');
  track.className = 'pv-track';
  viewport.appendChild(track);

  images.forEach((src, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'pv';
    const img = document.createElement('img');
    img.src = src; img.alt = ''; img.loading = 'lazy';
    thumb.appendChild(img);
    thumb.onclick = () => showLightbox(images, i);
    track.appendChild(thumb);
  });

  const needArrows = images.length > VISIBLE;
  if (needArrows) {
    let page = 0;
    const maxPage = images.length - VISIBLE; // slide one thumb at a time
    const prev = document.createElement('button');
    prev.className = 'pv-arrow'; prev.textContent = '‹';
    const next = document.createElement('button');
    next.className = 'pv-arrow'; next.textContent = '›';
    const update = () => {
      track.style.transform = `translateX(-${page * (THUMB + GAP)}px)`;
      prev.disabled = page === 0;
      next.disabled = page === maxPage;
    };
    prev.onclick = () => { if (page > 0) { page--; update(); } };
    next.onclick = () => { if (page < maxPage) { page++; update(); } };
    box.append(prev, viewport, next);
    update();
  } else {
    // fewer than 3 — shrink the viewport so the popup hugs the images
    viewport.style.width = (images.length * THUMB + (images.length - 1) * GAP) + 'px';
    box.appendChild(viewport);
  }
});
