(function () {
  'use strict';

  const W = window.WORDSORT;

  let soundOn = false;
  let audioCtx = null;
  let locked = new Set();
  let placements = {}; // word -> category index, or null = word bank
  let wordOrder = [];

  const allWords = W.categories.flatMap(c => c.words);

  // ─── AUDIO ────────────────────────────────────────────────────────────────
  function getAC() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function playCorrect() {
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
  function playWrong() {
    if (!soundOn) return;
    try {
      const ac = getAC();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle'; o.frequency.value = 180;
      g.gain.setValueAtTime(0.4, ac.currentTime);
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

  // ─── DOM ──────────────────────────────────────────────────────────────────
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

      /* ── Header ── */
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
      @media (orientation: portrait) and (max-width: 768px) {
        #header { flex-wrap: wrap; padding: 10px 12px 4px; gap: 6px; }
        h1 { font-size: clamp(0.95rem, 4vw, 1.3rem); }
      }

      /* ── Game area ── */
      #gameArea {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 16px 20px; gap: 14px; overflow: hidden;
      }

      /* ── Word bank ── */
      #wordBank {
        width: 100%; max-width: 820px;
        background: rgba(255,255,255,0.12); border: 2px dashed rgba(255,255,255,0.35);
        border-radius: 16px; padding: 14px 16px;
        display: flex; flex-wrap: wrap; gap: 10px;
        min-height: 62px; align-content: flex-start;
        transition: border-color 0.15s, background 0.15s;
      }
      #wordBank.drag-over { border-color: #FFD700; background: rgba(255,215,0,0.12); }

      /* ── Categories ── */
      #categories {
        width: 100%; max-width: 820px;
        display: grid; gap: 14px;
        grid-template-columns: repeat(${W.categories.length}, 1fr);
      }
      .category-zone {
        background: #2a6478; border: 3px solid #3a8fa8;
        border-radius: 16px; padding: 16px 18px; min-height: 180px;
        display: flex; flex-direction: column; gap: 10px;
        transition: border-color 0.15s, background 0.15s;
      }
      .category-zone.drag-over { border-color: #FFD700; background: #1e5268; }
      .category-label {
        font-size: 1rem; font-weight: 800; color: white;
        text-align: center; letter-spacing: 0.03em;
        padding-bottom: 10px; border-bottom: 2px solid rgba(255,255,255,0.2);
      }
      .category-words {
        display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; flex: 1;
      }

      /* ── Word chips ── */
      .word-chip {
        background: white; color: #1c1c1c;
        font-family: 'Nunito', sans-serif; font-size: 0.95rem; font-weight: 800;
        padding: 7px 18px; border-radius: 20px; border: 2px solid transparent;
        cursor: grab; transition: transform 0.1s, box-shadow 0.1s, background 0.2s, border-color 0.2s;
        touch-action: none; white-space: nowrap;
      }
      .word-chip:hover:not(.correct) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.3); }
      .word-chip.dragging { opacity: 0.2; cursor: grabbing; }
      .word-chip.correct { background: #86efac; border-color: #22c55e; cursor: default; }
      .word-chip.incorrect { background: #fca5a5; border-color: #ef4444; animation: shake 0.4s ease; }
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%,60% { transform: translateX(-8px); }
        40%,80% { transform: translateX(8px); }
      }

      /* ── Floating drag clone ── */
      #dragClone {
        position: fixed; pointer-events: none; z-index: 100; display: none;
        background: #FFD700; color: #1c1c1c;
        font-family: 'Nunito', sans-serif; font-size: 0.95rem; font-weight: 800;
        padding: 7px 18px; border-radius: 20px; border: 2px solid #e0b800;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        transform: rotate(3deg) scale(1.08); white-space: nowrap;
      }

      /* ── Reset button ── */
      #btnRow { display: flex; gap: 10px; }
      #resetBtn {
        font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 800;
        padding: 10px 28px; border-radius: 10px; cursor: pointer;
        background: rgba(255,255,255,0.15); color: white;
        border: 2px solid rgba(255,255,255,0.35);
        transition: background 0.15s, border-color 0.15s;
      }
      #resetBtn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.55); }

      /* ── Confetti ── */
      #confettiCanvas { position: fixed; inset: 0; pointer-events: none; z-index: 10; }
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

    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicBtn';
    musicBtn.title = 'Toggle music';
    musicBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    titleRow.appendChild(musicBtn);

    header.appendChild(titleRow);
    document.body.appendChild(header);

    // Game area
    const gameArea = document.createElement('div');
    gameArea.id = 'gameArea';

    const wordBank = document.createElement('div');
    wordBank.id = 'wordBank';
    gameArea.appendChild(wordBank);

    const cats = document.createElement('div');
    cats.id = 'categories';
    W.categories.forEach((c, i) => {
      const zone = document.createElement('div');
      zone.className = 'category-zone';
      zone.dataset.catIndex = String(i);

      const label = document.createElement('div');
      label.className = 'category-label';
      label.textContent = c.name;
      zone.appendChild(label);

      const words = document.createElement('div');
      words.className = 'category-words';
      zone.appendChild(words);

      cats.appendChild(zone);
    });
    gameArea.appendChild(cats);

    const btnRow = document.createElement('div');
    btnRow.id = 'btnRow';
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetBtn';
    resetBtn.textContent = 'Reset';
    btnRow.appendChild(resetBtn);
    gameArea.appendChild(btnRow);

    document.body.appendChild(gameArea);

    const cc = document.createElement('canvas');
    cc.id = 'confettiCanvas';
    document.body.appendChild(cc);

    const bgMusic = document.createElement('audio');
    bgMusic.id = 'bgMusic';
    bgMusic.src = '/puzzle-bg-music.mp3';
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    document.body.appendChild(bgMusic);

    const clone = document.createElement('div');
    clone.id = 'dragClone';
    document.body.appendChild(clone);
  }

  // ─── STATE ────────────────────────────────────────────────────────────────
  function initState() {
    placements = {};
    locked = new Set();
    allWords.forEach(w => { placements[w] = null; });
    wordOrder = [...allWords];
    for (let i = wordOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordOrder[i], wordOrder[j]] = [wordOrder[j], wordOrder[i]];
    }
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  function render() {
    const wordBank = document.getElementById('wordBank');
    wordBank.innerHTML = '';
    wordOrder.filter(w => placements[w] === null).forEach(w => wordBank.appendChild(makeChip(w)));

    W.categories.forEach((_, i) => {
      const el = document.querySelector(`.category-zone[data-cat-index="${i}"] .category-words`);
      el.innerHTML = '';
      wordOrder.filter(w => placements[w] === i).forEach(w => el.appendChild(makeChip(w)));
    });
  }

  function makeChip(word) {
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    if (locked.has(word)) chip.classList.add('correct');
    chip.textContent = word;
    chip.dataset.word = word;
    if (!locked.has(word)) attachDrag(chip);
    return chip;
  }

  // ─── DRAG ─────────────────────────────────────────────────────────────────
  let dragging = null;
  let offX = 0, offY = 0;

  function getXY(e) {
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX, y: src.clientY };
  }

  function attachDrag(chip) {
    chip.addEventListener('mousedown', onDragStart);
    chip.addEventListener('touchstart', onDragStart, { passive: false });
  }

  function onDragStart(e) {
    e.preventDefault();
    const chip = e.currentTarget;
    if (locked.has(chip.dataset.word)) return;
    const { x, y } = getXY(e);
    const r = chip.getBoundingClientRect();
    offX = x - r.left;
    offY = y - r.top;
    dragging = chip.dataset.word;
    chip.classList.add('dragging');
    const clone = document.getElementById('dragClone');
    clone.textContent = dragging;
    clone.style.display = 'block';
    clone.style.left = (x - offX) + 'px';
    clone.style.top  = (y - offY) + 'px';
  }

  function onDragMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const { x, y } = getXY(e);
    const clone = document.getElementById('dragClone');
    clone.style.left = (x - offX) + 'px';
    clone.style.top  = (y - offY) + 'px';
    document.querySelectorAll('.category-zone, #wordBank').forEach(z => {
      const r = z.getBoundingClientRect();
      z.classList.toggle('drag-over', x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
    });
  }

  function onDragEnd(e) {
    if (!dragging) return;
    const src = e.changedTouches ? e.changedTouches[0] : e;
    const { clientX: x, clientY: y } = src;
    const word = dragging;

    document.getElementById('dragClone').style.display = 'none';
    document.querySelectorAll('.category-zone, #wordBank').forEach(z => z.classList.remove('drag-over'));

    // Find drop target
    let droppedCatIndex = null;
    document.querySelectorAll('.category-zone').forEach(z => {
      const r = z.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        droppedCatIndex = parseInt(z.dataset.catIndex);
      }
    });

    dragging = null;

    if (droppedCatIndex === null) {
      // Dropped outside any zone — return to bank
      placements[word] = null;
      render();
      return;
    }

    // Check immediately
    const correct = W.categories[droppedCatIndex].words.includes(word);
    if (correct) {
      placements[word] = droppedCatIndex;
      locked.add(word);
      playCorrect();
      render();
      if (locked.size === allWords.length) {
        setTimeout(() => { playWin(); launchConfetti(); }, 300);
      }
    } else {
      // Show briefly in the wrong zone, shake, then return to bank
      placements[word] = droppedCatIndex;
      render();
      playWrong();
      const chip = document.querySelector(`.word-chip[data-word="${word}"]`);
      if (chip) chip.classList.add('incorrect');
      setTimeout(() => {
        placements[word] = null;
        render();
      }, 600);
    }
  }

  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);

  // ─── RESET ────────────────────────────────────────────────────────────────
  function reset() {
    initState();
    const cc = document.getElementById('confettiCanvas');
    if (cc) cc.getContext('2d').clearRect(0, 0, cc.width, cc.height);
    if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF = null; }
    render();
  }

  // ─── CONFETTI ─────────────────────────────────────────────────────────────
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

  // ─── MUSIC ────────────────────────────────────────────────────────────────
  function initMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    soundOn = false;
    musicBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      if (soundOn) {
        bgMusic.volume = 0.35;
        bgMusic.play().catch(() => {});
        musicBtn.classList.add('playing');
      } else {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
      }
    });
  }

  // ─── BOOT ─────────────────────────────────────────────────────────────────
  function boot() {
    buildDOM();
    initState();
    render();
    initMusic();
    document.getElementById('resetBtn').addEventListener('click', reset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
