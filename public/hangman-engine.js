// hangman-engine.js — Homeschool Connective
// window.HANGMAN = { title, mode ('easy'|'medium'|'hard'), wordBank: [{word, clue, image?}] }
(function () {
  'use strict';
  const cfg      = window.HANGMAN || {};
  const TITLE    = cfg.title    || 'Space Hangman';
  const MODE     = cfg.mode     || 'medium';
  const BANK     = cfg.wordBank || [];
  const MAX_WRONG = MODE === 'hard' ? 4 : 6;

  const THEMES = ['rocket', 'alien', 'astronaut'];
  let themeIdx = 0;
  let usedWords = new Set();

  // Per-round state
  let entry = null;
  let ANSWER = '';
  let guessed = new Set();
  let wrong = 0;
  let won = false, lost = false;

  function pickEntry() {
    if (!BANK.length) return { word: 'EARTH', clue: 'A beautiful blue planet!', image: '/earth.png' };
    let pool = BANK.filter(e => !usedWords.has(e.word));
    if (!pool.length) { usedWords.clear(); pool = [...BANK]; }
    const e = pool[Math.floor(Math.random() * pool.length)];
    usedWords.add(e.word);
    return e;
  }

  // SVG themes for medium/hard
  function rocketSVG(stage, maxWrong) {
    const pieces = ['flame','fins','lower','middle','upper','nose'];
    const n = pieces.length;
    function show(id) {
      const idx = pieces.indexOf(id);
      const remaining = Math.round(n * (maxWrong - stage) / maxWrong);
      return idx < remaining;
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

  function alienSVG(stage, maxWrong) {
    const totalTravel = 108;
    const beamHeight = Math.round(stage * totalTravel / maxWrong);
    const astroY = 175 - beamHeight;
    // At max wrong: person absorbed into ship — hide beam and person
    const absorbed = stage >= maxWrong;
    const showBeam  = stage > 0 && !absorbed;
    const showAstro = !absorbed;
    return `<svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="55" rx="48" ry="14" fill="#6366f1"/>
      <ellipse cx="80" cy="50" rx="30" ry="18" fill="#818cf8"/>
      <ellipse cx="80" cy="44" rx="16" ry="12" fill="#a5b4fc" opacity="0.9"/>
      <ellipse cx="80" cy="66" rx="48" ry="8" fill="#4f46e5" opacity="0.6"/>
      <circle cx="60" cy="68" r="4" fill="#fbbf24"/>
      <circle cx="80" cy="70" r="4" fill="#34d399"/>
      <circle cx="100" cy="68" r="4" fill="#f472b6"/>
      ${showBeam ? `<polygon points="68,75 92,75 ${92 + stage * 4},${75 + beamHeight} ${68 - stage * 4},${75 + beamHeight}" fill="#fde68a" opacity="0.35"/>` : ''}
      ${showAstro ? `<g transform="translate(80, ${astroY})">
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

  function astronautSVG(stage, maxWrong) {
    const driftX = Math.round(stage * 48 / maxWrong);
    const driftY = -Math.round(stage * 24 / maxWrong);
    const tethersLeft = maxWrong - stage;
    return `<svg viewBox="0 0 160 210" width="160" height="210" xmlns="http://www.w3.org/2000/svg">
      <!-- Spacecraft body -->
      <rect x="4" y="82" width="36" height="52" rx="5" fill="#475569"/>
      <!-- Cockpit window -->
      <ellipse cx="22" cy="96" rx="9" ry="7" fill="#bae6fd" opacity="0.75"/>
      <!-- Solar panels left -->
      <rect x="-18" y="95" width="20" height="9" rx="2" fill="#1e40af"/>
      <rect x="-18" y="111" width="20" height="9" rx="2" fill="#1e40af"/>
      <!-- Solar panels right -->
      <rect x="42" y="95" width="20" height="9" rx="2" fill="#1e40af"/>
      <rect x="42" y="111" width="20" height="9" rx="2" fill="#1e40af"/>
      <!-- Engine nozzles -->
      <rect x="9" y="132" width="8" height="7" rx="2" fill="#334155"/>
      <rect x="27" y="132" width="8" height="7" rx="2" fill="#334155"/>
      <!-- Engine glow -->
      <ellipse cx="13" cy="141" rx="4" ry="3" fill="#f97316" opacity="0.6"/>
      <ellipse cx="31" cy="141" rx="4" ry="3" fill="#f97316" opacity="0.6"/>
      <!-- Tethers -->
      ${Array.from({length: tethersLeft}, (_, i) =>
        `<line x1="40" y1="${95 + i * 8}" x2="${55 + driftX}" y2="${100 + driftY + i * 4}" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,2"/>`
      ).join('')}
      <!-- Astronaut (CSS transform so it can be animated independently) -->
      <g id="astro-body" style="transform: translate(${55 + driftX}px, ${60 + driftY}px)">
        <circle cx="20" cy="10" r="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <rect x="12" y="6" width="16" height="12" rx="4" fill="#bae6fd" opacity="0.85"/>
        <rect x="8" y="28" width="24" height="28" rx="6" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="13" y="32" width="14" height="8" rx="2" fill="#94a3b8" opacity="0.5"/>
        <rect x="-4" y="28" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="34" y="28" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="10" y="55" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="22" y="55" width="10" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="8"  y="74" width="13" height="8" rx="4" fill="#94a3b8"/>
        <rect x="20" y="74" width="13" height="8" rx="4" fill="#94a3b8"/>
      </g>
    </svg>`;
  }

  function getThemeSVG() {
    const theme = THEMES[themeIdx % 3];
    if (theme === 'rocket')    return rocketSVG(wrong, MAX_WRONG);
    if (theme === 'alien')     return alienSVG(wrong, MAX_WRONG);
    return astronautSVG(wrong, MAX_WRONG);
  }

  // Easy mode: image reveal
  function buildRevealScene() {
    const N = ANSWER.length;
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

    // Flex rows so last row's tiles stretch to fill — no exposed image corners
    const grid = document.createElement('div');
    grid.id = 'tile-grid';
    grid.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;gap:2px;';

    let tileIdx = 0;
    for (let r = 0; r < rows; r++) {
      const rowEl = document.createElement('div');
      rowEl.style.cssText = 'display:flex;flex:1;gap:2px;';
      const tilesInRow = (r < rows - 1) ? cols : (N - (rows - 1) * cols);
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

  // DOM updates
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
    const kb = document.getElementById('keyboard');
    if (!kb) return;
    kb.innerHTML = '';
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
      kb.appendChild(btn);
    });
  }

  function updateWrongDisplay() {
    const wrongLetters = [...guessed].filter(l => !ANSWER.includes(l));
    const wl = document.getElementById('wrong-letters');
    if (wl) wl.textContent = wrongLetters.length ? 'Wrong: ' + wrongLetters.join(', ') : '';
    const wc = document.getElementById('wrong-count');
    if (wc) wc.textContent = MODE !== 'easy' ? `Wrong guesses: ${wrong} / ${MAX_WRONG}` : '';
  }

  // Game logic
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
    if (MODE === 'easy') {
      revealAllTiles();
    }
    document.getElementById('status-msg').innerHTML = '<span style="color:#34d399">\uD83C\uDF89 You got it!</span>';
    const btn = document.getElementById('resetBtn');
    btn.textContent = 'Play Another';
    btn.classList.add('show');
    document.querySelectorAll('.key:not(:disabled)').forEach(b => b.disabled = true);
  }

  function handleLose() {
    playLose();
    document.getElementById('status-msg').textContent = '';
    const btn = document.getElementById('resetBtn');
    btn.textContent = 'Try Again';
    btn.classList.add('show');
    document.querySelectorAll('.key:not(:disabled)').forEach(b => b.disabled = true);
    const theme = THEMES[themeIdx % 3];
    if (theme === 'alien')     setTimeout(animateAlienEscape, 350);
    if (theme === 'astronaut') setTimeout(animateAstronautFloat, 350);
  }

  function animateAlienEscape() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: 'translate(60px, -350px) scale(0.3)', opacity: 0 }
    ], { duration: 1000, easing: 'ease-in', fill: 'forwards' });
  }

  function animateAstronautFloat() {
    const astro = document.getElementById('astro-body');
    if (!astro) return;
    const sx = 55 + 48; // final drift position
    const sy = 60 - 24;
    astro.animate([
      { transform: `translate(${sx}px, ${sy}px) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${sx + 220}px, ${sy - 160}px) rotate(720deg)`, opacity: 0 }
    ], { duration: 1800, easing: 'ease-in', fill: 'forwards' });
  }

  function animateLaunchImage() {
    const wrap = document.getElementById('reveal-wrap');
    if (!wrap) return;
    wrap.animate([
      { transform: 'translateY(0) scale(1)', opacity: 1 },
      { transform: 'translateY(-300px) scale(0.5)', opacity: 0 }
    ], { duration: 900, easing: 'ease-in', fill: 'forwards' });
  }

  // Round management
  function startRound(e) {
    entry = e;
    ANSWER = e.word.toUpperCase();
    guessed = new Set();
    wrong = 0;
    won = false;
    lost = false;
    const clueEl = document.getElementById('clue');
    if (clueEl) clueEl.textContent = e.clue;
    const statusEl = document.getElementById('status-msg');
    if (statusEl) statusEl.textContent = '';
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) { resetBtn.classList.remove('show'); resetBtn.getAnimations().forEach(a => a.cancel()); }
    const scene = document.getElementById('scene');
    if (scene) scene.getAnimations().forEach(a => a.cancel());
    updateScene();
    updateBlanks();
    updateKeyboard();
    updateWrongDisplay();
  }

  window.resetGame = function () {
    if (MODE !== 'easy') themeIdx++;
    startRound(pickEntry());
  };

  // Confetti
  function launchConfetti() {
    const colors = ['#ed7c5a','#55b6ca','#fbbf24','#34d399','#f472b6','#a78bfa'];
    const container = document.getElementById('confetti-container');
    if (!container) return;
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>.5?'50%':'2px'};left:${Math.random()*100}%;top:-10px;opacity:1;pointer-events:none;`;
      container.appendChild(el);
      const dur = 1.5 + Math.random() * 2;
      el.animate([
        {transform:'translateY(0) rotate(0deg)',opacity:1},
        {transform:`translateY(${window.innerHeight+50}px) rotate(${360+Math.random()*720}deg)`,opacity:0}
      ],{duration:dur*1000,easing:'ease-in',fill:'forwards'}).onfinish = ()=>el.remove();
    }
  }

  // Audio
  let audioCtx=null,musicSrc=null,musicGain=null,musicOn=false;
  function getCtx(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx;}
  function playTone(freq,type,dur,vol){try{const ctx=getCtx(),osc=ctx.createOscillator(),g=ctx.createGain();osc.connect(g);g.connect(ctx.destination);osc.type=type;osc.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);osc.start();osc.stop(ctx.currentTime+dur);}catch(e){}}
  function playCorrect(){playTone(660,'sine',0.18,0.4);setTimeout(()=>playTone(880,'sine',0.18,0.3),120);}
  function playWrong(){playTone(350,'triangle',0.18,0.28);setTimeout(()=>playTone(260,'triangle',0.22,0.22),130);}
  function playWin(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.4,0.35),i*120));}
  function playLose(){[300,250,200,150].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.3,0.3),i*120));}
  async function startMusic(){try{const ctx=getCtx();if(ctx.state==='suspended')await ctx.resume();if(musicSrc){musicSrc.stop();musicSrc=null;}const res=await fetch('/puzzle-bg-music.mp3'),buf=await ctx.decodeAudioData(await res.arrayBuffer());musicSrc=ctx.createBufferSource();musicGain=ctx.createGain();musicSrc.buffer=buf;musicSrc.loop=true;musicGain.gain.value=0.18;musicSrc.connect(musicGain);musicGain.connect(ctx.destination);musicSrc.start();}catch(e){}}
  function stopMusic(){try{if(musicSrc){musicSrc.stop();musicSrc=null;}}catch(e){}}

  // Build DOM
  function buildDOM() {
    const link = document.createElement('link');
    link.rel='stylesheet';
    link.href='https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap';
    document.head.appendChild(link);

    const meta = document.createElement('meta');
    meta.name='viewport';
    meta.content='width=device-width,initial-scale=1.0,maximum-scale=1.0';
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
      #scene-wrap{position:relative;display:flex;justify-content:center;align-items:center;min-height:230px;}
      #blanks-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;}
      .blank{display:inline-flex;flex-direction:column;align-items:center;gap:3px;}
      .blank-letter{font-size:clamp(1.3rem,5vw,2rem);font-weight:900;min-width:28px;text-align:center;height:1.2em;color:#f1f5f9;}
      .blank-line{width:28px;height:3px;background:#55b6ca;border-radius:2px;}
      .blank-space{width:14px;}
      #wrong-letters{font-size:0.85rem;color:#f87171;font-weight:700;text-align:center;min-height:1.2em;}
      .wrong-count{font-size:0.8rem;color:#f87171;font-weight:700;text-align:center;min-height:1.2em;}
      #keyboard{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:420px;}
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
      <div id="scene-wrap">
        <div id="scene"></div>
      </div>
      <button id="resetBtn" onclick="resetGame()">Play Another</button>
      ${MODE !== 'easy' ? '<div id="wrong-count" class="wrong-count"></div>' : ''}
      <div id="blanks-row"></div>
      <div id="wrong-letters"></div>
      <div id="keyboard"></div>
      <div id="status-msg"></div>
    `;
    document.body.appendChild(main);
  }

  function init() {
    buildDOM();
    startRound(pickEntry());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
