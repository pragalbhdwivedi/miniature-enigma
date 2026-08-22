import { useEffect, useMemo, useRef, useState } from 'react'
import { config, copy, couple, events, itinerary, media } from './content'

const TYPE_HI = {
  Mehendi: 'मेहंदी',
  Sangeet: 'संगीत',
  Haldi: 'हल्दी',
  'Pool Party': 'पूल पार्टी',
  'Reception / Jaimal': 'रिसेप्शन / जयमाल',
  Pheras: 'फेरे',
}

function TigerCrest({ compact = false }) {
  return (
    <svg className={`tiger-crest ${compact ? 'compact' : ''}`} viewBox="0 0 200 220" aria-hidden="true">
      <path className="crest-line" d="M33 171C15 142 19 91 45 55M167 171c18-29 14-80-12-116M28 160c25 40 52 52 72 52s47-12 72-52" />
      <path className="crest-line" d="M52 66 36 37l33 13M148 66l16-29-33 13M57 64c6-28 80-28 86 0 5 23-2 72-16 94-8 12-18 20-27 20s-19-8-27-20C59 136 52 87 57 64Z" />
      <path className="crest-line" d="m66 76 22 18-21 4m67-22-22 18 21 4M75 119l25 18 25-18M86 143l14 8 14-8M72 107l14-4m42 4-14-4" />
      <path className="crest-fill" d="M82 111c4-8 11-11 18-11s14 3 18 11c-5 9-11 13-18 13s-13-4-18-13Z" />
      <path className="crest-line" d="M47 178c-14-8-22-18-26-31m132 31c14-8 22-18 26-31M43 187c-15-2-25-10-32-23m146 23c15-2 25-10 32-23" />
    </svg>
  )
}

function Monogram() {
  return <div className="monogram" aria-label="K and A">K<span>&</span>A</div>
}

function useAtmosphere() {
  const ctxRef = useRef(null)
  const gainRef = useRef(null)
  const sourceRef = useRef(null)

  const start = async () => {
    if (ctxRef.current) {
      await ctxRef.current.resume()
      return
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1
      last = (last + 0.025 * white) / 1.025
      data[i] = last * 3.2
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 950
    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = 80
    const gain = ctx.createGain()
    gain.gain.value = 0.035
    source.connect(filter).connect(high).connect(gain).connect(ctx.destination)
    source.start()
    ctxRef.current = ctx
    gainRef.current = gain
    sourceRef.current = source
  }

  const setEnabled = async (enabled) => {
    if (enabled) {
      await start()
      if (gainRef.current) gainRef.current.gain.setTargetAtTime(0.035, ctxRef.current.currentTime, 0.2)
    } else if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.12)
    }
  }

  const snort = () => {
    const ctx = ctxRef.current
    if (!ctx) return
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 260
    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.34, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.018, now + 0.9)
    source.connect(filter).connect(gain).connect(ctx.destination)
    source.start(now)
  }

  useEffect(() => () => {
    sourceRef.current?.stop?.()
    ctxRef.current?.close?.()
  }, [])

  return { start, setEnabled, snort }
}

