(function () {
  'use strict';

  // ─── CONFIG ───────────────────────────────────────────────────────────────────
  const P = window.PUZZLE;
  const ROWS = P.rows, COLS = P.cols, SNAP_DIST = P.snapDist;
  const TAB_BUMP = 0.30;

  // ─── STATE ────────────────────────────────────────────────────────────────────
  let canvas, ctx, img, imgData;
  let boardW, boardH, pieceW, pieceH;
  let bboxAspect, bboxX, bboxY, bboxW, bboxH, bboxIW, bboxIH, imgOffX, imgOffY, imgDrawW, imgDrawH;
  let pieces = [], groups = {}, nextGID = 0;
  let dragging = null, dragLastX = 0, dragLastY = 0, maxZ = 0;
  let audioCtx = null;

  // ─── DOM INJECTION ────────────────────────────────────────────────────────────
  function buildDOM() {
    // Font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap';
    document.head.appendChild(link);

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        height: 100%;
        overflow: hidden;
      }
      body {
        background: url('/space-bg.png') center center / cover no-repeat fixed;
        font-family: 'Nunito', sans-serif;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        user-select: none;
        -webkit-user-select: none;
      }
      #header {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 16px 8px;
      }
      #backBtn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255,255,255,0.75);
        font-size: 0.85rem;
        font-weight: 700;
        text-decoration: none;
        margin-bottom: 6px;
        transition: color 0.15s;
      }
      #backBtn:hover { color: white; }
      .title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
      }
      .title-row h1 {
        margin-bottom: 0;
      }
      h1 {
        font-size: clamp(1.2rem, 3vw, 1.8rem);
        font-weight: 800;
        color: #FFD700;
        text-align: center;
        margin-bottom: 10px;
        text-shadow: 0 0 24px rgba(255,215,0,0.35);
      }
      #musicBtn {
        background: #ed7c5a;
        border: none;
        border-radius: 50%;
        width: 32px; height: 32px; min-width: 32px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.1s, background 0.15s;
        flex-shrink: 0;
      }
      #musicBtn:hover { background: #d4623f; transform: scale(1.08); }
      #musicBtn svg   { width: 16px; height: 16px; fill: white; }
      #musicBtn.playing { background: #FFD700; }
      #musicBtn.playing svg { fill: #1c1c1c; }
      #musicBtn.playing:hover { background: #e6c200; }
      .image-credit {
        font-size: 0.75rem;
        color: rgba(255,255,255,0.6);
        text-align: center;
        letter-spacing: 0.03em;
      }
      #canvasWrap { position: relative; flex-shrink: 0; }
      canvas { display: block; touch-action: none; cursor: default; }
      #confettiCanvas {
        position: absolute; top: 0; left: 0;
        pointer-events: none; z-index: 10;
      }
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
    h1.textContent = P.title;
    titleRow.appendChild(h1);

    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicBtn';
    musicBtn.title = 'Toggle music';
    musicBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
    titleRow.appendChild(musicBtn);

    header.appendChild(titleRow);

    const credit = document.createElement('p');
    credit.className = 'image-credit';
    credit.textContent = P.credit;
    header.appendChild(credit);

    document.body.appendChild(header);

    // Canvas wrap
    const canvasWrap = document.createElement('div');
    canvasWrap.id = 'canvasWrap';

    const gameCanvas = document.createElement('canvas');
    gameCanvas.id = 'gameCanvas';
    canvasWrap.appendChild(gameCanvas);

    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confettiCanvas';
    canvasWrap.appendChild(confettiCanvas);

    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetBtn';
    resetBtn.title = 'Reset puzzle';
    resetBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
    canvasWrap.appendChild(resetBtn);

    document.body.appendChild(canvasWrap);

    // Background music audio
    const bgMusic = document.createElement('audio');
    bgMusic.id = 'bgMusic';
    bgMusic.src = '/puzzle-bg-music.mp3';
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    document.body.appendChild(bgMusic);
  }

  // ─── AUDIO ────────────────────────────────────────────────────────────────────
  function getAC() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function playSnap() {
    try {
      const ac = getAC();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(520, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(260, ac.currentTime + 0.07);
      g.gain.setValueAtTime(0.28, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.14);
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.14);
    } catch(e) {}
  }
  function playWin() {
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

  // ─── GROUPS ───────────────────────────────────────────────────────────────────
  function createGroup(idx) {
    const id = nextGID++;
    groups[id] = new Set([idx]);
    pieces[idx].groupId = id;
  }
  function mergeGroups(idA, idB) {
    if (idA === idB) return;
    groups[idB].forEach(i => { pieces[i].groupId = idA; groups[idA].add(i); });
    delete groups[idB];
  }
  function checkWin() {
    const gids = new Set(pieces.filter(p => !p.invisible).map(p => p.groupId));
    return gids.size === 1;
  }

  // ─── TABS ─────────────────────────────────────────────────────────────────────
  function randEdge() {
    return { dir: Math.random() < 0.5 ? 1 : -1, pos: 0.36 + Math.random() * 0.28, bh: 0.20 + Math.random() * 0.08 };
  }
  function genTabs() {
    const h = [], v = [];
    for (let r = 0; r < ROWS-1; r++) { h[r]=[]; for (let c=0;c<COLS;c++) h[r][c]=randEdge(); }
    for (let r = 0; r < ROWS;   r++) { v[r]=[]; for (let c=0;c<COLS-1;c++) v[r][c]=randEdge(); }
    return {h,v};
  }
  function pieceTabs(r, c, {h,v}) {
    const flip = e => e ? {...e, dir:-e.dir, pos:1-e.pos} : null;
    return {
      top:    r===0      ? null : flip(h[r-1][c]),
      bottom: r===ROWS-1 ? null : h[r][c],
      left:   c===0      ? null : flip(v[r][c-1]),
      right:  c===COLS-1 ? null : v[r][c],
    };
  }

  // ─── JIGSAW EDGE ──────────────────────────────────────────────────────────────
  function jigsawEdge(c2, x1, y1, x2, y2, edge) {
    if (!edge) { c2.lineTo(x2, y2); return; }
    const { dir, pos, bh } = edge;
    const ddx = x2-x1, ddy = y2-y1, len = Math.sqrt(ddx*ddx+ddy*ddy);
    const ex = ddx/len, ey = ddy/len;
    const nx = ey*dir, ny = -ex*dir;
    const p = (t, h) => [x1+ex*len*t+nx*len*h, y1+ey*len*t+ny*len*h];

    const k  = 0.552;
    const sw = bh * 0.14;
    const R  = bh * 0.38;
    const nh = bh - R;

    c2.lineTo(...p(pos - sw, 0));
    c2.bezierCurveTo(...p(pos - sw, nh * 0.5), ...p(pos - R, nh * 0.7), ...p(pos - R, nh));
    c2.bezierCurveTo(...p(pos - R, nh + R*k),  ...p(pos - R*k, bh),     ...p(pos, bh));
    c2.bezierCurveTo(...p(pos + R*k, bh),      ...p(pos + R, nh + R*k), ...p(pos + R, nh));
    c2.bezierCurveTo(...p(pos + R, nh * 0.7),  ...p(pos + sw, nh * 0.5),...p(pos + sw, 0));
    c2.lineTo(x2, y2);
  }

  // ─── PIECE PATH ───────────────────────────────────────────────────────────────
  function makePath(c2, pw, ph, tabs) {
    c2.beginPath();
    c2.moveTo(0, 0);
    jigsawEdge(c2, 0,  0,  pw, 0,  tabs.top);
    jigsawEdge(c2, pw, 0,  pw, ph, tabs.right);
    jigsawEdge(c2, pw, ph, 0,  ph, tabs.bottom);
    jigsawEdge(c2, 0,  ph, 0,  0,  tabs.left);
    c2.closePath();
  }

  // ─── BBOX ─────────────────────────────────────────────────────────────────────
  function computeBBox() {
    const oc = document.createElement('canvas');
    oc.width = img.naturalWidth; oc.height = img.naturalHeight;
    const oc2 = oc.getContext('2d');
    oc2.drawImage(img, 0, 0);
    const d = oc2.getImageData(0, 0, oc.width, oc.height).data;
    let minX = oc.width, minY = oc.height, maxX = 0, maxY = 0;
    for (let y = 0; y < oc.height; y++) {
      for (let x = 0; x < oc.width; x++) {
        if (d[(y * oc.width + x) * 4 + 3] > 20) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    const PAD = Math.floor(Math.min(oc.width, oc.height) * 0.02);
    minX = Math.max(0, minX - PAD); minY = Math.max(0, minY - PAD);
    maxX = Math.min(oc.width - 1, maxX + PAD); maxY = Math.min(oc.height - 1, maxY + PAD);
    bboxX = minX; bboxY = minY;
    bboxW = maxX - minX + 1; bboxH = maxY - minY + 1;
    bboxIW = oc.width; bboxIH = oc.height;
    bboxAspect = bboxW / bboxH;
  }

  // ─── BOARD SIZING ─────────────────────────────────────────────────────────────
  function calcBoard() {
    const maxSize = Math.min(canvas.width, canvas.height) * 0.90;
    if (bboxAspect >= 1) {
      boardW = Math.floor(maxSize);
      boardH = Math.floor(maxSize / bboxAspect);
    } else {
      boardH = Math.floor(maxSize);
      boardW = Math.floor(maxSize * bboxAspect);
    }
    pieceW = boardW / COLS;
    pieceH = boardH / ROWS;
    const scale = boardW / bboxW;
    imgDrawW = Math.round(bboxIW * scale);
    imgDrawH = Math.round(bboxIH * scale);
    imgOffX = -Math.round(bboxX * scale);
    imgOffY = -Math.round(bboxY * scale);
  }

  // ─── IMAGE ANALYSIS ───────────────────────────────────────────────────────────
  function analyzeImage() {
    const oc = document.createElement('canvas');
    oc.width = boardW; oc.height = boardH;
    const oc2 = oc.getContext('2d');
    oc2.drawImage(img, imgOffX, imgOffY, imgDrawW, imgDrawH);
    imgData = oc2.getImageData(0, 0, boardW, boardH);
  }
  function getAlpha(bx, by) {
    const x = Math.floor(bx), y = Math.floor(by);
    if (x < 0 || y < 0 || x >= boardW || y >= boardH) return 0;
    return imgData.data[(y * boardW + x) * 4 + 3];
  }

  // ─── PRE-RENDER ───────────────────────────────────────────────────────────────
  function preRenderPiece(piece) {
    const EXTRA = Math.ceil(Math.max(pieceW, pieceH) * TAB_BUMP * 1.2);
    const oc = document.createElement('canvas');
    oc.width  = pieceW + EXTRA * 2;
    oc.height = pieceH + EXTRA * 2;
    const oc2 = oc.getContext('2d');
    oc2.translate(EXTRA, EXTRA);

    // 1. Clip to jigsaw shape and draw the image
    oc2.save();
    makePath(oc2, pieceW, pieceH, piece.tabs);
    oc2.clip();
    oc2.drawImage(img, imgOffX - piece.col * pieceW, imgOffY - piece.row * pieceH, imgDrawW, imgDrawH);
    oc2.restore();

    // 2. Mask to the image's actual alpha — removes background from outer edges
    oc2.globalCompositeOperation = 'destination-in';
    oc2.drawImage(img, imgOffX - piece.col * pieceW, imgOffY - piece.row * pieceH, imgDrawW, imgDrawH);

    piece.offscreen = oc;
    piece.extra = EXTRA;
  }

  // ─── HIT TEST ─────────────────────────────────────────────────────────────────
  function hitTest(piece, mx, my) {
    const lx = mx - piece.x, ly = my - piece.y;
    const tc = document.createElement('canvas').getContext('2d');
    makePath(tc, pieceW, pieceH, piece.tabs);
    if (!tc.isPointInPath(lx, ly)) return false;
    return getAlpha(piece.col * pieceW + lx, piece.row * pieceH + ly) > 32;
  }
  function pieceAt(mx, my) {
    const sorted = [...pieces].sort((a,b) => b.zIndex - a.zIndex);
    for (const p of sorted) {
      if (p.invisible) continue;
      const buf = Math.max(pieceW,pieceH) * TAB_BUMP * 1.5;
      if (mx<p.x-buf||mx>p.x+pieceW+buf||my<p.y-buf||my>p.y+pieceH+buf) continue;
      if (hitTest(p, mx, my)) return p;
    }
    return null;
  }

  // ─── SNAP ─────────────────────────────────────────────────────────────────────
  function trySnap(movedGID) {
    const ADJ = [
      {dr:-1,dc:0,ox:0,oy:pieceH},{dr:1,dc:0,ox:0,oy:-pieceH},
      {dr:0,dc:-1,ox:pieceW,oy:0},{dr:0,dc:1,ox:-pieceW,oy:0},
    ];
    for (const idx of [...groups[movedGID]]) {
      const piece = pieces[idx];
      for (const {dr,dc,ox,oy} of ADJ) {
        const nr = piece.row+dr, nc = piece.col+dc;
        if (nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
        const neighbor = pieces.find(p=>p.row===nr&&p.col===nc);
        if (!neighbor || neighbor.groupId === movedGID) continue;
        const expX = neighbor.x+ox, expY = neighbor.y+oy;
        if (Math.abs(piece.x-expX)<SNAP_DIST && Math.abs(piece.y-expY)<SNAP_DIST) {
          const sdx = expX-piece.x, sdy = expY-piece.y;
          groups[movedGID].forEach(i => { pieces[i].x += sdx; pieces[i].y += sdy; });
          clampGroup(movedGID, 0, 0);
          mergeGroups(movedGID, neighbor.groupId);
          playSnap();
          return true;
        }
      }
    }
    return false;
  }

  // ─── CLAMP ────────────────────────────────────────────────────────────────────
  function clampGroup(gid, dx, dy) {
    const cw = canvas.width, ch = canvas.height;
    const ox = Math.floor(pieceW * 0.5), oy = Math.floor(pieceH * 0.5);
    for (const i of groups[gid]) {
      const p = pieces[i];
      if (p.x+dx < -ox)          dx = -ox - p.x;
      if (p.x+dx+pieceW > cw+ox) dx = cw+ox - pieceW - p.x;
      if (p.y+dy < -oy)          dy = -oy - p.y;
      if (p.y+dy+pieceH > ch+oy) dy = ch+oy - pieceH - p.y;
    }
    return {dx, dy};
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  function drawPiece(piece) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
    ctx.drawImage(piece.offscreen, piece.x - piece.extra, piece.y - piece.extra);
    ctx.restore();
  }
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    [...pieces].filter(p => !p.invisible).sort((a,b) => a.zIndex - b.zIndex).forEach(drawPiece);
  }

  // ─── SCATTER ──────────────────────────────────────────────────────────────────
  function scatter() {
    const cw = canvas.width, ch = canvas.height;
    const pad = Math.max(pieceW, pieceH) * TAB_BUMP + 4;
    const cellW = (cw - pieceW - pad*2) / COLS;
    const cellH = (ch - pieceH - pad*2) / ROWS;
    const cells = [];
    for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) {
      cells.push({
        x: pad + c*cellW + Math.random()*Math.max(0, cellW-pieceW),
        y: pad + r*cellH + Math.random()*Math.max(0, cellH-pieceH),
      });
    }
    cells.sort(() => Math.random() - 0.5);
    let ci = 0;
    pieces.forEach(p => {
      if (p.invisible) { p.x = -9999; p.y = -9999; p.zIndex = -1; }
      else { p.x = Math.round(cells[ci % cells.length].x); p.y = Math.round(cells[ci % cells.length].y); p.zIndex = ci++; }
    });
  }

  // ─── RESIZE ───────────────────────────────────────────────────────────────────
  function handleResize() {
    const oldCW = canvas.width, oldCH = canvas.height;
    pieces.forEach(p => { p._fx = p.x / oldCW; p._fy = p.y / oldCH; });
    const headerH = document.getElementById('header').offsetHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - headerH;
    const cc = document.getElementById('confettiCanvas');
    cc.width = canvas.width; cc.height = canvas.height;
    calcBoard();
    pieces.forEach(p => { if (!p.invisible) preRenderPiece(p); });
    const ox = Math.floor(pieceW * 0.5), oy = Math.floor(pieceH * 0.5);
    pieces.forEach(p => {
      if (p.invisible) return;
      p.x = Math.round(p._fx * canvas.width);
      p.y = Math.round(p._fy * canvas.height);
      p.x = Math.max(-ox, Math.min(canvas.width + ox - pieceW, p.x));
      p.y = Math.max(-oy, Math.min(canvas.height + oy - pieceH, p.y));
    });
    render();
  }
  let _resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(_resizeTimer); _resizeTimer = setTimeout(handleResize, 200); });

  // ─── SETUP ────────────────────────────────────────────────────────────────────
  function setup() {
    canvas = document.getElementById('gameCanvas');
    ctx    = canvas.getContext('2d');

    const headerH = document.getElementById('header').offsetHeight;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight - headerH;

    const cc = document.getElementById('confettiCanvas');
    cc.width = canvas.width; cc.height = canvas.height;

    calcBoard();
    analyzeImage();

    const tabs = genTabs();
    groups = {}; nextGID = 0; pieces = [];
    for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) {
      const idx = pieces.length;
      pieces.push({ row:r, col:c, tabs:pieceTabs(r,c,tabs), x:0, y:0, zIndex:0, groupId:-1 });
      createGroup(idx);
    }
    pieces.forEach(preRenderPiece);
    pieces.forEach(p => {
      const d = p.offscreen.getContext('2d').getImageData(0, 0, p.offscreen.width, p.offscreen.height).data;
      const total = d.length / 4;
      let filled = 0;
      for (let i = 0; i < total; i++) if (d[i * 4 + 3] > 20) filled++;
      p.invisible = filled / total < 0.03;
    });
    scatter();
    render();
    attachEvents();
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────────
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width/rect.width, sy = canvas.height/rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-rect.left)*sx, y:(src.clientY-rect.top)*sy };
  }
  function onDown(e) {
    e.preventDefault();
    const ac = getAC();
    ac.resume().then(() => {
      const buf = ac.createBuffer(1, 1, 22050);
      const src = ac.createBufferSource();
      src.buffer = buf; src.connect(ac.destination); src.start(0);
    }).catch(() => {});
    const {x,y} = getPos(e);
    const piece = pieceAt(x,y);
    if (!piece) return;
    dragging = { groupId: piece.groupId };
    dragLastX = x; dragLastY = y;
    const z = ++maxZ;
    groups[piece.groupId].forEach(i => pieces[i].zIndex = z);
    canvas.style.cursor = 'grabbing';
    render();
  }
  function onMove(e) {
    const {x,y} = getPos(e);
    if (dragging) {
      e.preventDefault();
      let dx = x-dragLastX, dy = y-dragLastY;
      ({dx,dy} = clampGroup(dragging.groupId, dx, dy));
      groups[dragging.groupId].forEach(i => { pieces[i].x += dx; pieces[i].y += dy; });
      dragLastX = x; dragLastY = y;
      const snapped = trySnap(dragging.groupId);
      if (snapped && checkWin()) {
        setTimeout(() => { playWin(); launchConfetti(); document.getElementById('resetBtn').classList.add('show'); }, 250);
        dragging = null; canvas.style.cursor = 'default';
      }
      render();
    } else {
      canvas.style.cursor = pieceAt(x,y) ? 'grab' : 'default';
    }
  }
  function onUp() {
    if (!dragging) return;
    const snapped = trySnap(dragging.groupId);
    if (snapped) {
      if (checkWin()) {
        setTimeout(() => { playWin(); launchConfetti(); document.getElementById('resetBtn').classList.add('show'); }, 250);
      }
      render();
    }
    dragging = null; canvas.style.cursor = 'default';
  }
  function attachEvents() {
    canvas.addEventListener('mousedown',  onDown);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseup',    onUp);
    canvas.addEventListener('touchstart', onDown, {passive:false});
    window.addEventListener('touchmove',  onMove, {passive:false});
    window.addEventListener('touchend',   onUp);
  }

  // ─── CONFETTI ─────────────────────────────────────────────────────────────────
  const CONFETTI_COLORS = ['#FFD700','#ed7c5a','#55b6ca','#ffffff','#c084fc','#86efac'];
  let confettiParticles=[], confettiRAF=null;
  function launchConfetti() {
    const cc = document.getElementById('confettiCanvas');
    cc.width = canvas.width; cc.height = canvas.height;
    const c2 = cc.getContext('2d');
    confettiParticles = Array.from({length:120}, ()=>({
      x:Math.random()*cc.width, y:Math.random()*-cc.height*0.5,
      w:6+Math.random()*6, h:10+Math.random()*6,
      color:CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
      angle:Math.random()*Math.PI*2, spin:(Math.random()-.5)*0.2,
      vx:(Math.random()-.5)*2.5, vy:2+Math.random()*3, alpha:1,
    }));
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    function animate() {
      c2.clearRect(0,0,cc.width,cc.height);
      let alive=false;
      for (const p of confettiParticles) {
        p.x+=p.vx; p.y+=p.vy; p.angle+=p.spin;
        if (p.y>cc.height*0.7) p.alpha-=0.025;
        if (p.alpha<=0) continue;
        alive=true;
        c2.save(); c2.globalAlpha=p.alpha; c2.translate(p.x,p.y); c2.rotate(p.angle);
        c2.fillStyle=p.color; c2.fillRect(-p.w/2,-p.h/2,p.w,p.h); c2.restore();
      }
      if (alive) confettiRAF=requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── RESET ────────────────────────────────────────────────────────────────────
  function resetPuzzle() {
    document.getElementById('resetBtn').classList.remove('show');
    const cc = document.getElementById('confettiCanvas');
    cc.getContext('2d').clearRect(0,0,cc.width,cc.height);
    if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF=null; }
    groups={}; nextGID=0; maxZ=0;
    const tabs = genTabs();
    pieces.forEach((p,i) => { p.tabs=pieceTabs(p.row,p.col,tabs); p.zIndex=0; createGroup(i); preRenderPiece(p); });
    scatter(); render();
  }

  // ─── MUSIC ────────────────────────────────────────────────────────────────────
  function initMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    let musicOn = false;
    musicBtn.addEventListener('click', () => {
      if (musicOn) { bgMusic.pause(); musicOn=false; musicBtn.classList.remove('playing'); }
      else { bgMusic.volume=0.35; bgMusic.play().catch(()=>{}); musicOn=true; musicBtn.classList.add('playing'); }
    });
  }

  // ─── BOOT ─────────────────────────────────────────────────────────────────────
  function boot() {
    buildDOM();

    document.getElementById('resetBtn').addEventListener('click', resetPuzzle);
    initMusic();

    img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      computeBBox();
      setup();
    };
    img.onerror = () => alert('Could not load puzzle image.');
    img.src = P.image;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
