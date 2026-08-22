import { useEffect, useMemo, useState } from 'react'
import { config, copy, couple, events, itinerary, media } from './content'
import { audioService } from './utils/audio'

const TYPE_HI = {
  Mehendi: 'मेहंदी',
  Sangeet: 'संगीत',
  Haldi: 'हल्दी',
  'Pool Party': 'पूल पार्टी',
  'Reception / Jaimal': 'रिसेप्शन / जयमाल',
  Pheras: 'फेरे',
}

const SECTION_LABELS = {
  en: {
    family: '01 · FAMILY',
    story: '02 · STORY',
    destination: '03 · DESTINATION',
    itinerary: '04 · ITINERARY',
    celebrations: '05 · CELEBRATIONS',
    venue: '06 · VENUE',
    gallery: '07 · GALLERY',
    rsvp: '08 · RSVP',
  },
  hi: {
    family: '01 · परिवार',
    story: '02 · कहानी',
    destination: '03 · गंतव्य',
    itinerary: '04 · यात्रा कार्यक्रम',
    celebrations: '05 · उत्सव',
    venue: '06 · स्थल',
    gallery: '07 · गैलरी',
    rsvp: '08 · RSVP',
  },
}

const clampGuestCount = (value) => {
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed)) return 1
  return Math.min(12, Math.max(1, parsed))
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
  return <div className="monogram" aria-label="Kritica and Ashish">K<span>&</span>A</div>
}

