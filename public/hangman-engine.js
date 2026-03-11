// hangman-engine.js — Shared engine for Homeschool Connective hangman games
// Config is passed via window.HANGMAN before this script loads.
//
// window.HANGMAN = {
//   title: 'Space Hangman #1',          // display title
//   clue: 'I\'m thinking of a planet…', // shown above the blanks
//   answer: 'JUPITER',                  // uppercase, spaces allowed
//   mode: 'easy' | 'regular',           // easy = build to win, regular = lose on 6 wrong
//   theme: 'rocket' | 'alien' | 'astronaut',
// }

(function () {
  const cfg = window.HANGMAN || {};
  const ANSWER = (cfg.answer || 'JUPITER').toUpperCase();
  const MODE   = cfg.mode   || 'regular';
  const THEME  = cfg.theme  || 'rocket';
  const MAX_WRONG = 6;

  // ── unique letters in answer (excluding spaces)
  const letters = [...new Set(ANSWER.replace(/ /g, '').split(''))];

  let guessed   = new Set();
  let wrong     = 0;
  let won       = false;
  let lost      = false;

  // ─────────────────────────────────────────────
  //  SVG STAGES  (7 stages: 0 = start … 6 = end)
  // ─────────────────────────────────────────────

  // ROCKET: easy builds it up (stage = correct pieces placed), regular breaks it down
  function rocketSVG(stage, mode) {
    // stage 0-6  (6 pieces total)
    // easy:    stage = number of correct letters placed so far (capped 0-6) → show that many pieces
    // regular: stage = number of wrong guesses → remove pieces from bottom up
    const pieces = [
      // [id, element]  drawn bottom→top so stacking looks right
      // 0 = flame,  1 = base fins,  2 = lower body,  3 = middle body,  4 = upper body,  5 = nose cone
      'flame', 'fins', 'lower', 'middle', 'upper', 'nose',
    ];

    // easy: show pieces 0..stage-1
    // regular: show pieces stage..5  (start with all, remove from bottom)
    function show(id) {
      if (mode === 'easy') {
        return pieces.indexOf(id) < stage;
      } else {
        // regular: we show pieces that haven't been removed yet
        // piece at index i is removed when wrong >= (6 - i)
        // i.e. flame removed on 6th wrong, fins on 5th, etc.
        const idx = pieces.indexOf(id);
        return (6 - idx) > stage; // stage = wrong count
      }
    }

    const showFlame  = show('flame');
    const showFins   = show('fins');
    const showLower  = show('lower');
    const showMiddle = show('middle');
    const showUpper  = show('upper');
    const showNose   = show('nose');

    return `<svg viewBox="0 0 120 200" width="120" height="200" xmlns="http://www.w3.org/2000/svg">
      ${showFlame  ? `<ellipse cx="60" cy="188" rx="14" ry="18" fill="#f97316" opacity="0.9"/>
        <ellipse cx="60" cy="182" rx="8" ry="12" fill="#fbbf24"/>` : ''}
      ${showFins   ? `<polygon points="38,170 50,140 50,170" fill="#3b82f6"/>
        <polygon points="82,170 70,140 70,170" fill="#3b82f6"/>` : ''}
      ${showLower  ? `<rect x="48" y="140" width="24" height="30" rx="3" fill="#60a5fa"/>` : ''}
      ${showMiddle ? `<rect x="48" y="110" width="24" height="32" rx="3" fill="#3b82f6"/>` : ''}
      ${showUpper  ? `<rect x="50" y="80" width="20" height="32" rx="3" fill="#2563eb"/>
        <rect x="54" y="88" width="12" height="16" rx="3" fill="#bae6fd" opacity="0.8"/>` : ''}
      ${showNose   ? `<path d="M60 40 L72 80 L48 80 Z" fill="#1d4ed8"/>` : ''}
    </svg>`;
  }

  // ALIEN SHIP: easy builds ship, regular = tractor beam pulls astronaut up (wrong guesses)
  function alienSVG(stage, mode) {
    // easy: stage = pieces placed (0-6) — build saucer bottom→top
    // regular: stage = wrong guesses — astronaut rises toward ship (0=safe on ground, 6=abducted)
    const beamHeight = mode === 'regular' ? Math.round(stage * 18) : 0;
    const astroY     = mode === 'regular' ? 175 - beamHeight : 175;
    const showBeam   = mode === 'regular' && stage > 0;

    // easy build pieces
    const p = ['landing', 'hull_bottom', 'hull_top', 'dome_base', 'dome', 'lights'];
    function showE(id) { return mode === 'easy' && p.indexOf(id) < stage; }

    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <!-- ship (always visible in regular; built in easy) -->
      ${mode === 'regular' || showE('lights') ? `
        <ellipse cx="80" cy="55" rx="48" ry="14" fill="#6366f1"/>
        <ellipse cx="80" cy="50" rx="30" ry="18" fill="#818cf8"/>
        <ellipse cx="80" cy="44" rx="16" ry="12" fill="#a5b4fc" opacity="0.9"/>
        <ellipse cx="80" cy="66" rx="48" ry="8" fill="#4f46e5" opacity="0.6"/>
        <circle cx="60" cy="68" r="4" fill="#fbbf24"/>
        <circle cx="80" cy="70" r="4" fill="#34d399"/>
        <circle cx="100" cy="68" r="4" fill="#f472b6"/>
      ` : `
        ${showE('hull_bottom') ? `<ellipse cx="80" cy="55" rx="48" ry="14" fill="#6366f1"/>` : ''}
        ${showE('hull_top')    ? `<ellipse cx="80" cy="50" rx="30" ry="18" fill="#818cf8"/>` : ''}
        ${showE('dome_base')   ? `<ellipse cx="80" cy="66" rx="48" ry="8" fill="#4f46e5" opacity="0.6"/>` : ''}
        ${showE('dome')        ? `<ellipse cx="80" cy="44" rx="16" ry="12" fill="#a5b4fc" opacity="0.9"/>` : ''}
        ${showE('lights')      ? `<circle cx="60" cy="68" r="4" fill="#fbbf24"/>
          <circle cx="80" cy="70" r="4" fill="#34d399"/>
          <circle cx="100" cy="68" r="4" fill="#f472b6"/>` : ''}
      `}
      <!-- tractor beam -->
      ${showBeam ? `<polygon points="68,75 92,75 ${92 + stage * 4},${75 + beamHeight} ${68 - stage * 4},${75 + beamHeight}" fill="#fde68a" opacity="0.35"/>` : ''}
      <!-- astronaut -->
      <g transform="translate(${mode === 'regular' ? 80 : 80}, ${astroY})">
        <circle cx="0" cy="-24" r="10" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="-8" y="-14" width="16" height="18" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="-8" y1="-10" x2="-18" y2="-4" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="8"  y1="-10" x2="18"  y2="-4" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="-4" y1="4"   x2="-5"  y2="18" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="4"  y1="4"   x2="5"   y2="18" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="-5" y="-26" width="10" height="7" rx="2" fill="#bae6fd" opacity="0.8"/>
      </g>
    </svg>`;
  }

  // ASTRONAUT DRIFTING: easy = astronaut assembles suit, regular = tethers cut one by one
  function astronautSVG(stage, mode) {
    // easy: stage = suit pieces (0-6)
    // regular: stage = wrong guesses; 6 tethers cut → astronaut drifts (moves right with each cut)
    const driftX = mode === 'regular' ? stage * 8 : 0;
    const driftY = mode === 'regular' ? -(stage * 4) : 0;
    const tethersLeft = mode === 'regular' ? MAX_WRONG - stage : MAX_WRONG;

    const p = ['boots', 'legs', 'torso', 'arms', 'helmet', 'visor'];
    function showE(id) { return mode === 'easy' && p.indexOf(id) < stage; }
    const showAll = mode === 'regular';

    return `<svg viewBox="0 0 160 210" width="160" height="210" xmlns="http://www.w3.org/2000/svg">
      <!-- station anchor (regular only) -->
      ${mode === 'regular' ? `<rect x="5" y="85" width="28" height="40" rx="4" fill="#64748b"/>
        <rect x="1" y="90" width="36" height="8" rx="2" fill="#94a3b8"/>
        <rect x="1" y="108" width="36" height="8" rx="2" fill="#94a3b8"/>` : ''}
      <!-- tethers -->
      ${mode === 'regular' ? Array.from({length: tethersLeft}, (_, i) =>
        `<line x1="33" y1="${92 + i * 6}" x2="${55 + driftX}" y2="${100 + driftY + i * 4}" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,2"/>`
      ).join('') : ''}
      <!-- astronaut body -->
      <g transform="translate(${55 + driftX}, ${60 + driftY})">
        ${showAll || showE('helmet') ? `<circle cx="20" cy="10" r="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>` : ''}
        ${showAll || showE('visor')  ? `<rect x="12" y="6" width="16" height="12" rx="4" fill="#bae6fd" opacity="0.85"/>` : ''}
        ${showAll || showE('torso')  ? `<rect x="8" y="28" width="24" height="28" rx="6" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="13" y="32" width="14" height="8" rx="2" fill="#94a3b8" opacity="0.5"/>` : ''}
        ${showAll || showE('arms')   ? `<rect x="-4" y="28" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="34" y="28" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>` : ''}
        ${showAll || showE('legs')   ? `<rect x="10" y="55" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="22" y="55" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>` : ''}
        ${showAll || showE('boots')  ? `<rect x="8"  y="74" width="13" height="8" rx="4" fill="#94a3b8"/>
          <rect x="20" y="74" width="13" height="8" rx="4" fill="#94a3b8"/>` : ''}
      </g>
    </svg>`;
  }

  function renderScene(stage) {
    if (THEME === 'rocket')    return rocketSVG(stage, MODE);
    if (THEME === 'alien')     return alienSVG(stage, MODE);
    if (THEME === 'astronaut') return astronautSVG(stage, MODE);
    return rocketSVG(stage, MODE);
  }

  // ─────────────────────────────────────────────
  //  CONFETTI  (same as other engines)
  // ─────────────────────────────────────────────
  function launchConfetti() {
    const colors = ['#ed7c5a','#55b6ca','#fbbf24','#34d399','#f472b6','#a78bfa'];
    const container = document.getElementById('confetti-container');
    if (!container) return;
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};
        left:${Math.random()*100}%;top:-10px;opacity:1;pointer-events:none;`;
      container.appendChild(el);
      const dur = 1.5 + Math.random() * 2;
      el.animate([
        {transform:`translateY(0) rotate(0deg)`,opacity:1},
        {transform:`translateY(${window.innerHeight+50}px) rotate(${360+Math.random()*720}deg)`,opacity:0}
      ],{duration:dur*1000,easing:'ease-in',fill:'forwards'}).onfinish = ()=>el.remove();
    }
  }

  // ─────────────────────────────────────────────
  //  AUDIO
  // ─────────────────────────────────────────────
  let audioCtx = null;
  let musicSrc  = null;
  let musicGain = null;
  let musicOn   = true;

  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, type, dur, vol) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type; osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch(e){}
  }

  function playCorrect() { playTone(660, 'sine', 0.18, 0.4); setTimeout(()=>playTone(880,'sine',0.18,0.3),120); }
  function playWrong()   { playTone(200, 'sawtooth', 0.3, 0.35); }
  function playWin()     { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.4,0.35),i*120)); }
  function playLose()    { [300,250,200,150].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.3,0.3),i*120)); }

  async function startMusic() {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      if (musicSrc) { musicSrc.stop(); musicSrc = null; }
      const res  = await fetch('/puzzle-bg-music.mp3');
      const buf  = await ctx.decodeAudioData(await res.arrayBuffer());
      musicSrc   = ctx.createBufferSource();
      musicGain  = ctx.createGain();
      musicSrc.buffer = buf; musicSrc.loop = true;
      musicGain.gain.value = 0.18;
      musicSrc.connect(musicGain); musicGain.connect(ctx.destination);
      musicSrc.start();
    } catch(e){}
  }

  function stopMusic() { try { if (musicSrc) { musicSrc.stop(); musicSrc = null; } } catch(e){} }

  // ─────────────────────────────────────────────
  //  STAGE CALCULATION
  // ─────────────────────────────────────────────
  function getStage() {
    if (MODE === 'easy') {
      // stage = how many unique correct letters found (capped 0-6)
      const correctCount = letters.filter(l => guessed.has(l)).length;
      return Math.min(6, Math.round((correctCount / letters.length) * 6));
    } else {
      return wrong; // 0-6
    }
  }

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  function buildDOM() {
    document.documentElement.style.cssText = 'margin:0;padding:0;height:100%;';
    document.body.style.cssText = 'margin:0;padding:0;min-height:100%;font-family:Nunito,sans-serif;background:#0a0a2e;color:#f1f5f9;display:flex;flex-direction:column;';

    document.head.insertAdjacentHTML('beforeend', `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet">
      <style>
        *{box-sizing:border-box}
        body{background:#0a0a2e url('/space-bg.png') center/cover no-repeat fixed}
        #header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:10px 16px;background:rgba(10,10,46,0.85);backdrop-filter:blur(6px);border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0}
        #header-left{display:flex;gap:8px}
        #header-title{font-size:clamp(0.95rem,3vw,1.2rem);font-weight:900;text-align:center;color:#fff}
        #back-btn{background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:1rem;padding:6px 12px;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:700}
        #music-btn{background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:1.1rem;padding:6px 10px;border-radius:8px;cursor:pointer}
        #main{flex:1;display:flex;flex-direction:column;align-items:center;padding:20px 16px 30px;gap:16px}
        #clue{font-size:clamp(0.85rem,2.5vw,1rem);color:#94a3b8;font-weight:700;text-align:center}
        #scene-wrap{display:flex;justify-content:center;align-items:center;min-height:180px}
        #blanks-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
        .blank{display:inline-flex;flex-direction:column;align-items:center;gap:3px}
        .blank-letter{font-size:clamp(1.3rem,5vw,2rem);font-weight:900;min-width:28px;text-align:center;height:1.2em;color:#f1f5f9}
        .blank-line{width:28px;height:3px;background:#55b6ca;border-radius:2px}
        .blank-space{width:14px}
        #wrong-letters{font-size:0.85rem;color:#f87171;font-weight:700;text-align:center;min-height:1.2em}
        #keyboard{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:420px}
        .key{width:clamp(32px,8vw,42px);height:clamp(32px,8vw,42px);border-radius:8px;border:none;font-family:inherit;font-size:clamp(0.75rem,2.5vw,0.9rem);font-weight:800;cursor:pointer;transition:all 0.15s;background:#1e3a5f;color:#f1f5f9}
        .key:hover:not(:disabled){background:#2563eb;transform:scale(1.05)}
        .key.correct{background:#059669;color:#fff;cursor:default}
        .key.wrong{background:#374151;color:#6b7280;cursor:default}
        #status-msg{font-size:clamp(1rem,3.5vw,1.3rem);font-weight:900;text-align:center;min-height:1.5em}
        #reset-btn{display:none;background:#ed7c5a;color:#fff;border:none;font-family:inherit;font-weight:900;font-size:1rem;padding:12px 28px;border-radius:12px;cursor:pointer}
        #reset-btn:hover{opacity:0.88}
        #confetti-container{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999}
        .wrong-count{font-size:0.8rem;color:#f87171;font-weight:700}
      </style>
    `);

    document.body.innerHTML = `
      <div id="confetti-container"></div>
      <div id="header">
        <div id="header-left">
          <button id="back-btn" onclick="history.back()">← Back</button>
        </div>
        <div id="header-title">${cfg.title || 'Space Hangman'}</div>
        <div style="display:flex;justify-content:flex-end">
          <button id="music-btn" title="Toggle music">♪</button>
        </div>
      </div>
      <div id="main">
        <div id="clue">${cfg.clue || 'Guess the word!'}</div>
        <div id="scene-wrap"><div id="scene"></div></div>
        ${MODE === 'regular' ? '<div id="wrong-count" class="wrong-count"></div>' : ''}
        <div id="blanks-row"></div>
        <div id="wrong-letters"></div>
        <div id="keyboard"></div>
        <div id="status-msg"></div>
        <button id="reset-btn" onclick="resetGame()">Play Again</button>
      </div>
    `;

    document.getElementById('music-btn').addEventListener('click', () => {
      musicOn = !musicOn;
      document.getElementById('music-btn').textContent = musicOn ? '♪' : '🔇';
      if (musicOn) startMusic(); else stopMusic();
    });

    document.addEventListener('touchstart', () => { if (musicOn) startMusic(); }, { once: true });
    document.addEventListener('mousedown',  () => { if (musicOn) startMusic(); }, { once: true });
  }

  function updateScene() {
    document.getElementById('scene').innerHTML = renderScene(getStage());
  }

  function updateBlanks() {
    const row = document.getElementById('blanks-row');
    row.innerHTML = '';
    for (const ch of ANSWER) {
      if (ch === ' ') {
        const sp = document.createElement('div');
        sp.className = 'blank-space';
        row.appendChild(sp);
      } else {
        const div = document.createElement('div');
        div.className = 'blank';
        const letter = document.createElement('div');
        letter.className = 'blank-letter';
        letter.textContent = guessed.has(ch) ? ch : '';
        const line = document.createElement('div');
        line.className = 'blank-line';
        div.appendChild(letter);
        div.appendChild(line);
        row.appendChild(div);
      }
    }
  }

  function updateKeyboard() {
    document.getElementById('keyboard').innerHTML = '';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.textContent = letter;
      if (guessed.has(letter)) {
        btn.classList.add(ANSWER.includes(letter) ? 'correct' : 'wrong');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => guess(letter));
      }
      document.getElementById('keyboard').appendChild(btn);
    });
  }

  function updateWrongLetters() {
    const wrongLetters = [...guessed].filter(l => !ANSWER.includes(l));
    const el = document.getElementById('wrong-letters');
    if (el) el.textContent = wrongLetters.length > 0 ? 'Wrong: ' + wrongLetters.join(', ') : '';
    const wc = document.getElementById('wrong-count');
    if (wc) wc.textContent = MODE === 'regular' ? `Wrong guesses: ${wrong} / ${MAX_WRONG}` : '';
  }

  function checkWin() {
    return [...ANSWER].filter(c => c !== ' ').every(c => guessed.has(c));
  }

  function guess(letter) {
    if (guessed.has(letter) || won || lost) return;
    guessed.add(letter);

    if (!ANSWER.includes(letter)) {
      wrong++;
      playWrong();
    } else {
      playCorrect();
    }

    updateScene();
    updateBlanks();
    updateKeyboard();
    updateWrongLetters();

    if (checkWin()) {
      won = true;
      setTimeout(() => handleWin(), 300);
    } else if (MODE === 'regular' && wrong >= MAX_WRONG) {
      lost = true;
      setTimeout(() => handleLose(), 300);
    }
  }

  function handleWin() {
    playWin();
    launchConfetti();
    document.getElementById('status-msg').innerHTML = `<span style="color:#34d399">🎉 Correct! The answer was <strong>${ANSWER}</strong>!</span>`;
    if (MODE === 'easy') animateLaunch();
    document.getElementById('reset-btn').style.display = 'inline-block';
    // disable remaining keys
    document.querySelectorAll('.key:not(:disabled)').forEach(b => b.disabled = true);
  }

  function handleLose() {
    playLose();
    // reveal answer
    [...ANSWER].filter(c => c !== ' ').forEach(c => guessed.add(c));
    updateBlanks();
    document.getElementById('status-msg').innerHTML = `<span style="color:#f87171">The answer was <strong>${ANSWER}</strong>. Try again!</span>`;
    document.getElementById('reset-btn').style.display = 'inline-block';
    document.querySelectorAll('.key:not(:disabled)').forEach(b => b.disabled = true);
  }

  // Easy mode: rocket/ship/astronaut flies off screen on win
  function animateLaunch() {
    const scene = document.getElementById('scene');
    const dur = THEME === 'rocket' ? 900 : 1000;
    scene.animate([
      { transform: 'translateY(0) scale(1)', opacity: 1 },
      { transform: 'translateY(-300px) scale(0.5)', opacity: 0 }
    ], { duration: dur, easing: 'ease-in', fill: 'forwards' });
  }

  // ─────────────────────────────────────────────
  //  RESET
  // ─────────────────────────────────────────────
  window.resetGame = function () {
    guessed = new Set();
    wrong   = 0;
    won     = false;
    lost    = false;
    document.getElementById('status-msg').textContent = '';
    document.getElementById('reset-btn').style.display = 'none';
    // remove fly-off animation
    const scene = document.getElementById('scene');
    scene.getAnimations().forEach(a => a.cancel());
    updateScene();
    updateBlanks();
    updateKeyboard();
    updateWrongLetters();
  };

  // ─────────────────────────────────────────────
  //  BOOT
  // ─────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    buildDOM();
    updateScene();
    updateBlanks();
    updateKeyboard();
    updateWrongLetters();
  }
})();
