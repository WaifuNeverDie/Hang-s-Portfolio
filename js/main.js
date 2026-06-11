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
