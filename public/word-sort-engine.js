(function () {
  'use strict';

  const W = window.WORDSORT;
  const MAX_ATTEMPTS = 3;

  let soundOn = false;
  let audioCtx = null;
  let locked = new Set();
  let placements = {};
  let wordOrder = [];
  let attemptsLeft = MAX_ATTEMPTS;

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
        font-family: 'Nunito', sans-serif;
        background: url('/space-bg.png') center center / cover no-repeat fixed;
        user-select: none; -webkit-user-select: none;
      }
      body { display: flex; flex-direction: column; color: white; }

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
        #gameArea {
          margin: 8px 8px 14px;
          padding: 10px 10px 14px; gap: 8px;
          max-width: 100%;
        }
        #topBar { flex-direction: column; align-items: center; gap: 2px; }
        #attemptsDisplay { position: static; }
        #instruction, #attemptsDisplay { font-size: 0.75rem; }
        #wordBank { height: auto; min-height: 60px; max-height: 160px; }
        #categories { grid-template-columns: 1fr; }
        .category-zone { height: 130px; min-height: 130px; max-height: 130px; }
        .word-chip { font-size: 0.75rem; padding: 4px 10px; }
        .category-label { font-size: 0.85rem; }
        #checkBtn { width: 100%; }
      }

      /* ── Blue game area ── */
      #gameArea {
        display: flex; flex-direction: column;
        width: 100%; max-width: 920px;
        margin: 40px auto 20px;
        align-self: center;
        background: #55b6ca; border-radius: 20px;
        padding: 14px 48px 18px; gap: 10px;
      }

      /* ── Top bar: instruction + attempts ── */
      #topBar {
        position: relative; display: flex; align-items: center;
        justify-content: center; flex-shrink: 0;
      }
      #instruction {
        font-size: 0.95rem; font-weight: 700; color: #1c1c1c; text-align: center;
      }
      #attemptsDisplay {
        position: absolute; right: 0;
        font-size: 0.95rem; font-weight: 800; color: #1c1c1c; white-space: nowrap;
      }

      /* ── Attempts toast ── */
      #attemptToast {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10,10,30,0.88); color: white;
        font-family: 'Nunito', sans-serif; font-size: 1.4rem; font-weight: 800;
        padding: 18px 36px; border-radius: 16px;
        pointer-events: none; z-index: 50;
        opacity: 0; transition: opacity 0.2s;
        white-space: nowrap;
      }
      #attemptToast.show { opacity: 1; }

      /* ── Word bank ── */
      #wordBank {
        background: white; border: 2px dashed #1c1c1c;
        border-radius: 10px; padding: 8px 10px;
        display: flex; flex-wrap: wrap; gap: 6px;
        height: 130px; align-content: center;
        overflow-y: auto;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      #wordBank.drag-over { background: #f0f9ff; }

      /* ── Category grid ── */
      #categories {
        display: grid; gap: 8px;
        grid-template-columns: repeat(${W.categories.length}, 1fr);
      }
      .category-zone {
        background: white; border: 2px solid #1c1c1c;
        border-radius: 10px; padding: 10px 12px;
        height: 220px; min-height: 220px; max-height: 220px;
        display: flex; flex-direction: column; gap: 6px;
        transition: background 0.15s; overflow-y: auto; flex-shrink: 0;
      }
      .category-zone.drag-over { background: #e8f8fb; }
      .category-label {
        font-size: 1rem; font-weight: 800; color: #1c1c1c;
        text-align: center; padding-bottom: 6px;
        border-bottom: 1px solid #ddd;
      }
      .category-words {
        display: flex; flex-wrap: wrap; gap: 6px;
        justify-content: flex-start; align-content: flex-start; flex: 1;
      }

      /* ── Word chips ── */
      .word-chip {
        background: #e5e64d; color: #1c1c1c;
        font-family: 'Nunito', sans-serif; font-size: 1rem; font-weight: 800;
        padding: 7px 18px; border-radius: 20px; border: 1.5px solid #1c1c1c;
        cursor: grab; white-space: nowrap;
        transition: transform 0.1s, box-shadow 0.1s, background 0.2s;
        touch-action: none;
      }
      .word-chip:hover:not(.correct):not(.incorrect) {
        transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .word-chip.dragging { opacity: 0.2; }
      .word-chip.correct { background: #86efac; border-color: #22c55e; cursor: default; }
      .word-chip.incorrect { background: #fca5a5; border-color: #ef4444; animation: shake 0.45s ease; }
      .word-chip.flying { animation: flyBack 0.35s ease forwards; }
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%,60% { transform: translateX(-8px); }
        40%,80% { transform: translateX(8px); }
      }
      @keyframes flyBack {
        0%   { transform: translateX(0) scale(1); opacity: 1; }
        100% { transform: translateX(-120px) scale(0.7); opacity: 0; }
      }

      /* ── Floating drag clone ── */
      #dragClone {
        position: fixed; pointer-events: none; z-index: 100; display: none;
        background: #e5e64d; color: #1c1c1c;
        font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 800;
        padding: 6px 16px; border-radius: 20px; border: 1.5px solid #1c1c1c;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        transform: rotate(3deg) scale(1.08); white-space: nowrap;
      }

      /* ── Bottom row ── */
      #btnRow {
        display: flex; justify-content: center; flex-shrink: 0;
      }
      #checkBtn {
        font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 800;
        padding: 8px 26px; border-radius: 10px; cursor: pointer;
        background: #ed7c5a; color: white; border: 2px solid #ed7c5a;
        transition: background 0.15s, color 0.15s;
      }
      #checkBtn:hover { background: white; color: #ed7c5a; }
      #checkBtn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }

      /* ── Reset button (shown after win/lose) ── */
      #resetBtn {
        display: none; position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: rgba(5,10,26,0.75); border: 3px solid rgba(255,255,255,0.6);
        border-radius: 50%; width: 72px; height: 72px;
        cursor: pointer; z-index: 20;
        align-items: center; justify-content: center;
        transition: background 0.15s;
        animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
      }
      #resetBtn.show { display: flex; }
      #resetBtn:hover { background: rgba(237,124,90,0.85); border-color: white; }
      #resetBtn svg { width: 36px; height: 36px; fill: white; }
      @keyframes popIn {
        0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.5); }
        100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
      }

      /* ── Game over modal ── */
      #gameOverModal {
        display: none; position: fixed; inset: 0; z-index: 30;
        align-items: center; justify-content: center;
        background: rgba(0,0,0,0.55);
      }
      #gameOverModal.show { display: flex; }
      .modal-box {
        background: white; border-radius: 20px;
        padding: 36px 48px; text-align: center;
        box-shadow: 0 16px 48px rgba(0,0,0,0.4);
        display: flex; flex-direction: column; align-items: center; gap: 20px;
      }
      .modal-box p {
        font-size: 1.6rem; font-weight: 800; color: #1c1c1c;
      }
      .modal-box button {
        background: rgba(5,10,26,0.75); border: 3px solid rgba(255,255,255,0.6);
        border-radius: 50%; width: 72px; height: 72px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
      }
      .modal-box button:hover { background: rgba(237,124,90,0.85); border-color: #1c1c1c; }
      .modal-box button svg { width: 36px; height: 36px; fill: white; }

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

    // Top bar
    const topBar = document.createElement('div');
    topBar.id = 'topBar';
    const instr = document.createElement('span');
    instr.id = 'instruction';
    instr.textContent = 'Drag the words to the correct category.';
    topBar.appendChild(instr);
    const attemptsDisplay = document.createElement('span');
    attemptsDisplay.id = 'attemptsDisplay';
    topBar.appendChild(attemptsDisplay);
    gameArea.appendChild(topBar);

    // Word bank
    const wordBank = document.createElement('div');
    wordBank.id = 'wordBank';
    gameArea.appendChild(wordBank);

    // Categories
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

    // Button row
    const btnRow = document.createElement('div');
    btnRow.id = 'btnRow';
    const checkBtn = document.createElement('button');
    checkBtn.id = 'checkBtn';
    checkBtn.textContent = 'Check Answers';
    btnRow.appendChild(checkBtn);
    gameArea.appendChild(btnRow);

    document.body.appendChild(gameArea);

    // Reset button (floating, shown on win)
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetBtn';
    resetBtn.title = 'Play again';
    resetBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
    document.body.appendChild(resetBtn);

    // Game over modal
    const modal = document.createElement('div');
    modal.id = 'gameOverModal';
    const modalBox = document.createElement('div');
    modalBox.className = 'modal-box';
    const modalText = document.createElement('p');
    modalText.textContent = 'Try Again';
    const modalBtn = document.createElement('button');
    modalBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
    modalBox.appendChild(modalText);
    modalBox.appendChild(modalBtn);
    modal.appendChild(modalBox);
    document.body.appendChild(modal);

    // Attempts toast
    const toast = document.createElement('div');
    toast.id = 'attemptToast';
    document.body.appendChild(toast);

    // Confetti canvas
    const cc = document.createElement('canvas');
    cc.id = 'confettiCanvas';
    document.body.appendChild(cc);

    // Background music
    const bgMusic = document.createElement('audio');
    bgMusic.id = 'bgMusic';
    bgMusic.src = '/puzzle-bg-music.mp3';
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    document.body.appendChild(bgMusic);

    // Drag clone
    const clone = document.createElement('div');
    clone.id = 'dragClone';
    document.body.appendChild(clone);
  }

  // ─── STATE ────────────────────────────────────────────────────────────────
  function initState() {
    placements = {};
    locked = new Set();
    attemptsLeft = MAX_ATTEMPTS;
    allWords.forEach(w => { placements[w] = null; });
    wordOrder = [...allWords];
    for (let i = wordOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordOrder[i], wordOrder[j]] = [wordOrder[j], wordOrder[i]];
    }
  }

  function updateAttemptsDisplay() {
    const el = document.getElementById('attemptsDisplay');
    if (el) el.textContent = `Attempts left: ${attemptsLeft}`;
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

    updateAttemptsDisplay();
  }

  function makeChip(word) {
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    if (locked.has(word)) chip.classList.add('correct');
    chip.textContent = word;
    chip.dataset.word = word;
    if (!locked.has(word) && attemptsLeft > 0) attachDrag(chip);
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
    dragging = null;

    document.getElementById('dragClone').style.display = 'none';
    document.querySelectorAll('.category-zone, #wordBank').forEach(z => z.classList.remove('drag-over'));

    let droppedCat = null;
    document.querySelectorAll('.category-zone').forEach(z => {
      const r = z.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        droppedCat = parseInt(z.dataset.catIndex);
      }
    });

    placements[word] = droppedCat; // null if dropped on bank or outside
    wordOrder = wordOrder.filter(w => w !== word);
    wordOrder.push(word);
    render();
  }

  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);

  // ─── CHECK ANSWERS ────────────────────────────────────────────────────────
  function checkAnswers() {
    if (attemptsLeft <= 0) return;
    attemptsLeft--;
    updateAttemptsDisplay();

    const wrongWords = [];
    let anyCorrect = false;

    W.categories.forEach((c, i) => {
      wordOrder.filter(w => placements[w] === i && !locked.has(w)).forEach(w => {
        if (c.words.includes(w)) {
          locked.add(w);
          anyCorrect = true;
        } else {
          wrongWords.push(w);
        }
      });
    });

    if (anyCorrect) playCorrect();
    if (wrongWords.length > 0) playWrong();

    // Mark correct ones immediately
    render();

    // Animate wrong ones: shake then fly back
    wrongWords.forEach(w => {
      const chip = document.querySelector(`.word-chip[data-word="${w}"]`);
      if (chip) chip.classList.add('incorrect');
    });

    setTimeout(() => {
      wrongWords.forEach(w => {
        const chip = document.querySelector(`.word-chip[data-word="${w}"]`);
        if (chip) chip.classList.add('flying');
      });
      setTimeout(() => {
        wrongWords.forEach(w => {
          placements[w] = null;
          wordOrder = wordOrder.filter(x => x !== w);
          wordOrder.push(w);
        });
        render();

        // Check win
        if (locked.size === allWords.length) {
          setTimeout(() => {
            playWin();
            launchConfetti();
            document.getElementById('resetBtn').classList.add('show');
            document.getElementById('checkBtn').disabled = true;
          }, 200);
          return;
        }

        // Not a win — show attempts toast
        if (attemptsLeft > 0) showAttemptsToast();

        // Check loss
        if (attemptsLeft <= 0) {
          setTimeout(() => {
            document.getElementById('gameOverModal').classList.add('show');
            document.getElementById('checkBtn').disabled = true;
          }, 300);
        }
      }, 380);
    }, 450);
  }

  // ─── TOAST ────────────────────────────────────────────────────────────────
  let toastTimer = null;
  function showAttemptsToast() {
    const toast = document.getElementById('attemptToast');
    toast.textContent = `Attempts left: ${attemptsLeft}`;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ─── RESET ────────────────────────────────────────────────────────────────
  function reset() {
    document.getElementById('resetBtn').classList.remove('show');
    document.getElementById('gameOverModal').classList.remove('show');
    document.getElementById('checkBtn').disabled = false;
    const cc = document.getElementById('confettiCanvas');
    if (cc) cc.getContext('2d').clearRect(0, 0, cc.width, cc.height);
    if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF = null; }
    initState();
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

  // ─── BOOT ─────────────────────────────────────────────────────────────────
  function boot() {
    buildDOM();
    initState();
    render();
    initMusic();
    document.getElementById('checkBtn').addEventListener('click', checkAnswers);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.querySelector('#gameOverModal button').addEventListener('click', reset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
