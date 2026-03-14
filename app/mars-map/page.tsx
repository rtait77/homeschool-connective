'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const CSS = `
  .mars-stage {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 100vw;
    height: 56.25vw;
    max-height: 100vh;
    max-width: 177.78vh;
    background: url('/mars-lesson-map-blank.jpg') center center / cover no-repeat;
    z-index: 100;
    overflow: hidden;
  }
  .mars-stage .stop {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    overflow: visible;
  }
  .mars-stage .stop-circle {
    position: relative;
    width: 9vw; height: 9vw;
    max-width: 125px; max-height: 125px;
    border-radius: 50%;
    background-color: #1e2d4a;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: 3px solid rgba(255,255,255,0.2);
    transition: transform 0.25s, box-shadow 0.25s, filter 0.4s, border-color 0.4s;
    overflow: hidden;
  }
  .mars-stage .quiz-bg {
    background: linear-gradient(135deg, #2a9db5, #55b6ca);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Nunito', sans-serif;
    font-weight: 900; font-size: 4.5vw; color: white; overflow: visible;
  }
  .mars-stage .quiz-bg.locked-img { filter: grayscale(1) brightness(0.6); }
  .mars-stage .stop.locked .stop-circle {
    filter: grayscale(1) brightness(0.82);
    border-color: rgba(255,255,255,0.15);
    cursor: default;
  }
  .mars-stage .stop.locked { cursor: default !important; }
  .mars-stage .stop.active .stop-circle,
  .mars-stage .stop.completed .stop-circle {
    box-shadow: 0 0 1.5vw rgba(255,210,60,0.75), 0 0 3vw rgba(255,160,0,0.3);
    border-color: rgba(255,210,60,0.8);
  }
  .mars-stage .stop.active:hover .stop-circle,
  .mars-stage .stop.completed:hover .stop-circle { transform: scale(1.12); }
  .mars-stage .lock-badge {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 42%; height: 42%;
    background: rgba(5,12,35,0.75);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid rgba(255,255,255,0.45);
    z-index: 5; pointer-events: none;
  }
  .mars-stage .lock-badge svg { width: 55%; height: 55%; fill: white; }
  @keyframes lockShake {
    0%   { transform: translate(-50%,-50%) rotate(0deg) scale(1);    opacity: 1; }
    20%  { transform: translate(-50%,-50%) rotate(-18deg) scale(1.1); }
    40%  { transform: translate(-50%,-50%) rotate(14deg) scale(1.1);  }
    60%  { transform: translate(-50%,-50%) rotate(-10deg) scale(1.05);}
    80%  { transform: translate(-50%,-50%) rotate(6deg) scale(0.8);   opacity: 0.6; }
    100% { transform: translate(-50%,-50%) rotate(0deg) scale(0);     opacity: 0; }
  }
  @keyframes circleReveal {
    0%   { transform: scale(1);    box-shadow: none; filter: grayscale(1) brightness(0.6); }
    40%  { transform: scale(1.18); }
    70%  { transform: scale(0.95); }
    100% { transform: scale(1);    box-shadow: 0 0 1.5vw rgba(255,210,60,0.75), 0 0 3vw rgba(255,160,0,0.3); filter: grayscale(0) brightness(1); }
  }
  .mars-stage .stop.unlocking .lock-badge  { animation: lockShake    0.55s ease-in  forwards; }
  .mars-stage .stop.unlocking .stop-circle { animation: circleReveal 0.7s 0.35s ease-out forwards; }
  .mars-stage .stop-label {
    margin-top: 2.4vw;
    font-family: 'Nunito', sans-serif;
    font-weight: 800; font-size: 1.2vw; color: #fff;
    text-align: center; text-shadow: 0 1px 6px rgba(0,0,0,0.9);
    line-height: 1.2; pointer-events: none; white-space: nowrap;
    transition: transform 0.2s;
  }
  .mars-stage .stop:hover .stop-label { transform: scale(0.92); }
  .mars-stage .shooting-star {
    position: absolute; height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.95) 100%);
    border-radius: 2px; pointer-events: none; z-index: 1; opacity: 0;
  }
  @keyframes shoot {
    0%   { opacity: 0;   transform: rotate(var(--angle)) translateX(0); }
    12%  { opacity: 1; }
    85%  { opacity: 0.7; }
    100% { opacity: 0;   transform: rotate(var(--angle)) translateX(38vw); }
  }
  .mars-reset-btn {
    position: absolute; bottom: 2.5%; left: 1.5%;
    font-family: 'Nunito', sans-serif; font-size: 0.85vw; font-weight: 800;
    color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.08);
    border: 1.5px solid rgba(255,255,255,0.2); border-radius: 99px;
    padding: 0.35vw 0.9vw; cursor: pointer; letter-spacing: 0.03em;
    transition: background 0.2s, color 0.2s; z-index: 10;
  }
  .mars-reset-btn:hover {
    background: rgba(217,35,67,0.25); color: rgba(255,180,180,0.9);
    border-color: rgba(217,35,67,0.5);
  }
  .mars-reset-modal {
    position: absolute; inset: 0; background: rgba(0,0,0,0.65);
    z-index: 50; display: flex; align-items: center; justify-content: center;
  }
  .mars-reset-box {
    background: #0d1a35; border: 2px solid rgba(255,255,255,0.2);
    border-radius: 1.2vw; padding: 2.5vw 3vw 2vw; max-width: 38vw;
    text-align: center; box-shadow: 0 0.5vw 3vw rgba(0,0,0,0.7);
  }
  .mars-reset-box h2 {
    font-family: 'Nunito', sans-serif; font-size: 1.6vw; font-weight: 900;
    color: #fff; margin-bottom: 0.8vw;
  }
  .mars-reset-box p {
    font-family: 'Nunito', sans-serif; font-size: 1vw; font-weight: 700;
    color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 1.8vw;
  }
  .mars-reset-btns { display: flex; gap: 1vw; justify-content: center; }
  .mars-reset-btns button {
    font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1vw;
    padding: 0.5vw 2vw; border-radius: 99px; border: none; cursor: pointer;
    transition: transform 0.15s;
  }
  .mars-reset-btns button:hover { transform: scale(0.95); }
  .mars-btn-yes { background: #d92343; color: #fff; box-shadow: 0 0.2vw 0.8vw rgba(217,35,67,0.4); }
  .mars-btn-no  { background: rgba(255,255,255,0.15); color: #fff; border: 1.5px solid rgba(255,255,255,0.3); }
  .mars-music-btn {
    position: absolute; bottom: 2.5%; right: 1.5%;
    width: 3.8vw; height: 3.8vw; max-width: 52px; max-height: 52px;
    background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.35);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; z-index: 10;
  }
  .mars-music-btn:hover { background: rgba(255,255,255,0.28); }
  .mars-music-btn svg { width: 50%; height: 50%; fill: white; }
  .mars-music-btn.muted { opacity: 0.45; }
`

const LESSONS = [
  { id: 'all-about-mars', label: 'All About Mars', url: 'https://view.genially.com/69b41bc290484ccdbdd58a43', unlockAfter: null,           audio: 'all about mars.mp3', image: '/mars-circle.png',           quiz: false, pos: { left: '8%',    top: '32%' } },
  { id: 'mars-rovers',    label: 'Mars Rovers',    url: 'https://view.genially.com/69b41d1f49561c5da74e14ca', unlockAfter: 'all-about-mars', audio: 'mars rovers.mp3',    image: '/mars-rover-circle.png',   quiz: false, pos: { left: '23%',   top: '35%' } },
  { id: 'build-a-rover',  label: 'Build a Rover',  url: '/build-a-rover.html',                                 unlockAfter: 'mars-rovers',    audio: 'build a rover.mp3',  image: '/build-a-rover-circle.png',quiz: false, pos: { left: '36%',   top: '42%' } },
  { id: 'marss-moons',    label: "Mars's Moons",   url: 'https://view.genially.com/69b41e63611634c566df4741', unlockAfter: 'build-a-rover',  audio: 'mars moons.mp3',     image: '/mars-moon-circle.png',    quiz: false, pos: { left: '48%',   top: '51%' } },
  { id: 'design-a-moon',  label: 'Design a Moon',  url: '/design-a-moon.html',                                 unlockAfter: 'marss-moons',    audio: 'design a moon.mp3',  image: '/design-a-moon-circle.png',quiz: false, pos: { left: '63%',   top: '57%' } },
  { id: 'quiz',           label: 'Quiz',            url: 'https://view.genially.com/69b41ef449561c5da74f5c90', unlockAfter: 'design-a-moon',  audio: 'quiz.mp3',           image: null,                       quiz: true,  pos: { left: '76.5%', top: '58%' } },
  { id: 'badge',          label: 'Get Your Badge!', url: 'https://view.genially.com/69b41f7141fe907f00bf7e0d', unlockAfter: 'quiz',           audio: 'get your badge.mp3', image: '/badge-circle.png',        quiz: false, pos: { left: '90%',   top: '51%' } },
]

type StopStatus = 'locked' | 'active' | 'completed'

function getCompleted(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('mars_completed') || '[]') } catch { return [] }
}

function calculateStatuses(): Record<string, StopStatus> {
  const completed = getCompleted()
  const statuses: Record<string, StopStatus> = {}
  LESSONS.forEach(lesson => {
    if (completed.includes(lesson.id)) {
      statuses[lesson.id] = 'completed'
    } else if (!lesson.unlockAfter || completed.includes(lesson.unlockAfter)) {
      statuses[lesson.id] = 'active'
    } else {
      statuses[lesson.id] = 'locked'
    }
  })
  return statuses
}

const LOCK_PATH = 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'

function MarsMapContent() {
  const searchParams = useSearchParams()
  const [statuses, setStatuses]       = useState<Record<string, StopStatus>>({})
  const [unlockingId, setUnlockingId] = useState<string | null>(null)
  const [musicOn, setMusicOn]         = useState(false)
  const [resetOpen, setResetOpen]     = useState(false)
  const bgMusicRef = useRef<HTMLAudioElement>(null)
  const hoverAudio = useRef<HTMLAudioElement | null>(null)
  const starTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevBg       = document.body.style.background
    document.body.style.overflow   = 'hidden'
    document.body.style.background = '#0a1428'
    return () => {
      document.body.style.overflow   = prevOverflow
      document.body.style.background = prevBg
    }
  }, [])

  useEffect(() => {
    setStatuses(calculateStatuses())

    const justCompleted = searchParams.get('just-completed')
    if (justCompleted) {
      const next = LESSONS.find(l => l.unlockAfter === justCompleted)
      if (next) {
        setTimeout(() => {
          setUnlockingId(next.id)
          setTimeout(() => setUnlockingId(null), 1200)
        }, 300)
      }
    }

    function spawnStar() {
      const stage = document.getElementById('mars-stage')
      if (!stage) return
      const star = document.createElement('div')
      star.className = 'shooting-star'
      star.style.left  = (Math.random() * 75) + '%'
      star.style.top   = (Math.random() * 55) + '%'
      star.style.width = (5 + Math.random() * 5).toFixed(1) + 'vw'
      const angle = (18 + Math.random() * 18).toFixed(0)
      const dur   = (0.55 + Math.random() * 0.5).toFixed(2)
      star.style.setProperty('--angle', angle + 'deg')
      star.style.animation = `shoot ${dur}s ease-out forwards`
      stage.appendChild(star)
      setTimeout(() => star.remove(), parseFloat(dur) * 1000 + 100)
    }
    function schedule() {
      starTimer.current = setTimeout(() => { spawnStar(); schedule() }, 1800 + Math.random() * 4200)
    }
    schedule()

    const bg = bgMusicRef.current
    if (bg) {
      bg.volume = 0.35
      bg.play().then(() => setMusicOn(true)).catch(() => {
        const start = () => { bg.play(); setMusicOn(true) }
        document.addEventListener('click', start, { once: true })
      })
    }

    return () => { if (starTimer.current) clearTimeout(starTimer.current) }
  }, [searchParams])

  function goLesson(id: string, status: StopStatus) {
    if (status === 'locked') return
    const lesson = LESSONS.find(l => l.id === id)
    if (lesson) window.location.href = lesson.url
  }

  function toggleMusic() {
    const bg = bgMusicRef.current
    if (!bg) return
    if (musicOn) { bg.pause(); setMusicOn(false) }
    else { bg.play(); setMusicOn(true) }
  }

  function onEnter(audio: string, status: StopStatus) {
    if (status === 'locked') return
    if (hoverAudio.current) { hoverAudio.current.pause(); hoverAudio.current.currentTime = 0 }
    hoverAudio.current = new Audio('/' + audio)
    hoverAudio.current.volume = 0.9
    hoverAudio.current.play().catch(() => {})
  }
  function onLeave() {
    if (hoverAudio.current) { hoverAudio.current.pause(); hoverAudio.current.currentTime = 0 }
  }

  function confirmReset() {
    localStorage.removeItem('mars_completed')
    setResetOpen(false)
    setStatuses(calculateStatuses())
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mars-stage" id="mars-stage">

        {LESSONS.map(lesson => {
          const status = statuses[lesson.id] || 'locked'
          const locked = status === 'locked'
          const circleClass = `stop-circle${lesson.quiz ? ` quiz-bg${locked ? ' locked-img' : ''}` : ''}`
          const stopClass   = `stop ${status}${unlockingId === lesson.id ? ' unlocking' : ''}`
          return (
            <div
              key={lesson.id}
              className={stopClass}
              style={{ left: lesson.pos.left, top: lesson.pos.top }}
              onClick={() => goLesson(lesson.id, status)}
              onMouseEnter={() => onEnter(lesson.audio, status)}
              onMouseLeave={onLeave}
            >
              <div
                className={circleClass}
                style={lesson.image ? { backgroundImage: `url('${lesson.image}')` } : undefined}
              >
                {lesson.quiz && '?'}
                {locked && (
                  <div className="lock-badge">
                    <svg viewBox="0 0 24 24"><path d={LOCK_PATH}/></svg>
                  </div>
                )}
              </div>
              <div className="stop-label">{lesson.label}</div>
            </div>
          )
        })}

        <button className="mars-reset-btn" onClick={() => setResetOpen(true)}>↺ Reset Map</button>

        {resetOpen && (
          <div className="mars-reset-modal">
            <div className="mars-reset-box">
              <h2>⚠️ Reset the Map?</h2>
              <p>This will erase all progress and lock every lesson.<br />You&apos;ll have to start from the beginning.<br /><br />Are you sure?</p>
              <div className="mars-reset-btns">
                <button className="mars-btn-yes" onClick={confirmReset}>Yes, Reset</button>
                <button className="mars-btn-no" onClick={() => setResetOpen(false)}>No, Keep Playing</button>
              </div>
            </div>
          </div>
        )}

        <button className={`mars-music-btn${!musicOn ? ' muted' : ''}`} onClick={toggleMusic} title="Toggle music">
          {musicOn
            ? <svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
            : <svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          }
        </button>

        <audio ref={bgMusicRef} src="/puzzle-bg-music.mp3" loop />
      </div>
    </>
  )
}

export default function MarsMapPage() {
  return (
    <Suspense fallback={null}>
      <MarsMapContent />
    </Suspense>
  )
}
