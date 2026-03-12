// hangman-engine.js — Homeschool Connective
// window.HANGMAN = { title, mode ('easy'|'medium'|'hard'), wordBank: [{word, clue, image?}] }
(function () {
  'use strict';
  const cfg       = window.HANGMAN || {};
  const TITLE     = cfg.title    || 'Space Hangman';
  const MODE      = cfg.mode     || 'medium';
  const BANK      = cfg.wordBank || [];
  const MAX_WRONG = MODE === 'hard' ? 4 : 6;

  // 10 themes
  const THEMES = ['rocket','alien','astronaut','meteor','supernova','solar','asteroids','wormplanet','cracking','station'];
  let themeQueue = [], themeQueueIdx = 0, currentTheme = 'rocket';

  // Meteor planet target — picked each round
  const PLANET_TYPES = ['mars','moon','jupiter','neptune','alien'];
  let currentPlanet = 'mars';

  let usedWords = new Set();
  let entry = null, ANSWER = '';
  let guessed = new Set();
  let wrong = 0, won = false, lost = false;

  // ── Theme queue ──────────────────────────────────────────────
  function shuffleArr(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function initThemeQueue() {
    themeQueue = shuffleArr(THEMES);
    themeQueueIdx = 0;
    currentTheme = themeQueue[themeQueueIdx++];
  }
  function advanceTheme() {
    if (themeQueueIdx >= themeQueue.length) {
      themeQueue = shuffleArr(THEMES);
      themeQueueIdx = 0;
    }
    currentTheme = themeQueue[themeQueueIdx++];
  }

  // ── Word bank ────────────────────────────────────────────────
  function pickEntry() {
    if (!BANK.length) return { word: 'EARTH', clue: 'A beautiful blue planet!', image: '/earth.png' };
    let pool = BANK.filter(e => !usedWords.has(e.word));
    if (!pool.length) { usedWords.clear(); pool = [...BANK]; }
    const e = pool[Math.floor(Math.random() * pool.length)];
    usedWords.add(e.word);
    return e;
  }

  // ── SVG: Rocket ──────────────────────────────────────────────
  function rocketSVG(stage, maxWrong) {
    const pieces = ['flame','fins','lower','middle','upper','nose'];
    const n = pieces.length;
    function show(id) {
      return pieces.indexOf(id) < Math.round(n * (maxWrong - stage) / maxWrong);
    }
    return `<svg viewBox="0 0 120 200" width="120" height="200" xmlns="http://www.w3.org/2000/svg">
      ${show('flame')  ? `<ellipse cx="60" cy="188" rx="14" ry="18" fill="#f97316" opacity="0.9"/><ellipse cx="60" cy="182" rx="8" ry="12" fill="#fbbf24"/>` : ''}
      ${show('fins')   ? `<polygon points="38,170 50,140 50,170" fill="#3b82f6"/><polygon points="82,170 70,140 70,170" fill="#3b82f6"/>` : ''}
      ${show('lower')  ? `<rect x="48" y="140" width="24" height="30" rx="3" fill="#60a5fa"/>` : ''}
      ${show('middle') ? `<rect x="48" y="110" width="24" height="32" rx="3" fill="#3b82f6"/>` : ''}
      ${show('upper')  ? `<rect x="50" y="80" width="20" height="32" rx="3" fill="#2563eb"/><rect x="54" y="88" width="12" height="16" rx="3" fill="#bae6fd" opacity="0.8"/>` : ''}
      ${show('nose')   ? `<path d="M60 40 L72 80 L48 80 Z" fill="#1d4ed8"/>` : ''}
    </svg>`;
  }

  // ── SVG: Alien ───────────────────────────────────────────────
  function alienSVG(stage, maxWrong) {
    const totalTravel = 108;
    const beamHeight  = Math.round(stage * totalTravel / maxWrong);
    const astroY      = 175 - beamHeight;
    const absorbed    = stage >= maxWrong;
    const showBeam    = stage > 0 && !absorbed;
    const showAstro   = !absorbed;
    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="55" rx="48" ry="14" fill="#6366f1"/>
      <ellipse cx="80" cy="50" rx="30" ry="18" fill="#818cf8"/>
      <ellipse cx="80" cy="44" rx="16" ry="12" fill="#a5b4fc" opacity="0.9"/>
      <ellipse cx="80" cy="66" rx="48" ry="8"  fill="#4f46e5" opacity="0.6"/>
      <circle cx="60" cy="68" r="4" fill="#fbbf24"/>
      <circle cx="80" cy="70" r="4" fill="#34d399"/>
      <circle cx="100" cy="68" r="4" fill="#f472b6"/>
      ${showBeam ? `<polygon points="68,75 92,75 ${92+stage*4},${75+beamHeight} ${68-stage*4},${75+beamHeight}" fill="#fde68a" opacity="0.35"/>` : ''}
      ${showAstro ? `<g transform="translate(80,${astroY})">
        <circle cx="0" cy="-24" r="10" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="-8" y="-14" width="16" height="18" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="-8" y1="-10" x2="-18" y2="-4" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="8"  y1="-10" x2="18"  y2="-4" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="-4" y1="4"   x2="-5"  y2="18" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="4"  y1="4"   x2="5"   y2="18" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="-5" y="-26" width="10" height="7" rx="2" fill="#bae6fd" opacity="0.8"/>
      </g>` : ''}
    </svg>`;
  }

  // ── SVG: Astronaut ───────────────────────────────────────────
  function astronautSVG(stage, maxWrong) {
    const driftX = Math.round(stage * 48 / maxWrong);
    const driftY = -Math.round(stage * 24 / maxWrong);
    const tethersLeft = maxWrong - stage;
    return `<svg viewBox="0 0 160 210" width="160" height="210" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="82" width="36" height="52" rx="5" fill="#475569"/>
      <ellipse cx="22" cy="96" rx="9" ry="7" fill="#bae6fd" opacity="0.75"/>
      <rect x="-18" y="95"  width="20" height="9" rx="2" fill="#1e40af"/>
      <rect x="-18" y="111" width="20" height="9" rx="2" fill="#1e40af"/>
      <rect x="42"  y="95"  width="20" height="9" rx="2" fill="#1e40af"/>
      <rect x="42"  y="111" width="20" height="9" rx="2" fill="#1e40af"/>
      <rect x="9"  y="132" width="8" height="7" rx="2" fill="#334155"/>
      <rect x="27" y="132" width="8" height="7" rx="2" fill="#334155"/>
      <ellipse cx="13" cy="141" rx="4" ry="3" fill="#f97316" opacity="0.6"/>
      <ellipse cx="31" cy="141" rx="4" ry="3" fill="#f97316" opacity="0.6"/>
      ${Array.from({length: tethersLeft}, (_, i) =>
        `<line x1="40" y1="${95+i*8}" x2="${55+driftX}" y2="${100+driftY+i*4}" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,2"/>`
      ).join('')}
      <g id="astro-body" style="transform:translate(${55+driftX}px,${60+driftY}px)">
        <circle cx="20" cy="10" r="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <rect x="12" y="6"  width="16" height="12" rx="4" fill="#bae6fd" opacity="0.85"/>
        <rect x="8"  y="28" width="24" height="28" rx="6" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="13" y="32" width="14" height="8"  rx="2" fill="#94a3b8" opacity="0.5"/>
        <rect x="-4" y="28" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="34" y="28" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="10" y="55" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="22" y="55" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="8"  y="74" width="13" height="8"  rx="4" fill="#94a3b8"/>
        <rect x="20" y="74" width="13" height="8"  rx="4" fill="#94a3b8"/>
      </g>
    </svg>`;
  }

  // ── SVG: Meteor ──────────────────────────────────────────────
  function drawPlanetSVG(type, cx, cy) {
    if (type === 'mars') return `
      <circle cx="${cx}" cy="${cy}" r="34" fill="#c1440e"/>
      <circle cx="${cx-10}" cy="${cy+8}" r="12" fill="#a33a0c" opacity="0.6"/>
      <circle cx="${cx+12}" cy="${cy-10}" r="8"  fill="#a33a0c" opacity="0.5"/>
      <ellipse cx="${cx+5}" cy="${cy+14}" r="6" ry="4" fill="#8b3009" opacity="0.5" transform="rotate(-15 ${cx+5} ${cy+14})"/>
      <ellipse cx="${cx}" cy="${cy-30}" rx="10" ry="4" fill="#e8e8f0" opacity="0.7"/>`;
    if (type === 'moon') return `
      <circle cx="${cx}" cy="${cy}" r="35" fill="#9ca3af"/>
      <circle cx="${cx-12}" cy="${cy-12}" r="9"  fill="#6b7280" opacity="0.7"/>
      <circle cx="${cx-11}" cy="${cy-11}" r="7"  fill="#9ca3af"/>
      <circle cx="${cx+14}" cy="${cy+8}"  r="7"  fill="#6b7280" opacity="0.65"/>
      <circle cx="${cx+13}" cy="${cy+7}"  r="5.5" fill="#9ca3af"/>
      <circle cx="${cx-4}"  cy="${cy+16}" r="5"  fill="#6b7280" opacity="0.6"/>
      <circle cx="${cx-3}"  cy="${cy+15}" r="3.5" fill="#9ca3af"/>
      <circle cx="${cx+8}"  cy="${cy-18}" r="4"  fill="#6b7280" opacity="0.55"/>
      <circle cx="${cx+9}"  cy="${cy-17}" r="2.5" fill="#9ca3af"/>`;
    if (type === 'jupiter') return `
      <circle cx="${cx}" cy="${cy}" r="40" fill="#c4a05a"/>
      <ellipse cx="${cx}" cy="${cy-18}" rx="40" ry="6"  fill="#a0784a" opacity="0.8"/>
      <ellipse cx="${cx}" cy="${cy-8}"  rx="40" ry="5"  fill="#d4b56a" opacity="0.7"/>
      <ellipse cx="${cx}" cy="${cy+4}"  rx="40" ry="6"  fill="#a0784a" opacity="0.75"/>
      <ellipse cx="${cx}" cy="${cy+16}" rx="40" ry="5"  fill="#c4a05a" opacity="0.6"/>
      <ellipse cx="${cx-14}" cy="${cy+4}" rx="8" ry="5" fill="#b05c3a" opacity="0.85"/>`;
    if (type === 'neptune') return `
      <circle cx="${cx}" cy="${cy}" r="30" fill="#1d4ed8"/>
      <ellipse cx="${cx-5}" cy="${cy-8}"  rx="18" ry="6" fill="#2563eb" opacity="0.7" transform="rotate(-20 ${cx-5} ${cy-8})"/>
      <ellipse cx="${cx+8}" cy="${cy+10}" rx="14" ry="4" fill="#3b82f6" opacity="0.6" transform="rotate(15 ${cx+8} ${cy+10})"/>
      <circle cx="${cx-8}" cy="${cy-12}" r="5" fill="#60a5fa" opacity="0.5"/>`;
    // alien (purple)
    return `
      <circle cx="${cx}" cy="${cy}" r="33" fill="#6d28d9"/>
      <circle cx="${cx-8}"  cy="${cy+6}"  r="14" fill="#059669" opacity="0.45"/>
      <circle cx="${cx+10}" cy="${cy-8}"  r="10" fill="#059669" opacity="0.4"/>
      <circle cx="${cx+5}"  cy="${cy+14}" r="7"  fill="#059669" opacity="0.35"/>
      <circle cx="${cx-12}" cy="${cy-14}" r="8"  fill="#7c3aed" opacity="0.5"/>
      <ellipse cx="${cx+8}" cy="${cy-2}"  rx="5" ry="3" fill="#fbbf24" opacity="0.6"/>`;
  }

  function meteorSVG(stage, maxWrong) {
    const p     = stage / maxWrong;
    const isMax = stage >= maxWrong;
    // Planet — center of scene
    const px = 72, py = 115;
    // Meteor starts top-right, moves toward planet
    const mx = Math.round(148 - p * 76);  // 148 → 72
    const my = Math.round(18  + p * 97);  // 18  → 115
    const mr = Math.round(7   + p * 16);  // 7   → 23
    // Trail points back toward top-right
    const tl = Math.round(20 + p * 50);
    const tx = Math.min(157, mx + tl * 0.62);
    const ty = Math.max(5,   my - tl * 0.78);

    // Impact explosion at max wrong
    const impactSparks = [];
    if (isMax) {
      for (let i = 0; i < 10; i++) {
        const a  = (i / 10) * Math.PI * 2;
        const r1 = 18 + (i % 3) * 10;
        const r2 = r1 + 18;
        impactSparks.push(`<line x1="${(px+Math.cos(a)*r1).toFixed(1)}" y1="${(py+Math.sin(a)*r1).toFixed(1)}" x2="${(px+Math.cos(a)*r2).toFixed(1)}" y2="${(py+Math.sin(a)*r2).toFixed(1)}" stroke="#fbbf24" stroke-width="2.5" opacity="0.9" stroke-linecap="round"/>`);
      }
    }

    return `<svg viewBox="0 0 160 210" width="160" height="210" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20"  cy="30"  r="1.5" fill="white" opacity="0.7"/>
      <circle cx="130" cy="155" r="1"   fill="white" opacity="0.6"/>
      <circle cx="10"  cy="150" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="145" cy="185" r="1"   fill="white" opacity="0.6"/>
      ${drawPlanetSVG(currentPlanet, px, py)}
      ${!isMax ? `
        <line x1="${mx}" y1="${my}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="#f97316" stroke-width="${(mr*0.75).toFixed(1)}" stroke-linecap="round" opacity="0.4"/>
        <line x1="${mx}" y1="${my}" x2="${Math.min(157,tx+3).toFixed(1)}" y2="${Math.max(5,ty-3).toFixed(1)}" stroke="#fbbf24" stroke-width="${(mr*0.38).toFixed(1)}" stroke-linecap="round" opacity="0.65"/>
        <circle cx="${mx}" cy="${my}" r="${mr}" fill="#78716c"/>
        <circle cx="${(mx-mr*0.3).toFixed(1)}" cy="${(my-mr*0.3).toFixed(1)}" r="${(mr*0.45).toFixed(1)}" fill="#a8a29e" opacity="0.55"/>
        ${mr > 12 ? `<circle cx="${(mx+mr*0.25).toFixed(1)}" cy="${(my+mr*0.22).toFixed(1)}" r="${(mr*0.18).toFixed(1)}" fill="#57534e"/>` : ''}
      ` : `
        <circle cx="${px}" cy="${py}" r="42" fill="#f97316" opacity="0.55"/>
        <circle cx="${px}" cy="${py}" r="28" fill="#fbbf24" opacity="0.7"/>
        <circle cx="${px}" cy="${py}" r="14" fill="white"   opacity="0.9"/>
        ${impactSparks.join('')}
      `}
    </svg>`;
  }

  // ── SVG: Supernova ───────────────────────────────────────────
  function supernovaSVG(stage, maxWrong) {
    const p   = stage / maxWrong;
    const r   = Math.round(12 + p * 52);
    const cx  = 80, cy = 108;
    const pal = ['#fde68a','#fbbf24','#f97316','#ef4444','#ffffff'];
    const col = pal[Math.min(Math.floor(p * (pal.length - 0.01)), pal.length - 1)];
    const bgOp = (0.7 - p * 0.5).toFixed(2);
    const rays = [];
    if (stage > 0) {
      for (let i = 0; i < 8; i++) {
        const a  = (i / 8) * Math.PI * 2;
        const rl = 8 + p * 38;
        rays.push(`<line x1="${(cx+Math.cos(a)*(r+4)).toFixed(1)}" y1="${(cy+Math.sin(a)*(r+4)).toFixed(1)}" x2="${(cx+Math.cos(a)*(r+4+rl)).toFixed(1)}" y2="${(cy+Math.sin(a)*(r+4+rl)).toFixed(1)}" stroke="${col}" stroke-width="${(1+p*2.5).toFixed(1)}" opacity="${(0.5+p*0.5).toFixed(2)}"/>`);
      }
    }
    return `<svg viewBox="0 0 160 216" width="160" height="216" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20"  cy="20"  r="1.5" fill="white" opacity="${bgOp}"/>
      <circle cx="140" cy="35"  r="1"   fill="white" opacity="${bgOp}"/>
      <circle cx="30"  cy="188" r="1.5" fill="white" opacity="${bgOp}"/>
      <circle cx="148" cy="165" r="1"   fill="white" opacity="${bgOp}"/>
      <circle cx="${cx}" cy="${cy}" r="${r+28}" fill="${col}" opacity="${(p*0.08).toFixed(2)}"/>
      <circle cx="${cx}" cy="${cy}" r="${r+14}" fill="${col}" opacity="${(p*0.13).toFixed(2)}"/>
      ${rays.join('')}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>
      <circle cx="${cx}" cy="${cy}" r="${(r*0.55).toFixed(1)}" fill="white" opacity="${(0.25+p*0.55).toFixed(2)}"/>
    </svg>`;
  }

  // ── SVG: Dragon ──────────────────────────────────────────────
  function dragonSVG(stage, maxWrong) {
    const isMax = stage >= maxWrong;
    const smokeCol = isMax ? '#f97316' : '#94a3b8';
    const puffs = [];
    for (let i = 0; i < stage; i++) {
      const px = 118 + i * 9;
      const py = 80  - i * 7;
      const pr = 5   + i * 2.5;
      puffs.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${pr.toFixed(1)}" fill="${smokeCol}" opacity="${Math.max(0.12, 0.62 - i * 0.09).toFixed(2)}"/>`);
    }
    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20"  cy="25"  r="1.5" fill="white" opacity="0.7"/>
      <circle cx="140" cy="20"  r="1"   fill="white" opacity="0.6"/>
      <circle cx="15"  cy="120" r="1"   fill="white" opacity="0.5"/>
      <ellipse cx="80" cy="168" rx="54" ry="17" fill="#a8a29e"/>
      <ellipse cx="80" cy="166" rx="54" ry="16" fill="#d6d3d1"/>
      <circle cx="50"  cy="160" r="7" fill="#a8a29e"/>
      <circle cx="106" cy="162" r="5" fill="#a8a29e"/>
      <path d="M 40 160 Q 18 140 25 115 Q 32 95 22 75" stroke="#15803d" stroke-width="9" fill="none" stroke-linecap="round"/>
      <polygon points="22,75 12,65 27,70" fill="#166534"/>
      <path d="M 58 125 Q 25 95 42 68 Q 55 100 66 113 Z" fill="#166534" opacity="0.85"/>
      <path d="M 92 125 Q 125 95 108 68 Q 95 100 84 113 Z" fill="#166534" opacity="0.85"/>
      <ellipse cx="75" cy="132" rx="28" ry="22" fill="#16a34a"/>
      <ellipse cx="75" cy="136" rx="18" ry="13" fill="#4ade80" opacity="0.5"/>
      <path d="M 78 112 Q 88 97 95 82" stroke="#16a34a" stroke-width="14" fill="none" stroke-linecap="round"/>
      <ellipse cx="98"  cy="75" rx="14" ry="11" fill="#16a34a"/>
      <ellipse cx="113" cy="78" rx="9"  ry="6"  fill="#16a34a"/>
      <path d="M 104 82 Q 113 86 120 82" stroke="#166534" stroke-width="1.5" fill="none"/>
      <circle cx="96" cy="70" r="5"   fill="#fbbf24"/>
      <circle cx="97" cy="70" r="2.5" fill="#1c1c1c"/>
      <circle cx="98" cy="69" r="1"   fill="white"/>
      <circle cx="118" cy="76" r="2"  fill="#166534"/>
      <polygon points="97,66 93,52 101,61" fill="#15803d"/>
      <polygon points="107,69 113,61 112,71" fill="#166534" opacity="0.8"/>
      ${puffs.join('')}
      ${isMax ? `
        <path d="M 120 76 Q 146 63 158 53 Q 140 71 158 80 Q 140 76 120 82 Z" fill="#f97316" opacity="0.9"/>
        <path d="M 120 76 Q 142 66 152 59 Q 136 72 150 78 Q 134 74 120 80 Z" fill="#fbbf24" opacity="0.75"/>
      ` : ''}
    </svg>`;
  }

  // ── SVG: Ice ─────────────────────────────────────────────────
  function iceCrystalArms(ox, oy, dirDeg, size) {
    const arms = [];
    [-30, -15, 0, 15, 30].forEach(off => {
      const a   = (dirDeg + off) * Math.PI / 180;
      const len = size * 65;
      if (len < 3) return;
      const ex = (ox + Math.cos(a) * len).toFixed(1);
      const ey = (oy + Math.sin(a) * len).toFixed(1);
      arms.push(`<line x1="${ox}" y1="${oy}" x2="${ex}" y2="${ey}" stroke="#bae6fd" stroke-width="1.5" opacity="0.85"/>`);
      if (len > 20) {
        const mx = ox + Math.cos(a) * len * 0.55;
        const my = oy + Math.sin(a) * len * 0.55;
        const bl = len * 0.38;
        [a + 0.48, a - 0.48].forEach(ba => {
          arms.push(`<line x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${(mx+Math.cos(ba)*bl).toFixed(1)}" y2="${(my+Math.sin(ba)*bl).toFixed(1)}" stroke="#bae6fd" stroke-width="1" opacity="0.68"/>`);
        });
      }
    });
    return arms.join('');
  }

  function iceSVG(stage, maxWrong) {
    const p     = stage / maxWrong;
    const bgOp  = Math.max(0, 0.7 - p * 0.6).toFixed(2);
    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="130" cy="20"  r="1.5" fill="white" opacity="${bgOp}"/>
      <circle cx="20"  cy="40"  r="1"   fill="white" opacity="${bgOp}"/>
      <circle cx="140" cy="158" r="1.5" fill="white" opacity="${bgOp}"/>
      <circle cx="80" cy="108" r="44" fill="#3b82f6" opacity="${(0.82-p*0.32).toFixed(2)}"/>
      <circle cx="68" cy="97"  r="15" fill="#60a5fa" opacity="${(0.5-p*0.25).toFixed(2)}"/>
      <circle cx="80" cy="108" r="44" fill="#e0f2fe" opacity="${(p*0.78).toFixed(2)}"/>
      ${stage >= 2 ? `
        <path d="M48 85 L62 100 L54 116 L68 127" stroke="#7dd3fc" stroke-width="1.5" fill="none" opacity="${Math.min(1, p*1.4).toFixed(2)}"/>
        <path d="M93 83 L104 99 L97 116 L113 128" stroke="#7dd3fc" stroke-width="1.5" fill="none" opacity="${Math.min(1, p*1.4).toFixed(2)}"/>
      ` : ''}
      ${stage >= 1 ? iceCrystalArms(0,   0,    45,  p)        : ''}
      ${stage >= 2 ? iceCrystalArms(160, 0,   135,  p)        : ''}
      ${stage >= 3 ? iceCrystalArms(0,   200, -45,  p)        : ''}
      ${stage >= 4 ? iceCrystalArms(160, 200, -135, p)        : ''}
      ${stage >= 5 ? iceCrystalArms(80,  0,    90,  p * 0.82) : ''}
      ${stage >= 6 ? iceCrystalArms(0,   100,   0,  p * 0.82) : ''}
    </svg>`;
  }

  // ── SVG: Solar ───────────────────────────────────────────────
  // Spacecraft drifts toward the sun with each wrong guess
  function solarSVG(stage, maxWrong) {
    const p     = stage / maxWrong;
    const isMax = stage >= maxWrong;

    // Sun: large circle anchored at right edge, partially off-screen
    const sx = 178, sy = 108;
    const sunR = 58;

    // Spacecraft moves left→right toward sun surface
    const shipX = Math.round(22 + p * 106); // 22 → 128 (sun surface ≈ 120)
    const shipY = 108;

    // Corona rays on the visible (left) side of the sun
    const rays = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (Math.cos(a) > 0.2) continue; // only left-facing rays
      const r1 = sunR + 6;
      const r2 = sunR + 14 + p * 18;
      rays.push(`<line x1="${(sx+Math.cos(a)*r1).toFixed(1)}" y1="${(sy+Math.sin(a)*r1).toFixed(1)}" x2="${(sx+Math.cos(a)*r2).toFixed(1)}" y2="${(sy+Math.sin(a)*r2).toFixed(1)}" stroke="#fbbf24" stroke-width="${(1.5+p*1.5).toFixed(1)}" opacity="${(0.5+p*0.45).toFixed(2)}" stroke-linecap="round"/>`);
    }

    // Heat glow around spacecraft (appears as it gets close)
    const heatOp   = Math.max(0, p - 0.35) * 0.9;
    const heatR    = 12 + p * 14;
    const shipCol  = p > 0.6 ? '#f97316' : p > 0.35 ? '#fbbf24' : '#cbd5e1';
    const wingCol  = p > 0.6 ? '#ea580c' : p > 0.35 ? '#f59e0b' : '#94a3b8';
    const glowOp   = (0.08 + p * 0.18).toFixed(2);

    return `<svg viewBox="0 0 160 216" width="160" height="216" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18"  cy="22"  r="1.5" fill="white" opacity="${(0.7-p*0.5).toFixed(2)}"/>
      <circle cx="40"  cy="8"   r="1"   fill="white" opacity="${(0.6-p*0.5).toFixed(2)}"/>
      <circle cx="12"  cy="170" r="1.5" fill="white" opacity="${(0.5-p*0.4).toFixed(2)}"/>
      <circle cx="55"  cy="185" r="1"   fill="white" opacity="${(0.6-p*0.5).toFixed(2)}"/>
      <!-- Sun outer glow -->
      <circle cx="${sx}" cy="${sy}" r="${sunR+30+p*18}" fill="#fde68a" opacity="${glowOp}"/>
      <circle cx="${sx}" cy="${sy}" r="${sunR+14}"       fill="#fbbf24" opacity="${(0.12+p*0.1).toFixed(2)}"/>
      <!-- Corona rays -->
      ${rays.join('')}
      <!-- Sun body -->
      <circle cx="${sx}" cy="${sy}" r="${sunR}"   fill="#f97316"/>
      <circle cx="${sx}" cy="${sy}" r="${sunR-10}" fill="#fbbf24" opacity="0.65"/>
      <circle cx="${sx}" cy="${sy}" r="${sunR-22}" fill="#fde68a" opacity="0.5"/>
      <!-- Heat shimmer around ship -->
      ${heatOp > 0 ? `<circle cx="${shipX}" cy="${shipY}" r="${heatR.toFixed(1)}" fill="#f97316" opacity="${heatOp.toFixed(2)}"/>` : ''}
      <!-- Spacecraft (pointing right, horizontal) -->
      ${!isMax ? `
        <!-- Engine flame -->
        <path d="M${shipX-22},${shipY} L${shipX-30},${shipY-5} L${shipX-34},${shipY} L${shipX-30},${shipY+5} Z" fill="#60a5fa" opacity="0.85"/>
        <path d="M${shipX-22},${shipY} L${shipX-28},${shipY-3} L${shipX-31},${shipY} L${shipX-28},${shipY+3} Z" fill="white" opacity="0.7"/>
        <!-- Engine nozzle -->
        <rect x="${shipX-24}" y="${shipY-4}" width="6" height="8" rx="2" fill="#334155"/>
        <!-- Body -->
        <rect x="${shipX-18}" y="${shipY-6}" width="30" height="12" rx="4" fill="${shipCol}"/>
        <!-- Cockpit window -->
        <ellipse cx="${shipX+4}" cy="${shipY}" rx="5" ry="4" fill="#bae6fd" opacity="0.85"/>
        <!-- Nose cone -->
        <path d="M${shipX+12},${shipY-6} L${shipX+12},${shipY+6} L${shipX+22},${shipY} Z" fill="${wingCol}"/>
        <!-- Solar panels -->
        <rect x="${shipX-10}" y="${shipY-16}" width="18" height="8" rx="2" fill="#1e40af"/>
        <rect x="${shipX-10}" y="${shipY+8}"  width="18" height="8" rx="2" fill="#1e40af"/>
        <!-- Panel detail lines -->
        <line x1="${shipX-4}" y1="${shipY-16}" x2="${shipX-4}" y2="${shipY-8}" stroke="#3b82f6" stroke-width="1" opacity="0.6"/>
        <line x1="${shipX+4}" y1="${shipY-16}" x2="${shipX+4}" y2="${shipY-8}" stroke="#3b82f6" stroke-width="1" opacity="0.6"/>
        <line x1="${shipX-4}" y1="${shipY+8}"  x2="${shipX-4}" y2="${shipY+16}" stroke="#3b82f6" stroke-width="1" opacity="0.6"/>
        <line x1="${shipX+4}" y1="${shipY+8}"  x2="${shipX+4}" y2="${shipY+16}" stroke="#3b82f6" stroke-width="1" opacity="0.6"/>
      ` : `
        <!-- Impact explosion -->
        <circle cx="${shipX}" cy="${shipY}" r="22" fill="#f97316" opacity="0.8"/>
        <circle cx="${shipX}" cy="${shipY}" r="13" fill="#fbbf24" opacity="0.9"/>
        <circle cx="${shipX}" cy="${shipY}" r="6"  fill="white"   opacity="1"/>
        ${Array.from({length:8},(_,i)=>{const a=(i/8)*Math.PI*2;const r1=16,r2=28+i*2;return `<line x1="${(shipX+Math.cos(a)*r1).toFixed(1)}" y1="${(shipY+Math.sin(a)*r1).toFixed(1)}" x2="${(shipX+Math.cos(a)*r2).toFixed(1)}" y2="${(shipY+Math.sin(a)*r2).toFixed(1)}" stroke="#fbbf24" stroke-width="2.5" opacity="0.9" stroke-linecap="round"/>`;}).join('')}
      `}
    </svg>`;
  }

  // ── SVG: Asteroids ───────────────────────────────────────────
  // Two asteroids converge toward each other, explode on lose
  function asteroidsSVG(stage, maxWrong) {
    const p     = stage / maxWrong;
    const isMax = stage >= maxWrong;
    // Left rock: starts cx=18, moves right
    const lx = Math.round(18 + p * 54);
    const ly = 118;
    // Right rock: starts cx=142, moves left
    const rx = Math.round(142 - p * 54);
    const ry = 90;
    // Both converge to ~cx=80
    const sparks = [];
    if (isMax) {
      for (let i = 0; i < 12; i++) {
        const a  = (i / 12) * Math.PI * 2;
        const r1 = 14 + (i % 3) * 8;
        const r2 = r1 + 22 + (i % 2) * 10;
        const cx = 80, cy = 104;
        sparks.push(`<line x1="${(cx+Math.cos(a)*r1).toFixed(1)}" y1="${(cy+Math.sin(a)*r1).toFixed(1)}" x2="${(cx+Math.cos(a)*r2).toFixed(1)}" y2="${(cy+Math.sin(a)*r2).toFixed(1)}" stroke="${i%2?'#fbbf24':'#f97316'}" stroke-width="2.5" opacity="0.9" stroke-linecap="round"/>`);
      }
    }
    // Asteroid shape helper (irregular polygon around cx/cy with radius r)
    function rock(cx, cy, r, seed) {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + seed;
        const rr = r * (0.72 + (((seed * 13 + i * 7) % 100) / 100) * 0.44);
        pts.push(`${(cx+Math.cos(a)*rr).toFixed(1)},${(cy+Math.sin(a)*rr).toFixed(1)}`);
      }
      return pts.join(' ');
    }
    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25"  cy="22"  r="1.5" fill="white" opacity="0.7"/>
      <circle cx="138" cy="50"  r="1"   fill="white" opacity="0.6"/>
      <circle cx="10"  cy="160" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="148" cy="178" r="1"   fill="white" opacity="0.6"/>
      ${!isMax ? `
        <!-- Left asteroid -->
        <polygon points="${rock(lx,ly,20,0.3)}" fill="#78716c"/>
        <polygon points="${rock(lx-4,ly-4,8,1.1)}" fill="#a8a29e" opacity="0.55"/>
        <circle cx="${lx+6}" cy="${ly+6}" r="4" fill="#57534e"/>
        <!-- Right asteroid -->
        <polygon points="${rock(rx,ry,16,0.9)}" fill="#6b7280"/>
        <polygon points="${rock(rx+3,ry-3,6,1.8)}" fill="#9ca3af" opacity="0.5"/>
        <circle cx="${rx-5}" cy="${ry+5}" r="3" fill="#4b5563"/>
        ${p > 0 ? `
          <!-- Left trail -->
          <line x1="${lx-8}" y1="${ly+4}" x2="${Math.max(8,lx-22)}" y2="${ly+10}" stroke="#f97316" stroke-width="3" stroke-linecap="round" opacity="${(p*0.55).toFixed(2)}"/>
          <line x1="${lx-8}" y1="${ly+4}" x2="${Math.max(8,lx-22)}" y2="${ly+10}" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="${(p*0.7).toFixed(2)}"/>
          <!-- Right trail -->
          <line x1="${rx+8}" y1="${ry-4}" x2="${Math.min(152,rx+22)}" y2="${ry-10}" stroke="#f97316" stroke-width="3" stroke-linecap="round" opacity="${(p*0.55).toFixed(2)}"/>
          <line x1="${rx+8}" y1="${ry-4}" x2="${Math.min(152,rx+22)}" y2="${ry-10}" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="${(p*0.7).toFixed(2)}"/>
        ` : ''}
      ` : `
        <!-- Explosion -->
        <circle cx="80" cy="104" r="38" fill="#f97316" opacity="0.55"/>
        <circle cx="80" cy="104" r="24" fill="#fbbf24" opacity="0.75"/>
        <circle cx="80" cy="104" r="11" fill="white"   opacity="0.95"/>
        ${sparks.join('')}
        <!-- Debris chunks -->
        <polygon points="${rock(50,78,9,0.5)}" fill="#78716c" opacity="0.8"/>
        <polygon points="${rock(112,90,7,1.2)}" fill="#6b7280" opacity="0.8"/>
        <polygon points="${rock(62,130,6,0.1)}" fill="#78716c" opacity="0.7"/>
        <polygon points="${rock(100,125,5,1.7)}" fill="#6b7280" opacity="0.7"/>
      `}
    </svg>`;
  }

  // ── SVG: Wormhole planet ─────────────────────────────────────
  // A planet gets pulled into a wormhole and disappears on lose
  function wormplanetSVG(stage, maxWrong) {
    const p     = stage / maxWrong;
    const isMax = stage >= maxWrong;

    // Wormhole portal: left side, grows slightly
    const wx = 52, wy = 108;
    const wRx = Math.round(26 + p * 10);
    const wRy = Math.round(34 + p * 12);

    // Planet starts at right (cx=128, cy=72) and moves toward wormhole
    const startX = 128, startY = 72;
    const px  = Math.round(startX - p * (startX - wx));
    const py  = Math.round(startY - p * (startY - wy));
    const pr  = Math.round(26 - p * 10);   // shrinks as it approaches
    const pOp = isMax ? 0 : Math.max(0, 1 - p * 1.15);

    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14"  cy="20"  r="1.5" fill="white" opacity="${(0.7-p*0.5).toFixed(2)}"/>
      <circle cx="148" cy="38"  r="1"   fill="white" opacity="${(0.6-p*0.4).toFixed(2)}"/>
      <circle cx="18"  cy="175" r="1.5" fill="white" opacity="${(0.5-p*0.35).toFixed(2)}"/>
      <circle cx="140" cy="160" r="1"   fill="white" opacity="${(0.6-p*0.4).toFixed(2)}"/>
      <!-- Wormhole outer glow -->
      <ellipse cx="${wx}" cy="${wy}" rx="${wRx+18}" ry="${wRy+14}" fill="#7c3aed" opacity="${(0.12+p*0.14).toFixed(2)}"/>
      <ellipse cx="${wx}" cy="${wy}" rx="${wRx+10}" ry="${wRy+7}"  fill="#6d28d9" opacity="${(0.2+p*0.15).toFixed(2)}"/>
      <!-- Wormhole rings -->
      <ellipse cx="${wx}" cy="${wy}" rx="${wRx}"   ry="${wRy}"   fill="none" stroke="#a855f7" stroke-width="3.5" opacity="0.85"/>
      <ellipse cx="${wx}" cy="${wy}" rx="${wRx-7}"  ry="${wRy-5}"  fill="none" stroke="#7c3aed" stroke-width="2.5" opacity="0.7"/>
      <ellipse cx="${wx}" cy="${wy}" rx="${wRx-14}" ry="${wRy-10}" fill="none" stroke="#6d28d9" stroke-width="2" opacity="0.55"/>
      <!-- Dark void center -->
      <ellipse cx="${wx}" cy="${wy}" rx="${Math.max(4,wRx-18)}" ry="${Math.max(3,wRy-14)}" fill="#0d0018" opacity="0.95"/>
      <!-- Swirl streaks being pulled in (stage > 0) -->
      ${stage > 0 ? Array.from({length:6},(_,i)=>{
        const a = (i/6)*Math.PI*2 + p;
        const r1 = wRx+22, r2 = wRx+4;
        const op = (0.3+p*0.5).toFixed(2);
        return `<line x1="${(wx+Math.cos(a)*r1).toFixed(1)}" y1="${(wy+Math.sin(a)*r1*0.65).toFixed(1)}" x2="${(wx+Math.cos(a)*r2).toFixed(1)}" y2="${(wy+Math.sin(a)*r2*0.65).toFixed(1)}" stroke="#c084fc" stroke-width="1.5" opacity="${op}" stroke-linecap="round"/>`;
      }).join('') : ''}
      <!-- Planet (teal with green patches) — disappears on max -->
      ${!isMax && pr > 2 ? `
        <circle cx="${px}" cy="${py}" r="${pr}" fill="#0d9488" opacity="${pOp.toFixed(2)}"/>
        <circle cx="${px-6}" cy="${py+4}" r="${Math.max(2,pr*0.42)}" fill="#059669" opacity="${(pOp*0.55).toFixed(2)}"/>
        <circle cx="${px+5}" cy="${py-5}" r="${Math.max(2,pr*0.32)}" fill="#059669" opacity="${(pOp*0.5).toFixed(2)}"/>
        <circle cx="${px+4}" cy="${py+7}" r="${Math.max(1,pr*0.25)}" fill="#34d399" opacity="${(pOp*0.45).toFixed(2)}"/>
        ${p > 0.4 ? `<ellipse cx="${px}" cy="${py}" rx="${pr}" ry="${pr}" fill="#7c3aed" opacity="${Math.min(0.6,(p-0.4)*1.8).toFixed(2)}"/>` : ''}
      ` : ''}
    </svg>`;
  }

  // ── SVG: Cracking planet ─────────────────────────────────────
  // An alien planet cracks open, glowing from inside, shatters on lose
  function crackingSVG(stage, maxWrong) {
    const p     = stage / maxWrong;
    const isMax = stage >= maxWrong;
    const cx = 80, cy = 108, r = 44;

    // Inner glow intensifies with each crack
    const glowOp = (p * 0.75).toFixed(2);
    const glowR  = Math.round(r * 0.65 + p * r * 0.35);

    // Crack paths — revealed one per wrong guess
    const crackData = [
      `M${cx},${cy-r} L${cx+4},${cy-18} L${cx-3},${cy+2}`,
      `M${cx-r*0.86},${cy-r*0.5} L${cx-16},${cy-5} L${cx-3},${cy+2}`,
      `M${cx+r*0.86},${cy-r*0.5} L${cx+18},${cy+2} L${cx+3},${cy+18}`,
      `M${cx-r*0.5},${cy+r*0.86} L${cx-8},${cy+20} L${cx-3},${cy+2}`,
      `M${cx+r*0.5},${cy+r*0.86} L${cx+10},${cy+16} L${cx+3},${cy+18}`,
      `M${cx},${cy+r} L${cx-2},${cy+20} L${cx+3},${cy+18}`,
    ];

    const shards = [];
    if (isMax) {
      // Shard debris flying outward
      const shardAngles = [0, 60, 120, 180, 240, 300];
      shardAngles.forEach((deg, i) => {
        const a = deg * Math.PI / 180;
        const dx = Math.cos(a) * (r + 20 + i * 4);
        const dy = Math.sin(a) * (r + 20 + i * 4);
        const sw = 8 + (i % 3) * 5;
        const sh = 6 + (i % 2) * 7;
        shards.push(`<ellipse cx="${(cx+dx).toFixed(1)}" cy="${(cy+dy).toFixed(1)}" rx="${sw}" ry="${sh}" fill="#5b21b6" opacity="0.8" transform="rotate(${deg+20} ${(cx+dx).toFixed(1)} ${(cy+dy).toFixed(1)})"/>`);
      });
    }

    return `<svg viewBox="0 0 160 210" width="160" height="210" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22"  cy="20"  r="1.5" fill="white" opacity="${(0.7-p*0.4).toFixed(2)}"/>
      <circle cx="142" cy="38"  r="1"   fill="white" opacity="${(0.6-p*0.35).toFixed(2)}"/>
      <circle cx="14"  cy="172" r="1.5" fill="white" opacity="${(0.5-p*0.3).toFixed(2)}"/>
      ${!isMax ? `
        <!-- Inner glow -->
        <circle cx="${cx}" cy="${cy}" r="${glowR}" fill="#f97316" opacity="${glowOp}"/>
        <circle cx="${cx}" cy="${cy}" r="${Math.round(glowR*0.55)}" fill="#fbbf24" opacity="${Math.min(0.9,p*1.1).toFixed(2)}"/>
        <!-- Planet body -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#5b21b6"/>
        <circle cx="${cx-12}" cy="${cy+8}"  r="16" fill="#4c1d95" opacity="0.6"/>
        <circle cx="${cx+14}" cy="${cy-10}" r="11" fill="#4c1d95" opacity="0.5"/>
        <circle cx="${cx+6}"  cy="${cy+16}" r="8"  fill="#7c3aed" opacity="0.35"/>
        <!-- Cracks revealed one at a time -->
        ${crackData.slice(0, stage).map(d =>
          `<path d="${d}" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.9"/>
           <path d="${d}" stroke="#f97316" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.55"/>`
        ).join('')}
      ` : `
        <!-- Explosion at center -->
        <circle cx="${cx}" cy="${cy}" r="${r+18}" fill="#f97316" opacity="0.5"/>
        <circle cx="${cx}" cy="${cy}" r="${r+6}"  fill="#fbbf24" opacity="0.7"/>
        <circle cx="${cx}" cy="${cy}" r="18"      fill="white"   opacity="0.95"/>
        ${shards.join('')}
        ${Array.from({length:10},(_,i)=>{
          const a=(i/10)*Math.PI*2;
          const r1=22, r2=40+i*4;
          return `<line x1="${(cx+Math.cos(a)*r1).toFixed(1)}" y1="${(cy+Math.sin(a)*r1).toFixed(1)}" x2="${(cx+Math.cos(a)*r2).toFixed(1)}" y2="${(cy+Math.sin(a)*r2).toFixed(1)}" stroke="#fbbf24" stroke-width="2" opacity="0.85" stroke-linecap="round"/>`;
        }).join('')}
      `}
    </svg>`;
  }

  // ── SVG: Space station ───────────────────────────────────────
  // Station powers down section by section, breaks apart on lose
  function stationSVG(stage, maxWrong) {
    const p     = stage / maxWrong;
    const isMax = stage >= maxWrong;

    // How many panels are still powered (proportional)
    function powered(idx) { return idx >= Math.floor(stage * 4 / maxWrong); }

    const panelOn  = '#1d4ed8';
    const panelOff = '#1f2937';
    const lineOn   = '#3b82f6';
    const lineOff  = '#374151';

    // Panels: 0=right far, 1=right near, 2=left near, 3=left far
    const pColors = [powered(0)?panelOn:panelOff, powered(1)?panelOn:panelOff, powered(2)?panelOn:panelOff, powered(3)?panelOn:panelOff];
    const lColors = [powered(0)?lineOn:lineOff, powered(1)?lineOn:lineOff, powered(2)?lineOn:lineOff, powered(3)?lineOn:lineOff];

    // Core powered when stage < maxWrong - 1
    const coreOn   = stage < maxWrong - 1;
    const coreBody = coreOn ? '#475569' : '#1f2937';
    const coreDome = coreOn ? '#bae6fd' : '#374151';
    const coreGlow = coreOn ? `<circle cx="80" cy="110" r="28" fill="#3b82f6" opacity="${(0.15-p*0.12).toFixed(2)}"/>` : '';
    const engineGlow = coreOn ? `<ellipse cx="80" cy="138" rx="10" ry="6" fill="#60a5fa" opacity="${(0.5-p*0.4).toFixed(2)}"/>` : '';

    // Flicker: odd stages make lights slightly dim
    const flickerOp = (stage % 2 === 1 && !isMax) ? '0.55' : '1';

    if (isMax) {
      return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22"  cy="20"  r="1.5" fill="white" opacity="0.6"/>
        <circle cx="140" cy="42"  r="1"   fill="white" opacity="0.5"/>
        <circle cx="14"  cy="160" r="1.5" fill="white" opacity="0.45"/>
        <!-- Broken hub -->
        <rect x="62" y="96" width="36" height="28" rx="5" fill="#1f2937" opacity="0.85"/>
        <rect x="68" y="102" width="14" height="10" rx="3" fill="#111827"/>
        <!-- Broken truss pieces -->
        <rect x="22" y="108" width="38" height="7" rx="3" fill="#1f2937" opacity="0.7" transform="rotate(-12 22 108)"/>
        <rect x="100" y="110" width="38" height="7" rx="3" fill="#1f2937" opacity="0.7" transform="rotate(8 100 110)"/>
        <!-- Dark solar panels drifting -->
        <rect x="8"   y="88"  width="20" height="28" rx="2" fill="${panelOff}" opacity="0.7" transform="rotate(-25 8 88)"/>
        <rect x="132" y="94"  width="20" height="28" rx="2" fill="${panelOff}" opacity="0.7" transform="rotate(18 132 94)"/>
        <!-- Debris sparks -->
        ${Array.from({length:8},(_,i)=>{
          const a=(i/8)*Math.PI*2;
          const r1=16,r2=26+i*3;
          return `<line x1="${(80+Math.cos(a)*r1).toFixed(1)}" y1="${(110+Math.sin(a)*r1).toFixed(1)}" x2="${(80+Math.cos(a)*r2).toFixed(1)}" y2="${(110+Math.sin(a)*r2).toFixed(1)}" stroke="${i%2?'#fbbf24':'#f87171'}" stroke-width="2" opacity="0.8" stroke-linecap="round"/>`;
        }).join('')}
      </svg>`;
    }

    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22"  cy="20"  r="1.5" fill="white" opacity="${(0.7-p*0.4).toFixed(2)}"/>
      <circle cx="140" cy="42"  r="1"   fill="white" opacity="${(0.6-p*0.35).toFixed(2)}"/>
      <circle cx="14"  cy="160" r="1.5" fill="white" opacity="${(0.5-p*0.3).toFixed(2)}"/>
      <!-- Core glow -->
      ${coreGlow}
      <!-- Horizontal truss -->
      <rect x="20" y="108" width="120" height="7" rx="3" fill="#334155"/>
      <!-- Left far solar panel (idx 3) -->
      <rect x="8"  y="90"  width="20" height="26" rx="2" fill="${pColors[3]}" opacity="${flickerOp}"/>
      <line x1="18" y1="90" x2="18" y2="116" stroke="${lColors[3]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="8"  y1="100" x2="28" y2="100" stroke="${lColors[3]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="8"  y1="108" x2="28" y2="108" stroke="${lColors[3]}" stroke-width="1" opacity="${flickerOp}"/>
      <!-- Left near solar panel (idx 2) -->
      <rect x="34" y="91"  width="20" height="24" rx="2" fill="${pColors[2]}" opacity="${flickerOp}"/>
      <line x1="44" y1="91" x2="44" y2="115" stroke="${lColors[2]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="34" y1="101" x2="54" y2="101" stroke="${lColors[2]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="34" y1="107" x2="54" y2="107" stroke="${lColors[2]}" stroke-width="1" opacity="${flickerOp}"/>
      <!-- Right near solar panel (idx 1) -->
      <rect x="106" y="91" width="20" height="24" rx="2" fill="${pColors[1]}" opacity="${flickerOp}"/>
      <line x1="116" y1="91" x2="116" y2="115" stroke="${lColors[1]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="106" y1="101" x2="126" y2="101" stroke="${lColors[1]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="106" y1="107" x2="126" y2="107" stroke="${lColors[1]}" stroke-width="1" opacity="${flickerOp}"/>
      <!-- Right far solar panel (idx 0) -->
      <rect x="132" y="90" width="20" height="26" rx="2" fill="${pColors[0]}" opacity="${flickerOp}"/>
      <line x1="142" y1="90" x2="142" y2="116" stroke="${lColors[0]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="132" y1="100" x2="152" y2="100" stroke="${lColors[0]}" stroke-width="1" opacity="${flickerOp}"/>
      <line x1="132" y1="108" x2="152" y2="108" stroke="${lColors[0]}" stroke-width="1" opacity="${flickerOp}"/>
      <!-- Central hub -->
      <rect x="62" y="96" width="36" height="28" rx="5" fill="${coreBody}"/>
      <rect x="70" y="100" width="14" height="10" rx="3" fill="${coreDome}" opacity="${flickerOp}"/>
      <!-- Engine / docking port -->
      ${engineGlow}
      <rect x="72" y="124" width="16" height="10" rx="3" fill="#334155"/>
      <ellipse cx="80" cy="134" rx="6" ry="3" fill="${coreOn ? '#60a5fa' : '#1f2937'}" opacity="${flickerOp}"/>
      <!-- Windows (tiny lights) -->
      <circle cx="72" cy="103" r="2.5" fill="${coreOn ? '#fbbf24' : '#374151'}" opacity="${flickerOp}"/>
      <circle cx="88" cy="103" r="2.5" fill="${coreOn ? '#fbbf24' : '#374151'}" opacity="${flickerOp}"/>
      <circle cx="80" cy="119" r="2"   fill="${coreOn ? '#34d399' : '#374151'}" opacity="${flickerOp}"/>
    </svg>`;
  }

  function getThemeSVG() {
    if (currentTheme === 'rocket')     return rocketSVG(wrong, MAX_WRONG);
    if (currentTheme === 'alien')      return alienSVG(wrong, MAX_WRONG);
    if (currentTheme === 'astronaut')  return astronautSVG(wrong, MAX_WRONG);
    if (currentTheme === 'meteor')     return meteorSVG(wrong, MAX_WRONG);
    if (currentTheme === 'supernova')  return supernovaSVG(wrong, MAX_WRONG);
    if (currentTheme === 'solar')      return solarSVG(wrong, MAX_WRONG);
    if (currentTheme === 'asteroids')  return asteroidsSVG(wrong, MAX_WRONG);
    if (currentTheme === 'wormplanet') return wormplanetSVG(wrong, MAX_WRONG);
    if (currentTheme === 'cracking')   return crackingSVG(wrong, MAX_WRONG);
    if (currentTheme === 'station')    return stationSVG(wrong, MAX_WRONG);
    return rocketSVG(wrong, MAX_WRONG);
  }

  // ── Easy mode image reveal ───────────────────────────────────
  function buildRevealScene() {
    const N    = ANSWER.length;
    const cols = Math.ceil(Math.sqrt(N));
    const rows = Math.ceil(N / cols);

    const wrap = document.createElement('div');
    wrap.id = 'reveal-wrap';
    wrap.style.cssText = 'position:relative;width:220px;height:220px;margin:0 auto;';

    const img = document.createElement('img');
    img.src = entry.image || '';
    img.alt = '';
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;user-select:none;-webkit-user-drag:none;';
    wrap.appendChild(img);

    const grid = document.createElement('div');
    grid.id = 'tile-grid';
    grid.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;gap:2px;';

    let tileIdx = 0;
    for (let r = 0; r < rows; r++) {
      const rowEl = document.createElement('div');
      rowEl.style.cssText = 'display:flex;flex:1;gap:2px;';
      const tilesInRow = r < rows - 1 ? cols : N - (rows - 1) * cols;
      for (let c = 0; c < tilesInRow; c++) {
        const tile = document.createElement('div');
        tile.id = 'tile-' + tileIdx;
        tile.style.cssText = 'flex:1;background:rgba(0,5,20,0.85);transition:opacity 0.5s ease;border:1px solid rgba(85,182,202,0.2);border-radius:2px;';
        rowEl.appendChild(tile);
        tileIdx++;
      }
      grid.appendChild(rowEl);
    }
    wrap.appendChild(grid);
    return wrap;
  }

  function revealTilesForLetter(letter) {
    for (let i = 0; i < ANSWER.length; i++) {
      if (ANSWER[i] === letter) {
        const tile = document.getElementById('tile-' + i);
        if (tile) { tile.style.opacity = '0'; tile.style.pointerEvents = 'none'; }
      }
    }
  }

  function revealAllTiles() {
    for (let i = 0; i < ANSWER.length; i++) {
      const tile = document.getElementById('tile-' + i);
      if (tile) { tile.style.opacity = '0'; tile.style.pointerEvents = 'none'; }
    }
  }

  // ── DOM updates ──────────────────────────────────────────────
  function updateScene() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    if (MODE === 'easy') {
      scene.innerHTML = '';
      scene.appendChild(buildRevealScene());
    } else {
      scene.innerHTML = getThemeSVG();
    }
  }

  function updateBlanks() {
    const row = document.getElementById('blanks-row');
    if (!row) return;
    row.innerHTML = '';
    // Group letters by word so each word wraps as a single unit (no mid-word line breaks)
    const words = ANSWER.split(' ');
    words.forEach((word, wi) => {
      if (wi > 0) {
        const sp = document.createElement('div');
        sp.className = 'blank-space';
        row.appendChild(sp);
      }
      const group = document.createElement('div');
      group.className = 'blank-word';
      word.split('').forEach(ch => {
        const div = document.createElement('div');
        div.className = 'blank';
        const letter = document.createElement('div');
        letter.className = 'blank-letter';
        letter.textContent = guessed.has(ch) ? ch : '';
        const line = document.createElement('div');
        line.className = 'blank-line';
        div.appendChild(letter);
        div.appendChild(line);
        group.appendChild(div);
      });
      row.appendChild(group);
    });
  }

  function updateKeyboard() {
    const kb = document.getElementById('keyboard');
    if (!kb) return;
    kb.innerHTML = '';
    ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.style.cssText = 'display:flex;justify-content:center;gap:6px;width:100%;';
      row.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'key';
        btn.textContent = letter;
        if (guessed.has(letter)) {
          btn.classList.add(ANSWER.includes(letter) ? 'correct' : 'wrong');
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => guess(letter));
        }
        rowEl.appendChild(btn);
      });
      kb.appendChild(rowEl);
    });
  }

  function updateWrongDisplay() {
    const wrongLetters = [...guessed].filter(l => !ANSWER.includes(l));
    const wl = document.getElementById('wrong-letters');
    if (wl) wl.textContent = wrongLetters.length ? 'Wrong: ' + wrongLetters.join(', ') : '';
    const wc = document.getElementById('wrong-count');
    if (wc) wc.textContent = MODE !== 'easy' ? `Wrong guesses: ${wrong} / ${MAX_WRONG}` : '';
  }

  // ── Game logic ───────────────────────────────────────────────
  function checkWin() {
    return [...ANSWER].filter(c => c !== ' ').every(c => guessed.has(c));
  }

  function guess(letter) {
    if (guessed.has(letter) || won || lost) return;
    guessed.add(letter);
    const isCorrect = ANSWER.includes(letter);
    if (isCorrect) {
      playCorrect();
      if (MODE === 'easy') revealTilesForLetter(letter);
    } else {
      playWrong();
      wrong++;
    }
    if (MODE !== 'easy') updateScene();
    updateBlanks();
    updateKeyboard();
    updateWrongDisplay();
    if (checkWin()) {
      won = true;
      setTimeout(handleWin, 300);
    } else if (MODE !== 'easy' && wrong >= MAX_WRONG) {
      lost = true;
      setTimeout(handleLose, 300);
    }
  }

  function handleWin() {
    playWin();
    launchConfetti();
    if (MODE === 'easy') revealAllTiles();
    document.getElementById('status-msg').textContent = '';
    const btn = document.getElementById('resetBtn');
    btn.textContent = 'Play Another';
    btn.onclick = window.resetGame;
    btn.classList.add('show');
    document.querySelectorAll('.key:not(:disabled)').forEach(b => b.disabled = true);
  }

  function handleLose() {
    playLose();
    document.getElementById('status-msg').textContent = '';
    const btn = document.getElementById('resetBtn');
    btn.textContent = 'Try Again';
    btn.onclick = window.tryAgain;
    btn.classList.add('show');
    document.querySelectorAll('.key:not(:disabled)').forEach(b => b.disabled = true);
    // Disable pointer events on scene so scaled/faded animations don't block clicks
    const sceneEl = document.getElementById('scene');
    if (sceneEl) sceneEl.style.pointerEvents = 'none';
    const delay = 350;
    if (currentTheme === 'alien')      setTimeout(animateAlienEscape,        delay);
    if (currentTheme === 'astronaut')  setTimeout(animateAstronautFloat,     delay);
    if (currentTheme === 'meteor')     setTimeout(animateMeteorImpact,       delay);
    if (currentTheme === 'supernova')  setTimeout(animateSupernovaExplosion, delay);
    if (currentTheme === 'solar')      setTimeout(animateSolarImpact,        delay);
    if (currentTheme === 'asteroids')  setTimeout(animateAsteroidCollision,  delay);
    if (currentTheme === 'wormplanet') setTimeout(animateWormplanetSuck,     delay);
    if (currentTheme === 'cracking')   setTimeout(animatePlanetShatter,      delay);
    if (currentTheme === 'station')    setTimeout(animateStationBreakup,     delay);
  }

  // ── Lose animations ──────────────────────────────────────────
  function animateAlienEscape() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(60px,-350px) scale(0.3)', opacity: 0 }
    ], { duration: 1000, easing: 'ease-in', fill: 'forwards' });
  }

  function animateAstronautFloat() {
    const astro = document.getElementById('astro-body');
    if (!astro) return;
    const sx = 55 + 48, sy = 60 - 24;
    astro.animate([
      { transform: `translate(${sx}px,${sy}px) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${sx+220}px,${sy-160}px) rotate(720deg)`, opacity: 0 }
    ], { duration: 1800, easing: 'ease-in', fill: 'forwards' });
  }

  function animateMeteorImpact() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    // Shockwave flash then expand and fade
    scene.animate([
      { transform: 'scale(1)',   filter: 'brightness(1)',  opacity: 1 },
      { transform: 'scale(1.15)', filter: 'brightness(7)', opacity: 1,   offset: 0.18 },
      { transform: 'scale(2.2)', filter: 'brightness(1)',  opacity: 0 }
    ], { duration: 1100, easing: 'ease-out', fill: 'forwards' });
  }

  function animateSupernovaExplosion() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { transform: 'scale(1)',   filter: 'brightness(1)', opacity: 1 },
      { transform: 'scale(1.4)', filter: 'brightness(8)', opacity: 1,   offset: 0.25 },
      { transform: 'scale(3.5)', filter: 'brightness(1)', opacity: 0 }
    ], { duration: 1200, easing: 'ease-out', fill: 'forwards' });
  }

  function animateDragonFire() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { filter: 'hue-rotate(0deg) brightness(1)',    opacity: 1 },
      { filter: 'hue-rotate(25deg) brightness(2.5)', opacity: 1, offset: 0.3 },
      { filter: 'hue-rotate(25deg) brightness(0.4)', opacity: 0 }
    ], { duration: 1100, easing: 'ease-in', fill: 'forwards' });
  }

  function animateSolarImpact() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { filter: 'brightness(1)',   opacity: 1, transform: 'scale(1)' },
      { filter: 'brightness(8)',   opacity: 1, transform: 'scale(1.08)', offset: 0.15 },
      { filter: 'brightness(2)',   opacity: 1, transform: 'scale(1.2)',  offset: 0.4 },
      { filter: 'brightness(0.5)', opacity: 0, transform: 'scale(1.5)' }
    ], { duration: 1200, easing: 'ease-out', fill: 'forwards' });
  }

  function animateIceShatter() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { filter: 'brightness(1) saturate(1)',   opacity: 1, transform: 'scale(1)' },
      { filter: 'brightness(4) saturate(0.1)', opacity: 1, transform: 'scale(1.05)', offset: 0.15 },
      { filter: 'brightness(2) saturate(0)',   opacity: 0, transform: 'scale(1.12)' }
    ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
  }

  function animateAsteroidCollision() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { transform: 'scale(1)',    filter: 'brightness(1)',  opacity: 1 },
      { transform: 'scale(1.2)', filter: 'brightness(9)',  opacity: 1,   offset: 0.2 },
      { transform: 'scale(2.5)', filter: 'brightness(1)',  opacity: 0 }
    ], { duration: 1000, easing: 'ease-out', fill: 'forwards' });
  }

  function animateWormplanetSuck() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { transform: 'scale(1) rotate(0deg)',    opacity: 1 },
      { transform: 'scale(0.85) rotate(15deg)', opacity: 0.9, offset: 0.35 },
      { transform: 'scale(0.5) rotate(35deg)',  opacity: 0.5, offset: 0.65 },
      { transform: 'scale(0.15) rotate(60deg)', opacity: 0 }
    ], { duration: 1100, easing: 'ease-in', fill: 'forwards' });
  }

  function animatePlanetShatter() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { transform: 'scale(1)',    filter: 'brightness(1)',  opacity: 1 },
      { transform: 'scale(1.12)', filter: 'brightness(6)',  opacity: 1,   offset: 0.2 },
      { transform: 'scale(2.2)', filter: 'brightness(0.8)', opacity: 0 }
    ], { duration: 900, easing: 'ease-out', fill: 'forwards' });
  }

  function animateStationBreakup() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { filter: 'brightness(1) saturate(1)',   opacity: 1, transform: 'scale(1)' },
      { filter: 'brightness(3) saturate(0.4)', opacity: 1, transform: 'scale(1.06)', offset: 0.15 },
      { filter: 'brightness(0.6) saturate(0)', opacity: 0.6, transform: 'scale(1.1) rotate(4deg)', offset: 0.5 },
      { filter: 'brightness(0.2) saturate(0)', opacity: 0, transform: 'scale(1.2) rotate(8deg)' }
    ], { duration: 1200, easing: 'ease-in', fill: 'forwards' });
  }

  // ── Round management ─────────────────────────────────────────
  function startRound(e) {
    entry  = e;
    ANSWER = e.word.toUpperCase();
    guessed = new Set();
    wrong   = 0;
    won     = false;
    lost    = false;

    // Pick a random planet for the meteor theme (not Earth)
    if (currentTheme === 'meteor') {
      currentPlanet = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)];
    }

    const clueEl = document.getElementById('clue');
    if (clueEl) clueEl.textContent = e.clue;
    const statusEl = document.getElementById('status-msg');
    if (statusEl) statusEl.textContent = '';
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.classList.remove('show');
      resetBtn.getAnimations().forEach(a => a.cancel());
    }

    // Cancel and fully reset any in-progress lose animations
    const scene = document.getElementById('scene');
    if (scene) {
      scene.getAnimations().forEach(a => a.cancel());
      scene.style.opacity       = '';
      scene.style.transform     = '';
      scene.style.filter        = '';
      scene.style.pointerEvents = '';
    }
    const astroBody = document.getElementById('astro-body');
    if (astroBody) astroBody.getAnimations().forEach(a => a.cancel());

    updateScene();
    updateBlanks();
    updateKeyboard();
    updateWrongDisplay();
  }

  window.resetGame = function () {
    if (MODE !== 'easy') advanceTheme();
    startRound(pickEntry());
  };

  window.tryAgain = function () {
    if (MODE !== 'easy') advanceTheme();
    startRound(entry);
  };

  // ── Confetti ─────────────────────────────────────────────────
  function launchConfetti() {
    const colors = ['#ed7c5a','#55b6ca','#fbbf24','#34d399','#f472b6','#a78bfa'];
    const container = document.getElementById('confetti-container');
    if (!container) return;
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>.5?'50%':'2px'};left:${Math.random()*100}%;top:-10px;pointer-events:none;`;
      container.appendChild(el);
      const dur = 1.5 + Math.random() * 2;
      el.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight+50}px) rotate(${360+Math.random()*720}deg)`, opacity: 0 }
      ], { duration: dur * 1000, easing: 'ease-in', fill: 'forwards' }).onfinish = () => el.remove();
    }
  }

  // ── Audio ────────────────────────────────────────────────────
  let audioCtx = null, musicSrc = null, musicGain = null, musicOn = false;
  function getCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
  function playTone(freq, type, dur, vol) { try { const ctx = getCtx(), osc = ctx.createOscillator(), g = ctx.createGain(); osc.connect(g); g.connect(ctx.destination); osc.type = type; osc.frequency.value = freq; g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur); osc.start(); osc.stop(ctx.currentTime + dur); } catch(e) {} }
  function playCorrect() { playTone(660,'sine',0.18,0.4); setTimeout(() => playTone(880,'sine',0.18,0.3), 120); }
  function playWrong()   { playTone(350,'triangle',0.18,0.28); setTimeout(() => playTone(260,'triangle',0.22,0.22), 130); }
  function playWin()     { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f,'sine',0.4,0.35), i*120)); }
  function playLose()    { [300,250,200,150].forEach((f,i) => setTimeout(() => playTone(f,'sawtooth',0.3,0.3), i*120)); }
  async function startMusic() { try { const ctx = getCtx(); if (ctx.state === 'suspended') await ctx.resume(); if (musicSrc) { musicSrc.stop(); musicSrc = null; } const res = await fetch('/puzzle-bg-music.mp3'), buf = await ctx.decodeAudioData(await res.arrayBuffer()); musicSrc = ctx.createBufferSource(); musicGain = ctx.createGain(); musicSrc.buffer = buf; musicSrc.loop = true; musicGain.gain.value = 0.18; musicSrc.connect(musicGain); musicGain.connect(ctx.destination); musicSrc.start(); } catch(e) {} }
  function stopMusic() { try { if (musicSrc) { musicSrc.stop(); musicSrc = null; } } catch(e) {} }

  // ── Build DOM ────────────────────────────────────────────────
  function buildDOM() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap';
    document.head.appendChild(link);

    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width,initial-scale=1.0,maximum-scale=1.0';
    document.head.appendChild(meta);

    const style = document.createElement('style');
    style.textContent = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html,body{height:100%;-webkit-text-size-adjust:100%;}
      body{background:url('/space-bg.png') center/cover no-repeat fixed;font-family:'Nunito',sans-serif;color:white;display:flex;flex-direction:column;align-items:center;}
      #header{width:100%;display:flex;flex-direction:row;align-items:center;padding:14px 16px 6px;gap:10px;flex-shrink:0;}
      #backBtn{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,0.75);font-size:0.85rem;font-weight:700;text-decoration:none;white-space:nowrap;flex-shrink:0;transition:color 0.15s;}
      #backBtn:hover{color:white;}
      .title-row{display:flex;align-items:center;gap:10px;flex:1;justify-content:center;}
      h1{font-size:clamp(0.9rem,2.5vw,1.2rem);font-weight:800;color:#FFD700;text-align:center;margin:0;text-shadow:0 0 24px rgba(255,215,0,0.35);}
      #musicBtn{background:#ed7c5a;border:none;border-radius:50%;width:32px;height:32px;min-width:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;flex-shrink:0;}
      #musicBtn:hover{background:#d4623f;}
      #musicBtn svg{width:16px;height:16px;fill:white;}
      #musicBtn.playing{background:#FFD700;animation:noteBounce 0.7s ease-in-out infinite;}
      #musicBtn.playing svg{fill:#1c1c1c;}
      #musicBtn.playing:hover{background:#e6c200;}
      @keyframes noteBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
      @media (orientation:portrait) and (max-width:768px){#header{flex-wrap:wrap;padding:10px 12px 4px;gap:6px;}#backBtn{flex:0 0 auto;}.title-row{flex:1;justify-content:flex-end;}h1{font-size:clamp(0.95rem,4vw,1.3rem);}}
      #main{flex:1;display:flex;flex-direction:column;align-items:center;padding:20px 16px 30px;gap:16px;width:100%;}
      #clue{font-size:clamp(0.85rem,2.5vw,1rem);color:rgba(255,255,255,0.75);font-weight:700;text-align:center;max-width:500px;}
      #content-cols{display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;}
      #left-col{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;}
      #right-col{display:flex;justify-content:center;align-items:center;order:-1;}
      #scene-wrap{position:relative;display:flex;justify-content:center;align-items:center;min-height:230px;}
      #blanks-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;width:100%;}
      .blank-word{display:inline-flex;flex-wrap:nowrap;gap:6px;}
      .blank{display:inline-flex;flex-direction:column;align-items:center;gap:3px;}
      .blank-letter{font-size:clamp(1.3rem,5vw,2rem);font-weight:900;min-width:28px;text-align:center;height:1.2em;color:#f1f5f9;}
      .blank-line{width:28px;height:3px;background:#55b6ca;border-radius:2px;}
      .blank-space{width:14px;}
      #wrong-letters{font-size:0.85rem;color:#f87171;font-weight:700;text-align:center;min-height:1.2em;}
      .wrong-count{font-size:0.8rem;color:#f87171;font-weight:700;text-align:center;min-height:1.2em;}
      #keyboard{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:420px;}
      .key{width:clamp(32px,8vw,42px);height:clamp(32px,8vw,42px);border-radius:8px;border:none;font-family:inherit;font-size:clamp(0.75rem,2.5vw,0.9rem);font-weight:800;cursor:pointer;transition:all 0.15s;background:#1e3a5f;color:#f1f5f9;}
      .key:hover:not(:disabled){background:#2563eb;transform:scale(1.05);}
      .key.correct{background:#059669;color:#fff;cursor:default;}
      .key.wrong{background:#374151;color:#6b7280;cursor:default;}
      #status-msg{font-size:clamp(1rem,3.5vw,1.3rem);font-weight:900;text-align:center;min-height:1.5em;}
      #resetBtn{display:inline-flex;background:#ed7c5a;border:none;border-radius:999px;padding:12px 32px;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;color:white;cursor:pointer;transition:background 0.15s,transform 0.15s;letter-spacing:0.02em;opacity:0;pointer-events:none;}
      #resetBtn.show{opacity:1;pointer-events:auto;animation:popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;}
      #resetBtn:hover{background:#d4623f;transform:scale(1.04);}
      @keyframes popIn{0%{opacity:0;transform:scale(0.7)}100%{opacity:1;transform:scale(1)}}
      #confetti-container{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;}
      @media (orientation:landscape) and (max-height:600px){
        #main{padding:6px 8px 8px;gap:4px;}
        #clue{font-size:clamp(0.75rem,1.8vw,0.9rem);max-width:none;width:100%;text-align:center;}
        #content-cols{flex-direction:row;align-items:stretch;gap:8px;flex:1;width:100%;}
        #left-col{flex:2;min-width:0;gap:6px;align-items:center;justify-content:center;order:1;overflow:hidden;}
        #right-col{flex:1;order:2;align-items:center;justify-content:center;}
        #scene-wrap{width:100%;min-height:0;display:flex;justify-content:center;align-items:center;}
        #scene-wrap svg{width:auto;height:clamp(130px,36vh,195px);max-width:100%;}
        #blanks-row{gap:3px;justify-content:center;}
        .blank-word{gap:3px;}
        .blank-letter{font-size:clamp(0.85rem,3.5vw,1.2rem);min-width:0;width:clamp(20px,4.2vw,28px);}
        .blank-line{width:clamp(18px,4vw,26px);}
        .blank-space{width:8px;}
        #keyboard{max-width:none;gap:4px;}
        .key{width:clamp(26px,5.2vw,35px);height:clamp(26px,6vh,34px);font-size:clamp(0.62rem,1.7vw,0.8rem);}
        #resetBtn{padding:8px 22px;font-size:0.88rem;}
        #status-msg{font-size:clamp(0.85rem,2.5vw,1.1rem);min-height:1.2em;}
        .wrong-count{font-size:0.75rem;}
        #wrong-letters{font-size:0.75rem;}
      }
    `;
    document.head.appendChild(style);

    const confettiDiv = document.createElement('div');
    confettiDiv.id = 'confetti-container';
    document.body.appendChild(confettiDiv);

    const header = document.createElement('div');
    header.id = 'header';

    const backBtn = document.createElement('a');
    backBtn.id = 'backBtn';
    backBtn.href = '/learn';
    backBtn.textContent = '\u2190 Back to Games';
    backBtn.addEventListener('click', e => { if (history.length > 1) { e.preventDefault(); history.back(); } });
    header.appendChild(backBtn);

    const titleRow = document.createElement('div');
    titleRow.className = 'title-row';

    const h1 = document.createElement('h1');
    h1.textContent = TITLE;
    titleRow.appendChild(h1);

    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicBtn';
    musicBtn.title = 'Toggle music';
    musicBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    musicBtn.addEventListener('click', () => {
      musicOn = !musicOn;
      musicBtn.classList.toggle('playing', musicOn);
      if (musicOn) startMusic(); else stopMusic();
    });
    titleRow.appendChild(musicBtn);
    header.appendChild(titleRow);
    document.body.appendChild(header);

    const main = document.createElement('div');
    main.id = 'main';
    main.innerHTML = `
      <div id="clue"></div>
      <div id="content-cols">
        <div id="left-col">
          <div id="blanks-row"></div>
          <div id="wrong-letters"></div>
          ${MODE !== 'easy' ? '<div id="wrong-count" class="wrong-count"></div>' : ''}
          <div id="keyboard"></div>
          <div id="status-msg"></div>
          <button id="resetBtn">Play Another</button>
        </div>
        <div id="right-col">
          <div id="scene-wrap"><div id="scene"></div></div>
        </div>
      </div>
    `;
    document.body.appendChild(main);
  }

  function init() {
    buildDOM();
    if (MODE !== 'easy') initThemeQueue();
    startRound(pickEntry());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
