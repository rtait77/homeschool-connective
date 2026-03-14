'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './mars-map.module.css'

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
  const bgMusicRef   = useRef<HTMLAudioElement>(null)
  const hoverAudio   = useRef<HTMLAudioElement | null>(null)
  const starTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cover navbar + lock body scroll
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

  // Init
  useEffect(() => {
    setStatuses(calculateStatuses())

    // Unlock animation
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

    // Shooting stars
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

    // Music
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
    <div className={styles.stage} id="mars-stage">

      {LESSONS.map(lesson => {
        const status  = statuses[lesson.id] || 'locked'
        const locked  = status === 'locked'
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

      {/* Reset */}
      <button className={styles.resetBtn} onClick={() => setResetOpen(true)}>↺ Reset Map</button>

      {resetOpen && (
        <div className={styles.resetModal}>
          <div className={styles.resetModalBox}>
            <h2>⚠️ Reset the Map?</h2>
            <p>This will erase all progress and lock every lesson.<br />You&apos;ll have to start from the beginning.<br /><br />Are you sure?</p>
            <div className={styles.resetModalBtns}>
              <button className={styles.btnYes} onClick={confirmReset}>Yes, Reset</button>
              <button className={styles.btnNo} onClick={() => setResetOpen(false)}>No, Keep Playing</button>
            </div>
          </div>
        </div>
      )}

      {/* Music */}
      <button className={`${styles.musicBtn}${!musicOn ? ` ${styles.muted}` : ''}`} onClick={toggleMusic} title="Toggle music">
        {musicOn
          ? <svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
          : <svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        }
      </button>

      <audio ref={bgMusicRef} src="/puzzle-bg-music.mp3" loop />
    </div>
  )
}

export default function MarsMapPage() {
  return (
    <Suspense fallback={null}>
      <MarsMapContent />
    </Suspense>
  )
}