function App() {
  const [stage, setStage] = useState('side')
  const [side, setSide] = useState(null)
  const [lang, setLang] = useState(null)
  const [introStep, setIntroStep] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [rsvp, setRsvp] = useState({ name: '', guests: 2, status: 'yes', events: {} })
  const atmosphere = useAtmosphere()
  const guestId = useMemo(() => new URLSearchParams(window.location.search).get('g') || '', [])
  const t = copy[lang || 'en']

  const orderedNames = side === 'groom'
    ? [couple.groom, couple.bride]
    : [couple.bride, couple.groom]

  const familyBlocks = side === 'groom'
    ? [t.groomFamily, t.brideFamily]
    : [t.brideFamily, t.groomFamily]

  const chooseSide = (value) => {
    setSide(value)
    setStage('language')
  }

  const chooseLanguage = async (value) => {
    setLang(value)
    setStage('intro')
    setIntroStep(0)
    if (soundOn) await atmosphere.start()
  }

  const advanceIntro = () => {
    if (introStep === 0) {
      setIntroStep(1)
      if (soundOn) atmosphere.snort()
    } else if (introStep === 1) {
      setIntroStep(2)
    } else {
      setStage('passport')
    }
  }

  const toggleSound = async () => {
    const next = !soundOn
    setSoundOn(next)
    await atmosphere.setEnabled(next)
  }

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const toggleRsvpEvent = (id) => {
    setRsvp((prev) => ({ ...prev, events: { ...prev.events, [id]: !prev.events[id] } }))
  }

  const rsvpText = () => {
    const yesEvents = events.filter((event) => rsvp.events[event.id]).map((event) => event.title).join(', ')
    return [
      `RSVP — ${orderedNames.join(' & ')}`,
      `Guest/Family: ${rsvp.name || 'Not entered'}`,
      `Guests: ${rsvp.guests}`,
      `Status: ${rsvp.status === 'yes' ? 'Attending' : 'Unable to attend'}`,
      yesEvents ? `Events: ${yesEvents}` : '',
      guestId ? `Guest code: ${guestId}` : '',
    ].filter(Boolean).join('\n')
  }

  const saveRsvp = async () => {
    const payload = { ...rsvp, guestId, side, language: lang, submittedAt: new Date().toISOString() }
    localStorage.setItem('corbettWeddingRsvp', JSON.stringify(payload))
    if (config.rsvpEndpoint) {
      try {
        await fetch(config.rsvpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (error) {
        console.warn('RSVP endpoint unavailable', error)
      }
    }
    window.alert(lang === 'hi' ? 'आपका RSVP इस डिवाइस पर सुरक्षित कर दिया गया है।' : 'Your RSVP has been saved on this device.')
  }

  const sendWhatsApp = () => {
    const number = config.whatsappNumber.replace(/\D/g, '')
    const base = number ? `https://wa.me/${number}` : 'https://wa.me/'
    window.open(`${base}?text=${encodeURIComponent(rsvpText())}`, '_blank', 'noopener,noreferrer')
  }

  if (stage === 'side') {
    return (
      <main className="screen selection-screen forest-bg">
        <div className="forest-vignette" />
        <section className="selection-content">
          <Monogram />
          <p className="eyebrow">THE CORBETT WEDDING · 24–26 NOV 2026</p>
          <h1>आप किसकी ओर से आमंत्रित हैं?</h1>
          <p className="english-sub">Who are you joining us from?</p>
          <div className="side-grid">
            <button className="passport-choice bride" onClick={() => chooseSide('bride')}>
              <TigerCrest compact />
              <strong>वधू पक्ष</strong><span>BRIDE SIDE</span><small>कृतिका की ओर से आपका स्वागत है</small>
            </button>
            <button className="passport-choice groom" onClick={() => chooseSide('groom')}>
              <TigerCrest compact />
              <strong>वर पक्ष</strong><span>GROOM SIDE</span><small>आशीष की ओर से आपका स्वागत है</small>
            </button>
          </div>
          <p className="microcopy">यह सिर्फ एक निमंत्रण नहीं, एक अनुभव है</p>
        </section>
      </main>
    )
  }

  if (stage === 'language') {
    return (
      <main className="screen selection-screen forest-bg language-screen">
        <button className="back-button" onClick={() => setStage('side')} aria-label="Back">‹</button>
        <section className="selection-content">
          <Monogram />
          <h1>भाषा चुनें</h1>
          <p className="english-sub">CHOOSE YOUR LANGUAGE</p>
          <p className="selection-note">इस विशेष अवसर का अनुभव अपनी पसंदीदा भाषा में करें</p>
          <div className="language-grid">
            <button className="language-card" onClick={() => chooseLanguage('hi')}><TigerCrest compact /><strong>हिंदी</strong><span>HINDI</span></button>
            <button className="language-card wine" onClick={() => chooseLanguage('en')}><TigerCrest compact /><strong>English</strong><span>ENGLISH</span></button>
          </div>
          <button className="sound-pill" onClick={toggleSound}>{soundOn ? '◉' : '○'} {soundOn ? 'ध्वनि चालू / SOUND ON' : 'ध्वनि बंद / SOUND OFF'}</button>
        </section>
      </main>
    )
  }

  if (stage === 'intro') {
    const introText = [t.intro1, t.intro3, t.intro4][introStep]
    return (
      <main className={`screen intro-screen intro-${introStep}`} onClick={advanceIntro} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && advanceIntro()}>
        <div className="intro-media" style={{ backgroundImage: `url(${introStep === 1 ? media.tiger : media.forest})` }} />
        <div className="intro-shade" />
        <button className="sound-float" onClick={(e) => { e.stopPropagation(); toggleSound() }} aria-label="Toggle sound">{soundOn ? '♪' : '×'}</button>
        <div className="intro-content">
          <Monogram />
          <p className="eyebrow">RAMNAGAR · JIM CORBETT</p>
          <h1>{introText}</h1>
          {introStep === 0 && <p>{t.intro2}</p>}
          {introStep === 1 && <div className="tiger-reveal-label">ONE WILD MOMENT</div>}
          {introStep === 2 && <div className="crest-transform"><TigerCrest /></div>}
          <div className="tap-hint">⌁<span>{lang === 'hi' ? 'आगे बढ़ने के लिए टैप करें' : 'Tap to continue'}</span></div>
          <div className="progress-dots">{[0, 1, 2].map((n) => <i key={n} className={n === introStep ? 'active' : ''} />)}</div>
        </div>
      </main>
    )
  }

  if (stage === 'passport') {
    return (
      <main className="screen passport-stage forest-bg">
        <button className="sound-float" onClick={toggleSound}>{soundOn ? '♪' : '×'}</button>
        <section className="passport-stage-content">
          <Monogram />
          <p className="journey-copy">{t.welcomeJourney}</p>
          <div className="passport-cover">
            <div className="passport-corner top" /><div className="passport-corner bottom" />
            <p className="passport-kicker">THE</p>
            <h1>CORBETT<br />WEDDING</h1>
            <div className="cover-crest"><TigerCrest /></div>
            <div className="passport-names"><strong>{orderedNames[0]}</strong><span>&</span><strong>{orderedNames[1]}</strong></div>
            <p>{couple.dates}</p>
            <p className="passport-location">RAMNAGAR · JIM CORBETT</p>
          </div>
          <button className="primary-cta" onClick={() => setStage('site')}>{t.openInvitation} <span>→</span></button>
        </section>
      </main>
    )
  }

  return (
    <div className={`site-shell lang-${lang}`}>
      <header id="home" className="editorial-hero section-dark">
        <div className="hero-photo" />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <Monogram />
          <p className="eyebrow">THE CORBETT WEDDING · {couple.dates}</p>
          <h1>{orderedNames[0]}<span>&</span>{orderedNames[1]}</h1>
          <p>{t.formalInvite}</p>
          <div className="hero-stamp">RAMNAGAR<br />JIM CORBETT</div>
        </div>
      </header>

      <section className="paper-section family-section">
        <p className="section-number">01 · FAMILY</p>
        <h2>{t.familyTitle}</h2>
        <div className="family-grid">
          {familyBlocks.map((text, index) => <article key={text}><span>0{index + 1}</span><p>{text}</p></article>)}
        </div>
        <p className="placeholder-note">{t.tbd}</p>
      </section>

      <section className="story-section section-dark">
        <p className="section-number">02 · STORY</p>
        <div className="story-layout">
          <h2>{t.storyTitle}</h2>
          <p>{t.storyBody}</p>
          <blockquote>{couple.hashtag}</blockquote>
        </div>
      </section>

      <section className="destination-section">
        <div className="destination-image" style={{ backgroundImage: `url(${media.forest})` }} />
        <div className="destination-copy">
          <p className="section-number">03 · DESTINATION</p>
          <h2>{t.destinationTitle}</h2>
          <p>{t.destinationBody}</p>
          <strong>{couple.venue}</strong><span>{couple.destination}</span>
        </div>
      </section>

      <section id="events" className="itinerary-section paper-section">
        <p className="section-number">04 · ITINERARY</p>
        <h2>{t.itineraryTitle}</h2>
        <div className="itinerary-stack">
          {itinerary.map((day) => (
            <article className="itinerary-day" key={day.day}>
              <div className="date-block"><strong>{day.day}</strong><span>{day.month}</span></div>
              <div className="day-content"><h3>{day.title[lang]}</h3>{day.items.map(([en, hi, time]) => <div className="timeline-item" key={en}><span>{lang === 'hi' ? hi : en}</span><time>{time}</time></div>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="event-section section-dark">
        <p className="section-number">05 · CELEBRATIONS</p>
        <h2>{t.eventsTitle}</h2>
        <div className="event-stack">
          {events.map((event, index) => (
            <article className={`event-card mood-${event.mood}`} key={event.id}>
              <div className="event-index">0{index + 1}</div>
              <div><p className="event-type">{lang === 'hi' ? TYPE_HI[event.type] : event.type}</p><h3>{event.title}</h3><p>{event.date} · {event.time}</p></div>
              <span className="event-mark">✦</span>
            </article>
          ))}
        </div>
      </section>

      <section className="venue-section">
        <div className="venue-photo" style={{ backgroundImage: `url(${media.venue})` }} />
        <div className="venue-card"><p className="section-number">06 · VENUE</p><h2>{t.venueTitle}</h2><strong>{couple.venue}</strong><p>{couple.destination}</p><a className="text-link" href={config.mapUrl} target="_blank" rel="noreferrer">{t.location} ↗</a></div>
      </section>

      <section id="stay" className="utility-section paper-section">
        <div className="utility-card"><span>⌂</span><h2>{t.stayTitle}</h2><p>24 Nov check-in · 26 Nov checkout at 11:00 AM</p><small>{t.tbd}</small></div>
        <div id="travel" className="utility-card"><span>⌁</span><h2>{t.travelTitle}</h2><p>{lang === 'hi' ? 'रेलवे · एयरपोर्ट · सड़क मार्ग' : 'Rail · Airport · Road'}</p><small>{t.tbd}</small></div>
        <div className="utility-card"><span>↝</span><h2>{t.transportTitle}</h2><p>{lang === 'hi' ? 'पिकअप · ड्रॉप · सहायता' : 'Pickup · Drop · Assistance'}</p><small>{t.tbd}</small></div>
      </section>

      <section className="gallery-section section-dark">
        <p className="section-number">07 · GALLERY</p><h2>{t.galleryTitle}</h2>
        <div className="gallery-grid">{media.gallery.map((image, index) => <div key={image} className={`gallery-photo photo-${index + 1}`} style={{ backgroundImage: `url(${image})` }}><span>0{index + 1}</span></div>)}</div>
        <p className="placeholder-note">{lang === 'hi' ? 'अंतिम कपल तस्वीरें स्वीकृति के बाद जोड़ी जाएँगी।' : 'Final couple photographs will replace these placeholders after approval.'}</p>
      </section>

      <section id="rsvp" className="rsvp-section paper-section">
        <p className="section-number">08 · RSVP</p><h2>{t.rsvpTitle}</h2>
        <div className="rsvp-form">
          <label>{t.guestName}<input value={rsvp.name} onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })} placeholder={lang === 'hi' ? 'परिवार का नाम' : 'Family name'} /></label>
          <label>{t.guests}<input type="number" min="1" max="12" value={rsvp.guests} onChange={(e) => setRsvp({ ...rsvp, guests: Number(e.target.value) })} /></label>
          <div className="status-toggle"><button className={rsvp.status === 'yes' ? 'active' : ''} onClick={() => setRsvp({ ...rsvp, status: 'yes' })}>{t.attending}</button><button className={rsvp.status === 'no' ? 'active' : ''} onClick={() => setRsvp({ ...rsvp, status: 'no' })}>{t.notAttending}</button></div>
          {rsvp.status === 'yes' && <div className="event-checks">{events.map((event) => <button key={event.id} className={rsvp.events[event.id] ? 'selected' : ''} onClick={() => toggleRsvpEvent(event.id)}><span>{rsvp.events[event.id] ? '✓' : '+'}</span>{event.title}</button>)}</div>}
          <button className="primary-cta whatsapp" onClick={sendWhatsApp}>{t.whatsapp} ↗</button>
          <button className="secondary-cta" onClick={saveRsvp}>{t.save}</button>
        </div>
      </section>

      <footer className="closing-section section-dark">
        <TigerCrest />
        <h2>{t.closing}</h2>
        <p>{orderedNames.join(' & ')}</p>
        <strong>{couple.hashtag}</strong>
        <span>24–26 NOVEMBER 2026 · JIM CORBETT</span>
      </footer>

      <nav className="bottom-nav" aria-label="Wedding navigation">
        <button onClick={() => go('home')}>⌂<span>{t.home}</span></button>
        <button onClick={() => go('events')}>◇<span>{t.events}</span></button>
        <button onClick={() => go('stay')}>▱<span>{t.stay}</span></button>
        <button onClick={() => go('travel')}>⌁<span>{t.travel}</span></button>
        <button onClick={() => go('rsvp')}>♡<span>{t.rsvp}</span></button>
      </nav>
      <button className="site-sound" onClick={toggleSound}>{soundOn ? '♪' : '×'}</button>
    </div>
  )
}

export default App
