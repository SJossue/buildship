import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CompareSlider from './CompareSlider.jsx'
import Reveal from '../motion/Reveal.jsx'
import MagneticButton from '../motion/MagneticButton.jsx'
import { LISTINGS, ROOM_LABELS, ROOM_CUES, SPECS } from '../mock/data.js'
import { rawPhoto, restyledPhoto, tourVideo, PLACEHOLDER } from '../assets.js'

// Act 5 — the hero, slider-first (design 08 §2 (08)): the draggable before/after
// leads each room (the credibility proof). The flip-taste morph swaps the
// restyle in place — same room, the other person's taste — the heart of
// "one real house, two divergent tastes." A scoped theater mode dims the
// stage for the reveal; compare-aesthetics stays as a deliberate split-screen.
const OTHER = { jake_v1: 'pablo_v1', pablo_v1: 'jake_v1', guest_v1: 'jake_v1' }

export default function TourView({ profileId, onBack }) {
  const hero = LISTINGS.find((l) => l.hero)
  const [room, setRoom] = useState(hero.rooms[0])
  const [showVideo, setShowVideo] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [compareProfiles, setCompareProfiles] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [theater, setTheater] = useState(false)
  const [shared, setShared] = useState(false)
  const spec = SPECS[profileId]
  const otherSpec = SPECS[OTHER[profileId]]
  const cues = ROOM_CUES[profileId]?.[room] ?? []

  // Selecting a profile in the top bar shows THAT taste — reset any flip/compare.
  useEffect(() => { setFlipped(false); setCompareProfiles(false) }, [profileId])

  const activeProfile = flipped ? OTHER[profileId] : profileId
  const activeSpec = SPECS[activeProfile]
  const flipTarget = flipped ? spec : otherSpec

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/tour/${hero.listing_id}/${profileId}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      /* clipboard unavailable — button stays quiet */
    }
  }

  return (
    <div className="tour" data-theater={theater ? '' : undefined}>
      <div className="tour-topline">
        <button className="back" onClick={onBack}>← Back to conversation</button>
        <button className={`ghost theater-toggle${theater ? ' on' : ''}`} onClick={() => setTheater((t) => !t)}>
          {theater ? '☀ Light' : '◐ Theater'}
        </button>
      </div>

      <Reveal className="head">
        <h1>{hero.title}, in {spec.name}'s style</h1>
        <div className="sub serif">{spec.aesthetic_name} · {spec.lighting_mood}</div>
      </Reveal>

      <div className="proof-line serif">Same windows. Same walls. Your decor.</div>

      <div className="room-tabs">
        {hero.rooms.map((r) => (
          <button key={r} className={`room-tab${r === room ? ' active' : ''}`} onClick={() => setRoom(r)}>
            {r === room && (
              <motion.span
                layoutId="roomPill"
                className="room-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="room-tab-label">{ROOM_LABELS[r] ?? r}</span>
          </button>
        ))}
      </div>

      {compareProfiles ? (
        <div className="profile-compare">
          {[spec, otherSpec].map((s) => (
            <figure key={s.profile_id}>
              <img
                src={restyledPhoto(room, s.profile_id)}
                alt={`${ROOM_LABELS[room] ?? room} — ${s.name}'s style`}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER(`${s.name}'s restyle landing soon`) }}
              />
              <figcaption>
                <strong>{s.name}</strong> · {s.aesthetic_name}
              </figcaption>
            </figure>
          ))}
          <div className="compare-caption serif">One house, two souls — same rooms, same walls.</div>
        </div>
      ) : (
        <div className="hero-stage">
          <CompareSlider
            key={room} /* morph in place on flip; remount only when the room changes */
            original={rawPhoto(room)}
            restyled={restyledPhoto(room, activeProfile)}
            restyledLabel={`${activeSpec.name}'s style`}
          />
          <button
            className={`flip-taste${flipped ? ' on' : ''}`}
            onClick={() => setFlipped((f) => !f)}
          >
            <span className="flip-swatches" aria-hidden>
              {(activeSpec.palette_hex ?? []).slice(0, 4).map((hex, i) => (
                <span key={i} style={{ background: hex }} />
              ))}
            </span>
            Showing <strong>{activeSpec.name}'s</strong> taste — tap to see {flipTarget.name}'s
          </button>
        </div>
      )}

      {cues.length > 0 && (
        <Reveal className="room-cues" delay={0.1}>
          <span className="cues-label">Shaped by your cues:</span>
          {cues.map((c) => <span className="chip" key={c}>{c}</span>)}
        </Reveal>
      )}

      <div className="tour-actions">
        <MagneticButton className="cta" onClick={() => setShowVideo((v) => !v)}>
          {showVideo ? 'Hide the full tour' : '▶ Play the full tour'}
        </MagneticButton>
        <button className="ghost" onClick={() => setCompareProfiles((v) => !v)}>
          {compareProfiles ? 'Back to before / after' : `See both at once: ${spec.name} ⇄ ${otherSpec.name}`}
        </button>
        <a className="ghost" href={tourVideo(profileId)} download={`vista-tour-${profileId}.mp4`}>
          Save tour
        </a>
        <button className="ghost" onClick={share}>{shared ? '✓ Link copied' : 'Share'}</button>
      </div>

      {showVideo && (
        <div className="player-wrap">
          {videoFailed ? (
            <div className="player-fallback">tour video landing soon — stills above are live</div>
          ) : (
            <video
              key={profileId} /* force reload on profile switch */
              src={tourVideo(profileId)}
              controls
              autoPlay
              muted
              onError={() => setVideoFailed(true)}
            />
          )}
        </div>
      )}
    </div>
  )
}
