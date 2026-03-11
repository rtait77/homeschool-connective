(function () {
  'use strict';

  const W = window.WORDSEARCH;
  const SIZE = W.gridSize || 12;
  const DIRS = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
  const COLORS = ['#ed7c5a','#55b6ca','#FFD700','#a78bfa','#34d399','#f97316','#ec4899','#60a5fa'];

  let grid = [];
  let placements = {};
  let cellMap = {};
  let found = new Set();
  let isSelecting = false;
  let selStart = null;
  let selDir = null;
  let selCells = [];
  let audioCtx = null;
  let musicBuffer = null;
  let musicSource = null;
  let musicPlaying = false;
  let audioUnlocked = false;
  let _playId = null, _playStart = Date.now(), _done = false;

  // ─── ANALYTICS ────────────────────────────────────────────────────────────────
  function trackStart() {
    fetch('/api/track/play-start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game_title: W.title }) })
      .then(r => r.json()).then(d => { _playId = d.play_id; }).catch(() => {});
  }
  function trackEnd(completed) {
    if (!_playId) return;
    const id = _playId; _playId = null;
    const body = JSON.stringify({ play_id: id, completed, duration_seconds: Math.round((Date.now() - _playStart) / 1000) });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track/play-end', new Blob([body], { type: 'application/json' }));
    else fetch('/api/track/play-end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }
  window.addEventListener('pagehide', () => { if (!_done) trackEnd(false); });

  // ─── AUDIO ────────────────────────────────────────────────────────────────────
  function getAC() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try { getAC(); } catch(e) {}
  }
  function playCorrect() {
    try {
      const ac = getAC();
      [523, 659, 784].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine'; o.frequency.value = f;
        const t = ac.currentTime + i * 0.1;
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.start(t); o.stop(t + 0.4);
      });
    } catch(e) {}
  }
  function playWrong() {
    try {
      const ac = getAC();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle'; o.frequency.value = 180;
      g.gain.setValueAtTime(0.28, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.25);
    } catch(e) {}
  }
  function playWin() {
    try {
      const ac = getAC();
      [523,659,784,1047,1318].forEach((f, i) => {
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
  function toggleMusic() {
    if (musicPlaying) {
      if (musicSource) { try { musicSource.stop(); } catch(e) {} musicSource = null; }
      musicPlaying = false;
      document.getElementById('musicBtn').classList.remove('playing');
    } else {
      musicPlaying = true;
      document.getElementById('musicBtn').classList.add('playing');
      try {
        const ac = getAC();
        if (musicBuffer) {
          doPlayMusic(ac, musicBuffer);
        } else {
          fetch('/puzzle-bg-music.mp3').then(r => r.arrayBuffer())
            .then(b => ac.decodeAudioData(b))
            .then(buf => { musicBuffer = buf; if (musicPlaying) doPlayMusic(ac, buf); })
            .catch(() => {});
        }
      } catch(e) {}
    }
  }
  function doPlayMusic(ac, buf) {
    if (musicSource) { try { musicSource.stop(); } catch(e) {} }
    musicSource = ac.createBufferSource();
    musicSource.buffer = buf;
    musicSource.loop = true;
    musicSource.connect(ac.destination);
    musicSource.start(0);
  }

  // ─── GRID GENERATION ──────────────────────────────────────────────────────────
  function makeGrid() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
    placements = {};

    for (const { word } of W.words) {
      const w = word.toUpperCase();
      let placed = false;
      const dirs = [...DIRS].sort(() => Math.random() - 0.5);

      for (let attempt = 0; attempt < 300 && !placed; attempt++) {
        const dir = dirs[attempt % dirs.length];
        const r = Math.floor(Math.random() * SIZE);
        const c = Math.floor(Math.random() * SIZE);
        if (canPlace(w, r, c, dir)) { doPlace(w, r, c, dir); placed = true; }
      }
      if (!placed) {
        outer: for (const dir of DIRS) {
          for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
              if (canPlace(w, r, c, dir)) { doPlace(w, r, c, dir); placed = true; break outer; }
            }
          }
        }
      }
    }

    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
  }

  function canPlace(word, r, c, [dr, dc]) {
    for (let i = 0; i < word.length; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return false;
      if (grid[nr][nc] && grid[nr][nc] !== word[i]) return false;
    }
    return true;
  }
  function doPlace(word, r, c, [dr, dc]) {
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      grid[nr][nc] = word[i];
      cells.push({ r: nr, c: nc });
    }
    placements[word] = cells;
  }

  // ─── DOM ──────────────────────────────────────────────────────────────────────
  function buildDOM() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap';
    document.head.appendChild(link);

    let vm = document.querySelector('meta[name=viewport]');
    if (!vm) { vm = document.createElement('meta'); vm.name = 'viewport'; document.head.appendChild(vm); }
    vm.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover';

    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { height: 100%; overflow: hidden; -webkit-text-size-adjust: 100%; }
      body {
        background: url('/space-bg.png') center/cover no-repeat fixed;
        font-family: 'Nunito', sans-serif;
        color: white;
        display: flex;
        flex-direction: column;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
      }
      /* ── Header (matches puzzle engine) ── */
      #header {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 14px 16px 6px;
        gap: 10px;
        flex-shrink: 0;
      }
      #backBtn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255,255,255,0.75);
        font-size: 0.85rem;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        flex-shrink: 0;
        transition: color 0.15s;
      }
      #backBtn:hover { color: white; }
      .title-row {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      h1 {
        font-size: clamp(0.9rem, 2.5vw, 1.2rem);
        font-weight: 800;
        color: #FFD700;
        text-align: center;
        margin: 0;
        text-shadow: 0 0 24px rgba(255,215,0,0.35);
      }
      #musicBtn {
        background: #ed7c5a;
        border: none;
        border-radius: 50%;
        width: 32px; height: 32px; min-width: 32px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      #musicBtn:hover { background: #d4623f; }
      #musicBtn svg { width: 16px; height: 16px; fill: white; }
      #musicBtn.playing { background: #FFD700; animation: noteBounce 0.7s ease-in-out infinite; }
      #musicBtn.playing svg { fill: #1c1c1c; }
      @keyframes noteBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
      @media (orientation: portrait) and (max-width: 768px) {
        #header { padding: 10px 12px 4px; flex-wrap: wrap; gap: 6px; }
        #backBtn { flex: 0 0 auto; }
        .title-row { flex: 1; justify-content: flex-end; }
        h1 { font-size: clamp(0.95rem, 4vw, 1.3rem); }
      }
      /* ── Layout ── */
      #gameArea {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: 8px 16px 12px;
        min-height: 0;
        overflow: hidden;
      }
      /* ── Grid ── */
      #gridEl {
        display: grid;
        grid-template-columns: repeat(${SIZE}, var(--cell));
        grid-template-rows: repeat(${SIZE}, var(--cell));
        gap: 2px;
        --cell: clamp(22px, min(calc((100vh - 110px) / ${SIZE + 1}), calc((100vw - 240px) / ${SIZE + 0.5})), 42px);
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .cell {
        width: var(--cell);
        height: var(--cell);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: calc(var(--cell) * 0.46);
        font-weight: 800;
        background: rgba(255,255,255,0.07);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: background 0.06s;
      }
      .cell.sel { background: rgba(255,255,255,0.32) !important; color: white; }
      .cell.found { color: #111; }
      /* ── Word list ── */
      #wordList {
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;
        max-height: calc(100vh - 100px);
        padding-right: 4px;
        flex-shrink: 0;
      }
      .word-item {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(255,255,255,0.08);
        border-radius: 10px;
        padding: 6px 14px 6px 6px;
        border-left: 4px solid transparent;
        transition: opacity 0.3s;
        min-width: 155px;
      }
      .word-item img {
        width: 44px; height: 44px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .word-label {
        font-size: 0.95rem;
        font-weight: 800;
        letter-spacing: 0.05em;
      }
      .word-item.done { opacity: 0.55; }
      .word-item.done .word-label { text-decoration: line-through; }
      /* ── Portrait ── */
      @media (orientation: portrait) {
        #gameArea { flex-direction: column; gap: 10px; overflow-y: auto; }
        #gridEl { --cell: clamp(22px, calc((100vw - 32px) / ${SIZE}), 38px); }
        #wordList {
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          max-height: none;
          overflow-y: visible;
          gap: 6px;
          padding: 0;
        }
        .word-item { min-width: auto; padding: 4px 10px 4px 4px; }
        .word-item img { width: 34px; height: 34px; }
        .word-label { font-size: 0.82rem; }
      }
      /* ── Grid wrap (for reset btn positioning) ── */
      #gridWrap { position: relative; flex-shrink: 0; }
      /* ── Reset button (matches puzzle engine) ── */
      #resetBtn {
        display: none;
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: rgba(5,10,26,0.75);
        border: 3px solid rgba(255,255,255,0.6);
        border-radius: 50%;
        width: 72px; height: 72px;
        cursor: pointer; z-index: 11;
        align-items: center; justify-content: center;
        transition: background 0.15s, border-color 0.15s;
        animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
        animation-fill-mode: forwards;
      }
      #resetBtn.show { display: flex; }
      #resetBtn:hover  { background: rgba(237,124,90,0.85); border-color: white; }
      #resetBtn:active { transform: translate(-50%,-50%) scale(0.93); }
      #resetBtn svg { width: 36px; height: 36px; fill: white; }
      @keyframes popIn {
        0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.5); }
        100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
      }
      #confettiCanvas { position: fixed; inset: 0; pointer-events: none; z-index: 101; }
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
    h1.textContent = W.title;
    titleRow.appendChild(h1);

    header.appendChild(titleRow);

    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicBtn';
    musicBtn.title = 'Toggle music';
    musicBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    musicBtn.addEventListener('click', toggleMusic);
    header.appendChild(musicBtn);
    document.body.appendChild(header);

    // Game area
    const gameArea = document.createElement('div');
    gameArea.id = 'gameArea';

    // Grid
    const gridWrap = document.createElement('div');
    gridWrap.id = 'gridWrap';
    const gridEl = document.createElement('div');
    gridEl.id = 'gridEl';
    cellMap = {};
    for (let r = 0; r < SIZE; r++) {
      cellMap[r] = {};
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.textContent = grid[r][c];
        gridEl.appendChild(cell);
        cellMap[r][c] = cell;
      }
    }
    gridWrap.appendChild(gridEl);

    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetBtn';
    resetBtn.title = 'Play again';
    resetBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
    resetBtn.addEventListener('click', resetGame);
    gridWrap.appendChild(resetBtn);

    gameArea.appendChild(gridWrap);

    // Word list
    const wordList = document.createElement('div');
    wordList.id = 'wordList';
    W.words.forEach(({ word, image }) => {
      const item = document.createElement('div');
      item.className = 'word-item';
      item.dataset.word = word.toUpperCase();
      const img = document.createElement('img');
      img.src = image; img.alt = word;
      const label = document.createElement('span');
      label.className = 'word-label';
      label.textContent = word.toUpperCase();
      item.appendChild(img);
      item.appendChild(label);
      wordList.appendChild(item);
    });
    gameArea.appendChild(wordList);
    document.body.appendChild(gameArea);

    // Confetti canvas
    const cc = document.createElement('canvas');
    cc.id = 'confettiCanvas';
    document.body.appendChild(cc);
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────────
  function initEvents() {
    const gridEl = document.getElementById('gridEl');

    gridEl.addEventListener('mousedown', e => {
      e.preventDefault();
      unlockAudio();
      const cell = cellFromEl(e.target);
      if (cell) startSel(cell.r, cell.c);
    });
    document.addEventListener('mousemove', e => {
      if (!isSelecting) return;
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (cell) extendSel(cell.r, cell.c);
    });
    document.addEventListener('mouseup', () => { if (isSelecting) endSel(); });

    gridEl.addEventListener('touchstart', e => {
      e.preventDefault();
      unlockAudio();
      const t = e.touches[0];
      const cell = cellFromPoint(t.clientX, t.clientY);
      if (cell) startSel(cell.r, cell.c);
    }, { passive: false });
    document.addEventListener('touchmove', e => {
      if (!isSelecting) return;
      e.preventDefault();
      const t = e.touches[0];
      const cell = cellFromPoint(t.clientX, t.clientY);
      if (cell) extendSel(cell.r, cell.c);
    }, { passive: false });
    document.addEventListener('touchend', () => { if (isSelecting) endSel(); });
  }

  function cellFromEl(el) {
    const c = el && el.closest ? el.closest('.cell') : null;
    return c ? { r: +c.dataset.r, c: +c.dataset.c } : null;
  }
  function cellFromPoint(x, y) {
    return cellFromEl(document.elementFromPoint(x, y));
  }

  function startSel(r, c) {
    isSelecting = true;
    selStart = { r, c };
    selDir = null;
    selCells = [{ r, c }];
    renderSel();
  }

  function extendSel(r, c) {
    if (!isSelecting || !selStart) return;
    const dr = r - selStart.r, dc = c - selStart.c;
    const aDr = Math.abs(dr), aDc = Math.abs(dc);
    let dir = null;
    if (dr === 0 && dc !== 0)      dir = [0, Math.sign(dc)];
    else if (dc === 0 && dr !== 0) dir = [Math.sign(dr), 0];
    else if (aDr === aDc && dr !== 0) dir = [Math.sign(dr), Math.sign(dc)];
    else return;
    selDir = dir;
    const len = Math.max(aDr, aDc);
    selCells = [];
    for (let i = 0; i <= len; i++)
      selCells.push({ r: selStart.r + dir[0] * i, c: selStart.c + dir[1] * i });
    renderSel();
  }

  function endSel() {
    isSelecting = false;
    const selected = selCells.map(({ r, c }) => grid[r][c]).join('');
    const rev = selected.split('').reverse().join('');
    let matched = null;
    for (const { word } of W.words) {
      const w = word.toUpperCase();
      if ((selected === w || rev === w) && !found.has(w)) { matched = w; break; }
    }
    if (matched) {
      found.add(matched);
      const color = COLORS[(found.size - 1) % COLORS.length];
      (placements[matched] || []).forEach(({ r, c }) => {
        const el = cellMap[r][c];
        el.classList.add('found');
        el.style.background = color;
      });
      const item = document.querySelector(`.word-item[data-word="${matched}"]`);
      if (item) { item.classList.add('done'); item.style.borderLeftColor = color; }
      playCorrect();
      if (found.size === W.words.length) {
        _done = true;
        setTimeout(() => { win(); trackEnd(true); }, 500);
      }
    } else if (selCells.length > 1) {
      playWrong();
    }
    clearSel();
  }

  function clearSel() {
    selCells.forEach(({ r, c }) => { if (cellMap[r] && cellMap[r][c]) cellMap[r][c].classList.remove('sel'); });
    selCells = []; selStart = null; selDir = null;
  }
  function renderSel() {
    // Clear previous
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (cellMap[r][c].classList.contains('sel')) cellMap[r][c].classList.remove('sel');
    selCells.forEach(({ r, c }) => {
      if (!cellMap[r][c].classList.contains('found')) cellMap[r][c].classList.add('sel');
    });
  }

  // ─── CONFETTI ─────────────────────────────────────────────────────────────────
  let confetti = [];
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const cols = ['#ed7c5a','#55b6ca','#FFD700','#a78bfa','#34d399','#f97316'];
    confetti = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      w: Math.random() * 10 + 5, h: Math.random() * 6 + 3,
      color: cols[Math.floor(Math.random() * cols.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8,
    }));
    animateConfetti(ctx, canvas);
  }
  function animateConfetti(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti = confetti.filter(p => p.y < canvas.height + 20);
    confetti.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (confetti.length) requestAnimationFrame(() => animateConfetti(ctx, canvas));
  }

  // ─── WIN / RESET ──────────────────────────────────────────────────────────────
  function win() {
    playWin();
    launchConfetti();
    document.getElementById('resetBtn').classList.add('show');
  }

  function resetGame() {
    found.clear();
    _done = false;
    _playStart = Date.now();
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.classList.remove('show');
    const cc = document.getElementById('confettiCanvas');
    cc.getContext('2d').clearRect(0, 0, cc.width, cc.height);
    makeGrid();

    // Rebuild cells
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const el = cellMap[r][c];
        el.textContent = grid[r][c];
        el.className = 'cell';
        el.style.background = '';
      }
    }
    document.querySelectorAll('.word-item').forEach(item => {
      item.classList.remove('done');
      item.style.borderLeftColor = 'transparent';
    });
    trackStart();
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────────
  makeGrid();
  buildDOM();
  initEvents();
  trackStart();

})();
