(function () {
  'use strict';

  const M = window.MATCHING;
  const COLS = M.cols || 4;
  const ROWS = Math.ceil(M.pairs.length * 2 / COLS);
  const GAP = 10;
  const PAD = 14;
  const CARD_RATIO = 1.0; // square cards

  let audioCtx = null;
  let soundOn = true;
  let flipped = [];   // up to 2 { card, pairId } objects
  let matched = new Set();
  let locked = false;
  let cardData = [];

  // ─── ANALYTICS ────────────────────────────────────────────────────────────────
  let _playId = null, _playStart = Date.now(), _gameCompleted = false;
  function trackStart() {
    fetch('/api/track/play-start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game_title: M.title }) })
      .then(r => r.json()).then(d => { _playId = d.play_id; }).catch(() => {});
  }
  function trackEnd(completed) {
    if (!_playId) return;
    const id = _playId; _playId = null;
    const body = JSON.stringify({ play_id: id, completed, duration_seconds: Math.round((Date.now() - _playStart) / 1000) });
    if (navigator.sendBeacon) { navigator.sendBeacon('/api/track/play-end', new Blob([body], { type: 'application/json' })); }
    else { fetch('/api/track/play-end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {}); }
  }
  window.addEventListener('pagehide', () => { if (!_gameCompleted) trackEnd(false); });

  // ─── AUDIO ────────────────────────────────────────────────────────────────────
  function getAC() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function unlockAudio() {
    try {
      const ac = getAC();
      if (ac.state !== 'running') ac.resume();
      const buf = ac.createBuffer(1, 1, 22050);
      const src = ac.createBufferSource();
      src.buffer = buf; src.connect(ac.destination); src.start(0);
    } catch(_e) {}
  }
  function playMatch() {
    if (!soundOn) return;
    try {
      const ac = getAC();
      [523, 784].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine'; o.frequency.value = f;
        const t = ac.currentTime + i * 0.13;
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        o.start(t); o.stop(t + 0.45);
      });
    } catch(e) {}
  }
  function playNoMatch() {
    if (!soundOn) return;
    try {
      const ac = getAC();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle'; o.frequency.value = 180;
      g.gain.setValueAtTime(0.45, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.3);
    } catch(e) {}
  }
  function playWin() {
    if (!soundOn) return;
    try {
      const ac = getAC();
      [523,659,784,1047,1318].forEach((f,i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine'; o.frequency.value = f;
        const t = ac.currentTime + i * 0.13;
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        o.start(t); o.stop(t + 0.55);
      });
    } catch(e) {}
  }

  // ─── DOM ──────────────────────────────────────────────────────────────────────
  function buildDOM() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        height: 100%; overflow: hidden;
        font-family: 'Nunito', sans-serif; color: white;
        background: url('/space-bg.png') center center / cover no-repeat fixed;
        user-select: none; -webkit-user-select: none;
      }
      body { display: flex; flex-direction: column; }

      /* ── Header (same as puzzle engine) ── */
      #header {
        width: 100%; display: flex; flex-direction: row;
        align-items: center; padding: 14px 16px 6px; gap: 10px; flex-shrink: 0;
      }
      #backBtn {
        display: inline-flex; align-items: center; gap: 6px;
        color: rgba(255,255,255,0.75); font-size: 0.85rem; font-weight: 700;
        text-decoration: none; white-space: nowrap; flex-shrink: 0; transition: color 0.15s;
      }
      #backBtn:hover { color: white; }
      .title-row { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; }
      h1 {
        font-size: clamp(0.9rem, 2.5vw, 1.2rem); font-weight: 800;
        color: #FFD700; text-align: center; text-shadow: 0 0 24px rgba(255,215,0,0.35);
      }
      .image-credit {
        flex-shrink: 0; white-space: nowrap;
        font-size: 0.75rem; color: rgba(255,255,255,0.6); letter-spacing: 0.03em;
      }
      #musicBtn {
        background: #ed7c5a; border: none; border-radius: 50%;
        width: 32px; height: 32px; min-width: 32px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background 0.15s; flex-shrink: 0;
      }
      #musicBtn:hover { background: #d4623f; }
      #musicBtn svg { width: 16px; height: 16px; fill: white; }
      #musicBtn.playing { background: #FFD700; animation: noteBounce 0.7s ease-in-out infinite; }
      #musicBtn.playing svg { fill: #1c1c1c; }
      #musicBtn.playing:hover { background: #e6c200; }
      @keyframes noteBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.18); }
      }

      /* Portrait mobile */
      @media (orientation: portrait) and (max-width: 768px) {
        #header { flex-wrap: wrap; padding: 10px 12px 4px; gap: 6px; }
        #backBtn { margin-bottom: 0; }
        .title-row { flex: 1; justify-content: flex-end; }
        h1 { font-size: clamp(0.95rem, 4vw, 1.3rem); }
        .image-credit { position: fixed; bottom: 8px; left: 0; right: 0; text-align: center; }
      }

      /* ── Game area ── */
      #gameArea {
        flex: 1; display: flex; align-items: center;
        justify-content: center; padding: ${PAD}px; overflow: hidden;
      }

      /* ── Card grid ── */
      #grid {
        display: grid;
        grid-template-columns: repeat(${COLS}, var(--card-w));
        grid-template-rows: repeat(${ROWS}, var(--card-h));
        gap: ${GAP}px;
      }

      /* ── Cards ── */
      .card {
        width: var(--card-w); height: var(--card-h);
        cursor: pointer; perspective: 900px;
        touch-action: manipulation;
      }
      .card-inner {
        width: 100%; height: 100%; position: relative;
        transform-style: preserve-3d;
        transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 12px;
      }
      .card.flipped .card-inner,
      .card.matched .card-inner { transform: rotateY(180deg); }
      .card-face {
        position: absolute; inset: 0; border-radius: 12px;
        backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden;
      }
      /* Back — red */
      .card-back {
        background: #d52d5d;
        background-image:
          radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px),
          radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
        background-size: 18px 18px, 9px 9px;
        background-position: 0 0, 9px 9px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 0 0 3px rgba(255,255,255,0.18), 0 4px 20px rgba(0,0,0,0.4);
      }
      .card-back::after {
        content: '✦'; font-size: 2.2em; color: rgba(255,255,255,0.28);
      }
      /* Front — planet image card (black bg) */
      .card-front {
        transform: rotateY(180deg);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }
      .card-front.image-card {
        background: #000;
        border: 2px solid rgba(255,255,255,0.12);
      }
      .card-front.name-card {
        background: #fff;
        border: 2px solid rgba(0,0,0,0.1);
      }
      .card-front img {
        width: 92%; height: 92%; object-fit: contain;
      }
      .card-front .planet-name {
        font-size: clamp(1.1rem, 4vw, 1.8rem); font-weight: 800;
        color: #000; text-align: center; line-height: 1.2;
      }
      /* Matched glow */
      .card.matched .card-front.image-card {
        border-color: #FFD700;
        box-shadow: 0 0 20px rgba(255,215,0,0.5), 0 4px 20px rgba(0,0,0,0.4);
      }
      .card.matched .card-front.name-card {
        border-color: #FFD700;
        box-shadow: 0 0 20px rgba(255,215,0,0.5);
      }

      /* ── Confetti ── */
      #confettiCanvas { position: fixed; inset: 0; pointer-events: none; z-index: 10; }

      /* ── Reset button ── */
      #resetBtn {
        display: none; position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: rgba(5,10,26,0.75); border: 3px solid rgba(255,255,255,0.6);
        border-radius: 50%; width: 72px; height: 72px;
        cursor: pointer; z-index: 11;
        align-items: center; justify-content: center;
        transition: background 0.15s, border-color 0.15s;
        animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
      }
      #resetBtn.show { display: flex; }
      #resetBtn:hover { background: rgba(237,124,90,0.85); border-color: white; }
      #resetBtn svg { width: 36px; height: 36px; fill: white; }
      @keyframes popIn {
        0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.5); }
        100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
      }
    `;
    document.head.appendChild(style);

    // Header
    const header = document.createElement('div');
    header.id = 'header';

    const backBtn = document.createElement('a');
    backBtn.id = 'backBtn';
    backBtn.href = '/learn';
    backBtn.textContent = '← Back to Games';
    header.appendChild(backBtn);

    const titleRow = document.createElement('div');
    titleRow.className = 'title-row';

    const h1 = document.createElement('h1');
    h1.textContent = M.title;
    titleRow.appendChild(h1);

    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicBtn';
    musicBtn.title = 'Toggle music';
    musicBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    titleRow.appendChild(musicBtn);

    header.appendChild(titleRow);

    const credit = document.createElement('p');
    credit.className = 'image-credit';
    credit.textContent = M.credit;
    header.appendChild(credit);

    document.body.appendChild(header);

    // Game area + grid
    const gameArea = document.createElement('div');
    gameArea.id = 'gameArea';
    const grid = document.createElement('div');
    grid.id = 'grid';
    gameArea.appendChild(grid);
    document.body.appendChild(gameArea);

    // Confetti canvas
    const cc = document.createElement('canvas');
    cc.id = 'confettiCanvas';
    document.body.appendChild(cc);

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetBtn';
    resetBtn.title = 'Play again';
    resetBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
    document.body.appendChild(resetBtn);

    // Background music
    const bgMusic = document.createElement('audio');
    bgMusic.id = 'bgMusic';
    bgMusic.src = '/puzzle-bg-music.mp3';
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    document.body.appendChild(bgMusic);
  }

  // ─── CARD SIZE ────────────────────────────────────────────────────────────────
  function calcCardSize() {
    const gameArea = document.getElementById('gameArea');
    const availW = gameArea.clientWidth - PAD * 2;
    const availH = gameArea.clientHeight - PAD * 2;
    // Fit by width
    const wByW = (availW - GAP * (COLS - 1)) / COLS;
    const hByW = wByW / CARD_RATIO;
    // Fit by height
    const hByH = (availH - GAP * (ROWS - 1)) / ROWS;
    const wByH = hByH * CARD_RATIO;
    // Use whichever is smaller, cap at 200px wide
    const cardW = Math.floor(Math.min(wByW, wByH, 200));
    const cardH = Math.floor(cardW / CARD_RATIO);
    document.documentElement.style.setProperty('--card-w', cardW + 'px');
    document.documentElement.style.setProperty('--card-h', cardH + 'px');
  }

  // ─── SETUP ────────────────────────────────────────────────────────────────────
  function setup() {
    flipped = [];
    matched = new Set();
    locked = false;

    // Build shuffled card data
    cardData = [];
    M.pairs.forEach((p, i) => {
      cardData.push({ pairId: i, type: 'image', src: p.image, name: p.name });
      cardData.push({ pairId: i, type: 'name', name: p.name });
    });
    for (let i = cardData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
    }

    calcCardSize();

    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    cardData.forEach((data) => {
      const card = document.createElement('div');
      card.className = 'card';

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const back = document.createElement('div');
      back.className = 'card-face card-back';

      const front = document.createElement('div');
      front.className = data.type === 'image'
        ? 'card-face card-front image-card'
        : 'card-face card-front name-card';

      if (data.type === 'image') {
        const img = document.createElement('img');
        img.src = data.src;
        img.alt = data.name;
        img.draggable = false;
        front.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'planet-name';
        span.textContent = data.name;
        front.appendChild(span);
      }

      inner.appendChild(back);
      inner.appendChild(front);
      card.appendChild(inner);

      card.addEventListener('click', () => { unlockAudio(); onCardClick(card, data); });

      grid.appendChild(card);
    });
  }

  // ─── GAME LOGIC ───────────────────────────────────────────────────────────────
  function onCardClick(card, data) {
    if (locked) return;
    if (matched.has(data.pairId)) return;
    if (card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    flipped.push({ card, pairId: data.pairId });

    if (flipped.length === 2) {
      locked = true;
      setTimeout(checkMatch, 650);
    }
  }

  function checkMatch() {
    const [a, b] = flipped;
    if (a.pairId === b.pairId) {
      matched.add(a.pairId);
      a.card.classList.add('matched');
      b.card.classList.add('matched');
      playMatch();
      flipped = [];
      locked = false;
      if (matched.size === M.pairs.length) {
        _gameCompleted = true; trackEnd(true);
        setTimeout(() => {
          playWin();
          launchConfetti();
          document.getElementById('resetBtn').classList.add('show');
        }, 400);
      }
    } else {
      playNoMatch();
      setTimeout(() => {
        a.card.classList.remove('flipped');
        b.card.classList.remove('flipped');
        flipped = [];
        locked = false;
      }, 900);
    }
  }

  // ─── CONFETTI ─────────────────────────────────────────────────────────────────
  const CONFETTI_COLORS = ['#FFD700','#ed7c5a','#55b6ca','#ffffff','#c084fc','#86efac'];
  let confettiParticles = [], confettiRAF = null;
  function launchConfetti() {
    const cc = document.getElementById('confettiCanvas');
    cc.width = window.innerWidth; cc.height = window.innerHeight;
    const c2 = cc.getContext('2d');
    confettiParticles = Array.from({length: 120}, () => ({
      x: Math.random() * cc.width, y: Math.random() * -cc.height * 0.5,
      w: 6 + Math.random() * 6, h: 10 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.2,
      vx: (Math.random() - 0.5) * 2.5, vy: 2 + Math.random() * 3, alpha: 1,
    }));
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    function animate() {
      c2.clearRect(0, 0, cc.width, cc.height);
      let alive = false;
      for (const p of confettiParticles) {
        p.x += p.vx; p.y += p.vy; p.angle += p.spin;
        if (p.y > cc.height * 0.7) p.alpha -= 0.025;
        if (p.alpha <= 0) continue;
        alive = true;
        c2.save(); c2.globalAlpha = p.alpha; c2.translate(p.x, p.y); c2.rotate(p.angle);
        c2.fillStyle = p.color; c2.fillRect(-p.w/2, -p.h/2, p.w, p.h); c2.restore();
      }
      if (alive) confettiRAF = requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── RESET ────────────────────────────────────────────────────────────────────
  function resetGame() {
    document.getElementById('resetBtn').classList.remove('show');
    const cc = document.getElementById('confettiCanvas');
    cc.getContext('2d').clearRect(0, 0, cc.width, cc.height);
    if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF = null; }
    setup();
  }

  // ─── RESIZE ───────────────────────────────────────────────────────────────────
  let _resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(calcCardSize, 200);
  });

  // ─── SOUND TOGGLE ─────────────────────────────────────────────────────────────
  function initMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    soundOn = true; // SFX always on
    let musicPlaying = false;
    musicBtn.addEventListener('click', () => {
      musicPlaying = !musicPlaying;
      if (musicPlaying) {
        bgMusic.volume = 0.35;
        bgMusic.play().catch(() => {});
        musicBtn.classList.add('playing');
      } else {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
      }
    });
  }

  // ─── BOOT ─────────────────────────────────────────────────────────────────────
  function boot() {
    buildDOM();
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    initMusic();
    setup();
    trackStart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