function App() {
  const [stage, setStage] = useState('side')
  const [side, setSide] = useState(null)
  const [lang, setLang] = useState(null)
  const [introStep, setIntroStep] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [rsvp, setRsvp] = useState({ name: '', guests: 2, status: 'yes', events: {} })
  const guestId = useMemo(() => new URLSearchParams(window.location.search).get('g') || '', [])
  const t = copy[lang || 'en']
  const sectionLabels = SECTION_LABELS[lang || 'en']

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  useEffect(() => () => {
    audioService.destroy()
  }, [])

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

    if (soundOn) {
      const started = await audioService.startAmbience()
      if (!started) setSoundOn(false)
    }
  }

  const advanceIntro = () => {
    if (introStep === 0) {
      setIntroStep(1)
      if (soundOn) audioService.snort()
    } else if (introStep === 1) {
      setIntroStep(2)
    } else {
      setStage('passport')
    }
  }

  const toggleSound = async () => {
    const next = !soundOn
    const success = await audioService.setMuted(!next)
    setSoundOn(next && success)
  }

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const toggleRsvpEvent = (id) => {
    setRsvp((prev) => ({ ...prev, events: { ...prev.events, [id]: !prev.events[id] } }))
  }

  const setAttendance = (status) => {
    setRsvp((prev) => ({
      ...prev,
      status,
      events: status === 'no' ? {} : prev.events,
    }))
  }

  const normalizedRsvp = () => ({
    ...rsvp,
    guests: rsvp.status === 'yes' ? clampGuestCount(rsvp.guests) : 0,
    events: rsvp.status === 'yes' ? rsvp.events : {},
  })

  const rsvpText = () => {
    const clean = normalizedRsvp()
    const yesEvents = events.filter((event) => clean.events[event.id]).map((event) => event.title).join(', ')
    const labels = lang === 'hi'
      ? {
          guest: 'अतिथि/परिवार',
          missing: 'नाम दर्ज नहीं',
          guests: 'अतिथियों की संख्या',
          status: 'स्थिति',
          attending: 'उपस्थित रहेंगे',
          unable: 'उपस्थित नहीं हो पाएँगे',
          events: 'कार्यक्रम',
          code: 'अतिथि कोड',
        }
      : {
          guest: 'Guest/Family',
          missing: 'Not entered',
          guests: 'Guests',
          status: 'Status',
          attending: 'Attending',
          unable: 'Unable to attend',
          events: 'Events',
          code: 'Guest code',
        }

    return [
      `RSVP — ${orderedNames.join(' & ')}`,
      `${labels.guest}: ${clean.name || labels.missing}`,
      clean.status === 'yes' ? `${labels.guests}: ${clean.guests}` : '',
      `${labels.status}: ${clean.status === 'yes' ? labels.attending : labels.unable}`,
      yesEvents ? `${labels.events}: ${yesEvents}` : '',
      guestId ? `${labels.code}: ${guestId}` : '',
    ].filter(Boolean).join('\n')
  }

  const saveRsvp = async () => {
    const clean = normalizedRsvp()
    setRsvp(clean)
    const payload = { ...clean, guestId, side, language: lang, submittedAt: new Date().toISOString() }
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
    const clean = normalizedRsvp()
    setRsvp(clean)
    const number = config.whatsappNumber.replace(/\D/g, '')
    const base = number ? `https://wa.me/${number}` : 'https://wa.me/'
    window.open(`${base}?text=${encodeURIComponent(rsvpText())}`, '_blank', 'noopener,noreferrer')
  }

  const soundLabel = lang === 'hi'
    ? (soundOn ? 'ध्वनि बंद करें' : 'ध्वनि चालू करें')
    : (soundOn ? 'Mute sound' : 'Turn sound on')

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
            <button type="button" className="passport-choice bride" onClick={() => chooseSide('bride')} aria-label="वधू पक्ष, Bride side">
              <TigerCrest compact />
              <strong>वधू पक्ष</strong><span>BRIDE SIDE</span><small>कृतिका की ओर से आपका स्वागत है</small>
            </button>
            <button type="button" className="passport-choice groom" onClick={() => chooseSide('groom')} aria-label="वर पक्ष, Groom side">
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
        <button type="button" className="back-button" onClick={() => setStage('side')} aria-label="Back">‹</button>
        <section className="selection-content">
          <Monogram />
          <h1>भाषा चुनें</h1>
          <p className="english-sub">CHOOSE YOUR LANGUAGE</p>
          <p className="selection-note">इस विशेष अवसर का अनुभव अपनी पसंदीदा भाषा में करें</p>
          <div className="language-grid" aria-label="Language selection">
            <button type="button" className="language-card" onClick={() => chooseLanguage('hi')} aria-label="हिंदी चुनें"><TigerCrest compact /><strong>हिंदी</strong><span>HINDI</span></button>
            <button type="button" className="language-card wine" onClick={() => chooseLanguage('en')} aria-label="Choose English"><TigerCrest compact /><strong>English</strong><span>ENGLISH</span></button>
          </div>
          <button type="button" className="sound-pill" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundLabel}>{soundOn ? '◉' : '○'} {soundOn ? 'ध्वनि चालू / SOUND ON' : 'ध्वनि बंद / SOUND OFF'}</button>
        </section>
      </main>
    )
  }

  if (stage === 'intro') {
    const introText = [t.intro1, t.intro3, t.intro4][introStep]
    const continueLabel = lang === 'hi' ? 'आगे बढ़ने के लिए टैप करें' : 'Tap to continue'

    return (
      <main className={`screen intro-screen intro-${introStep}`} onClick={advanceIntro}>
        <div className="intro-media" style={{ backgroundImage: `url(${introStep === 1 ? media.tiger : media.forest})` }} />
        <div className="intro-shade" />
        <button type="button" className="sound-float" onClick={(event) => { event.stopPropagation(); toggleSound() }} aria-pressed={soundOn} aria-label={soundLabel}>{soundOn ? '♪' : '×'}</button>
        <div className="intro-content">
          <Monogram />
          <p className="eyebrow">RAMNAGAR · JIM CORBETT</p>
          <h1>{introText}</h1>
          {introStep === 0 && <p>{t.intro2}</p>}
          {introStep === 1 && <div className="tiger-reveal-label">{lang === 'hi' ? 'एक अनोखा पल' : 'ONE WILD MOMENT'}</div>}
          {introStep === 2 && <div className="crest-transform"><TigerCrest /></div>}
          <button type="button" className="tap-hint" onClick={(event) => { event.stopPropagation(); advanceIntro() }} aria-label={continueLabel}>⌁<span>{continueLabel}</span></button>
          <div className="progress-dots" aria-label={`${introStep + 1} of 3`}>{[0, 1, 2].map((n) => <i key={n} className={n === introStep ? 'active' : ''} />)}</div>
        </div>
      </main>
    )
  }

  if (stage === 'passport') {
    return (
      <main className="screen passport-stage forest-bg">
        <button type="button" className="sound-float" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundLabel}>{soundOn ? '♪' : '×'}</button>
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
          <button type="button" className="primary-cta" onClick={() => setStage('site')}>{t.openInvitation} <span>→</span></button>
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
        <p className="section-number">{sectionLabels.family}</p>
        <h2>{t.familyTitle}</h2>
        <div className="family-grid">
          {familyBlocks.map((text, index) => <article key={text}><span>0{index + 1}</span><p>{text}</p></article>)}
        </div>
        <p className="placeholder-note">{t.tbd}</p>
      </section>

      <section className="story-section section-dark">
        <p className="section-number">{sectionLabels.story}</p>
        <div className="story-layout">
          <h2>{t.storyTitle}</h2>
          <p>{t.storyBody}</p>
          <blockquote>{couple.hashtag}</blockquote>
        </div>
      </section>

      <section className="destination-section">
        <div className="destination-image" style={{ backgroundImage: `url(${media.forest})` }} />
        <div className="destination-copy">
          <p className="section-number">{sectionLabels.destination}</p>
          <h2>{t.destinationTitle}</h2>
          <p>{t.destinationBody}</p>
          <strong>{couple.venue}</strong><span>{couple.destination}</span>
        </div>
      </section>

      <section id="events" className="itinerary-section paper-section">
        <p className="section-number">{sectionLabels.itinerary}</p>
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
        <p className="section-number">{sectionLabels.celebrations}</p>
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
        <div className="venue-card"><p className="section-number">{sectionLabels.venue}</p><h2>{t.venueTitle}</h2><strong>{couple.venue}</strong><p>{couple.destination}</p><a className="text-link" href={config.mapUrl} target="_blank" rel="noreferrer">{t.location} ↗</a></div>
      </section>

      <section id="stay" className="utility-section paper-section">
        <div className="utility-card"><span>⌂</span><h2>{t.stayTitle}</h2><p>{lang === 'hi' ? '24 नवम्बर चेक-इन · 26 नवम्बर सुबह 11:00 बजे चेकआउट' : '24 Nov check-in · 26 Nov checkout at 11:00 AM'}</p><small>{t.tbd}</small></div>
        <div id="travel" className="utility-card"><span>⌁</span><h2>{t.travelTitle}</h2><p>{lang === 'hi' ? 'रेलवे · एयरपोर्ट · सड़क मार्ग' : 'Rail · Airport · Road'}</p><small>{t.tbd}</small></div>
        <div className="utility-card"><span>↝</span><h2>{t.transportTitle}</h2><p>{lang === 'hi' ? 'पिकअप · ड्रॉप · सहायता' : 'Pickup · Drop · Assistance'}</p><small>{t.tbd}</small></div>
      </section>

      <section className="gallery-section section-dark">
        <p className="section-number">{sectionLabels.gallery}</p><h2>{t.galleryTitle}</h2>
        <div className="gallery-grid">{media.gallery.map((image, index) => <div key={image} className={`gallery-photo photo-${index + 1}`} style={{ backgroundImage: `url(${image})` }}><span>0{index + 1}</span></div>)}</div>
        <p className="placeholder-note">{lang === 'hi' ? 'अंतिम कपल तस्वीरें स्वीकृति के बाद जोड़ी जाएँगी।' : 'Final couple photographs will replace these placeholders after approval.'}</p>
      </section>

      <section id="rsvp" className="rsvp-section paper-section">
        <p className="section-number">{sectionLabels.rsvp}</p><h2>{t.rsvpTitle}</h2>
        <div className="rsvp-form">
          <label htmlFor="rsvp-name">{t.guestName}<input id="rsvp-name" value={rsvp.name} onChange={(event) => setRsvp({ ...rsvp, name: event.target.value })} placeholder={lang === 'hi' ? 'परिवार का नाम' : 'Family name'} autoComplete="name" /></label>
          <label htmlFor="rsvp-guests">{t.guests}<input id="rsvp-guests" type="number" inputMode="numeric" min="1" max="12" value={rsvp.guests} onChange={(event) => setRsvp({ ...rsvp, guests: event.target.value })} onBlur={() => setRsvp((prev) => ({ ...prev, guests: clampGuestCount(prev.guests) }))} /></label>
          <div className="status-toggle" role="group" aria-label={lang === 'hi' ? 'उपस्थिति की स्थिति' : 'Attendance status'}>
            <button type="button" aria-pressed={rsvp.status === 'yes'} className={rsvp.status === 'yes' ? 'active' : ''} onClick={() => setAttendance('yes')}>{t.attending}</button>
            <button type="button" aria-pressed={rsvp.status === 'no'} className={rsvp.status === 'no' ? 'active' : ''} onClick={() => setAttendance('no')}>{t.notAttending}</button>
          </div>
          {rsvp.status === 'yes' && <div className="event-checks" role="group" aria-label={lang === 'hi' ? 'कार्यक्रम चुनें' : 'Select events'}>{events.map((event) => <button type="button" key={event.id} aria-pressed={Boolean(rsvp.events[event.id])} className={rsvp.events[event.id] ? 'selected' : ''} onClick={() => toggleRsvpEvent(event.id)}><span aria-hidden="true">{rsvp.events[event.id] ? '✓' : '+'}</span>{event.title}</button>)}</div>}
          <button type="button" className="primary-cta whatsapp" onClick={sendWhatsApp}>{t.whatsapp} ↗</button>
          <button type="button" className="secondary-cta" onClick={saveRsvp}>{t.save}</button>
        </div>
      </section>

      <footer className="closing-section section-dark">
        <TigerCrest />
        <h2>{t.closing}</h2>
        <p>{orderedNames.join(' & ')}</p>
        <strong>{couple.hashtag}</strong>
        <span>24–26 NOVEMBER 2026 · JIM CORBETT</span>
      </footer>

      <nav className="bottom-nav" aria-label={lang === 'hi' ? 'विवाह नेविगेशन' : 'Wedding navigation'}>
        <button type="button" onClick={() => go('home')}>⌂<span>{t.home}</span></button>
        <button type="button" onClick={() => go('events')}>◇<span>{t.events}</span></button>
        <button type="button" onClick={() => go('stay')}>▱<span>{t.stay}</span></button>
        <button type="button" onClick={() => go('travel')}>⌁<span>{t.travel}</span></button>
        <button type="button" onClick={() => go('rsvp')}>♡<span>{t.rsvp}</span></button>
      </nav>
      <button type="button" className="site-sound" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundLabel}>{soundOn ? '♪' : '×'}</button>
    </div>
  )
}

export default App
