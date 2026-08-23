import { config, copy, couple, events, itinerary, media } from './content.js'

const root = document.getElementById('root')

if (!root) throw new Error('Wedding invitation root element is missing')

window.__branchFallbackMounted = true

const state = {
  stage: 'side',
  side: null,
  lang: 'en',
  intro: 0,
  rsvp: { name: '', guests: 2, status: 'yes', events: {} },
}

const TYPE_HI = {
  Mehendi: 'मेहंदी', Sangeet: 'संगीत', Haldi: 'हल्दी',
  'Pool Party': 'पूल पार्टी', 'Reception / Jaimal': 'रिसेप्शन / जयमाल', Pheras: 'फेरे',
}

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))

const crest = (compact = false) => `
<svg class="tiger-crest ${compact ? 'compact' : ''}" viewBox="0 0 200 220" aria-hidden="true">
  <path class="crest-line" d="M33 171C15 142 19 91 45 55M167 171c18-29 14-80-12-116M28 160c25 40 52 52 72 52s47-12 72-52" />
  <path class="crest-line" d="M52 66 36 37l33 13M148 66l16-29-33 13M57 64c6-28 80-28 86 0 5 23-2 72-16 94-8 12-18 20-27 20s-19-8-27-20C59 136 52 87 57 64Z" />
  <path class="crest-line" d="m66 76 22 18-21 4m67-22-22 18 21 4M75 119l25 18 25-18M86 143l14 8 14-8M72 107l14-4m42 4-14-4" />
  <path class="crest-fill" d="M82 111c4-8 11-11 18-11s14 3 18 11c-5 9-11 13-18 13s-13-4-18-13Z" />
</svg>`

const monogram = '<div class="monogram" aria-label="Kritica and Ashish">K<span>&amp;</span>A</div>'
const orderedNames = () => state.side === 'groom' ? [couple.groom, couple.bride] : [couple.bride, couple.groom]
const t = () => copy[state.lang || 'en']

function sideScreen() {
  return `<main class="screen selection-screen forest-bg">
    <div class="forest-vignette"></div>
    <section class="selection-content">
      ${monogram}
      <p class="eyebrow">THE CORBETT WEDDING · 24–26 NOV 2026</p>
      <h1>आप किसकी ओर से आमंत्रित हैं?</h1>
      <p class="english-sub">Who are you joining us from?</p>
      <div class="side-grid">
        <button type="button" class="passport-choice bride" data-action="side" data-value="bride">${crest(true)}<strong>वधू पक्ष</strong><span>BRIDE SIDE</span><small>कृतिका की ओर से आपका स्वागत है</small></button>
        <button type="button" class="passport-choice groom" data-action="side" data-value="groom">${crest(true)}<strong>वर पक्ष</strong><span>GROOM SIDE</span><small>आशीष की ओर से आपका स्वागत है</small></button>
      </div>
      <p class="microcopy">यह सिर्फ एक निमंत्रण नहीं, एक अनुभव है</p>
    </section>
  </main>`
}

function languageScreen() {
  return `<main class="screen selection-screen forest-bg language-screen">
    <button type="button" class="back-button" data-action="back" aria-label="Back">‹</button>
    <section class="selection-content">
      ${monogram}<h1>भाषा चुनें</h1><p class="english-sub">CHOOSE YOUR LANGUAGE</p>
      <p class="selection-note">इस विशेष अवसर का अनुभव अपनी पसंदीदा भाषा में करें</p>
      <div class="language-grid">
        <button type="button" class="language-card" data-action="lang" data-value="hi">${crest(true)}<strong>हिंदी</strong><span>HINDI</span></button>
        <button type="button" class="language-card wine" data-action="lang" data-value="en">${crest(true)}<strong>English</strong><span>ENGLISH</span></button>
      </div>
    </section>
  </main>`
}

function introScreen() {
  const texts = [t().intro1, t().intro3, t().intro4]
  const image = state.intro === 1 ? media.tiger : media.forest
  return `<main class="screen intro-screen intro-${state.intro}">
    <div class="intro-media" style="background-image:url('${image}')"></div><div class="intro-shade"></div>
    <div class="intro-content">${monogram}<p class="eyebrow">RAMNAGAR · JIM CORBETT</p>
      <h1>${esc(texts[state.intro])}</h1>
      ${state.intro === 0 ? `<p>${esc(t().intro2)}</p>` : ''}
      ${state.intro === 1 ? '<div class="tiger-reveal-label">ONE WILD MOMENT</div>' : ''}
      ${state.intro === 2 ? `<div class="crest-transform">${crest()}</div>` : ''}
      <button type="button" class="intro-continue" data-action="intro"><span>⌁</span>${state.lang === 'hi' ? 'आगे बढ़ने के लिए टैप करें' : 'Tap to continue'}</button>
      <div class="progress-dots">${[0,1,2].map((n) => `<i class="${n === state.intro ? 'active' : ''}"></i>`).join('')}</div>
    </div>
  </main>`
}

function passportScreen() {
  const names = orderedNames()
  return `<main class="screen passport-stage forest-bg"><section class="passport-stage-content">
    ${monogram}<p class="journey-copy">${esc(t().welcomeJourney)}</p>
    <div class="passport-cover"><p class="passport-kicker">THE</p><h1>CORBETT<br>WEDDING</h1><div class="cover-crest">${crest()}</div>
      <div class="passport-names"><strong>${esc(names[0])}</strong><span>&amp;</span><strong>${esc(names[1])}</strong></div>
      <p>${esc(couple.dates)}</p><p class="passport-location">RAMNAGAR · JIM CORBETT</p>
    </div>
    <button type="button" class="primary-cta" data-action="open">${esc(t().openInvitation)} <span>→</span></button>
  </section></main>`
}

function itineraryHtml() {
  return itinerary.map((day) => `<article class="itinerary-day">
    <div class="date-block"><strong>${day.day}</strong><span>${day.month}</span></div>
    <div class="day-content"><h3>${esc(day.title[state.lang])}</h3>${day.items.map(([en, hi, time]) => `<div class="timeline-item"><span>${esc(state.lang === 'hi' ? hi : en)}</span><time>${esc(time)}</time></div>`).join('')}</div>
  </article>`).join('')
}

function eventsHtml() {
  return events.map((event, index) => `<article class="event-card mood-${event.mood}">
    <div class="event-index">0${index + 1}</div><div><p class="event-type">${esc(state.lang === 'hi' ? TYPE_HI[event.type] : event.type)}</p><h3>${esc(event.title)}</h3><p>${esc(event.date)} · ${esc(event.time)}</p></div><span class="event-mark">✦</span>
  </article>`).join('')
}

function siteScreen() {
  const names = orderedNames()
  const family = state.side === 'groom' ? [t().groomFamily, t().brideFamily] : [t().brideFamily, t().groomFamily]
  return `<div class="site-shell lang-${state.lang}">
    <header id="home" class="editorial-hero section-dark"><div class="hero-photo"></div><div class="hero-overlay"></div><div class="hero-copy">${monogram}<p class="eyebrow">THE CORBETT WEDDING · ${esc(couple.dates)}</p><h1>${esc(names[0])}<span>&amp;</span>${esc(names[1])}</h1><p>${esc(t().formalInvite)}</p><div class="hero-stamp">RAMNAGAR<br>JIM CORBETT</div></div></header>
    <section class="paper-section family-section"><p class="section-number">01 · ${state.lang === 'hi' ? 'परिवार' : 'FAMILY'}</p><h2>${esc(t().familyTitle)}</h2><div class="family-grid">${family.map((text, i) => `<article><span>0${i+1}</span><p>${esc(text)}</p></article>`).join('')}</div><p class="placeholder-note">${esc(t().tbd)}</p></section>
    <section class="story-section section-dark"><p class="section-number">02 · ${state.lang === 'hi' ? 'कहानी' : 'STORY'}</p><div class="story-layout"><h2>${esc(t().storyTitle)}</h2><p>${esc(t().storyBody)}</p><blockquote>${esc(couple.hashtag)}</blockquote></div></section>
    <section class="destination-section"><div class="destination-image" style="background-image:url('${media.forest}')"></div><div class="destination-copy"><p class="section-number">03 · DESTINATION</p><h2>${esc(t().destinationTitle)}</h2><p>${esc(t().destinationBody)}</p><strong>${esc(couple.venue)}</strong><span>${esc(couple.destination)}</span></div></section>
    <section id="events" class="itinerary-section paper-section"><p class="section-number">04 · ${state.lang === 'hi' ? 'यात्रा कार्यक्रम' : 'ITINERARY'}</p><h2>${esc(t().itineraryTitle)}</h2><div class="itinerary-stack">${itineraryHtml()}</div></section>
    <section class="event-section section-dark"><p class="section-number">05 · ${state.lang === 'hi' ? 'उत्सव' : 'CELEBRATIONS'}</p><h2>${esc(t().eventsTitle)}</h2><div class="event-stack">${eventsHtml()}</div></section>
    <section class="venue-section"><div class="venue-photo" style="background-image:url('${media.venue}')"></div><div class="venue-card"><p class="section-number">06 · VENUE</p><h2>${esc(t().venueTitle)}</h2><strong>${esc(couple.venue)}</strong><p>${esc(couple.destination)}</p><a class="text-link" href="${config.mapUrl}" target="_blank" rel="noreferrer">${esc(t().location)} ↗</a></div></section>
    <section id="stay" class="utility-section paper-section"><div class="utility-card"><span>⌂</span><h2>${esc(t().stayTitle)}</h2><p>${state.lang === 'hi' ? '24 नवम्बर चेक-इन · 26 नवम्बर सुबह 11:00 बजे चेकआउट' : '24 Nov check-in · 26 Nov checkout at 11:00 AM'}</p><small>${esc(t().tbd)}</small></div><div id="travel" class="utility-card"><span>⌁</span><h2>${esc(t().travelTitle)}</h2><p>${state.lang === 'hi' ? 'रेलवे · एयरपोर्ट · सड़क मार्ग' : 'Rail · Airport · Road'}</p><small>${esc(t().tbd)}</small></div><div class="utility-card"><span>↝</span><h2>${esc(t().transportTitle)}</h2><p>${state.lang === 'hi' ? 'पिकअप · ड्रॉप · सहायता' : 'Pickup · Drop · Assistance'}</p><small>${esc(t().tbd)}</small></div></section>
    <section class="gallery-section section-dark"><p class="section-number">07 · ${state.lang === 'hi' ? 'गैलरी' : 'GALLERY'}</p><h2>${esc(t().galleryTitle)}</h2><div class="gallery-grid">${media.gallery.map((image, i) => `<div class="gallery-photo photo-${i+1}" style="background-image:url('${image}')"><span>0${i+1}</span></div>`).join('')}</div></section>
    <section id="rsvp" class="rsvp-section paper-section"><p class="section-number">08 · RSVP</p><h2>${esc(t().rsvpTitle)}</h2><div class="rsvp-form">
      <label>${esc(t().guestName)}<input id="fallback-name" value="${esc(state.rsvp.name)}" placeholder="${state.lang === 'hi' ? 'परिवार का नाम' : 'Family name'}"></label>
      <label>${esc(t().guests)}<input id="fallback-guests" type="number" min="1" max="12" value="${state.rsvp.guests}"></label>
      <div class="status-toggle"><button type="button" data-action="status" data-value="yes" class="${state.rsvp.status === 'yes' ? 'active' : ''}">${esc(t().attending)}</button><button type="button" data-action="status" data-value="no" class="${state.rsvp.status === 'no' ? 'active' : ''}">${esc(t().notAttending)}</button></div>
      ${state.rsvp.status === 'yes' ? `<div class="event-checks">${events.map((event) => `<button type="button" data-action="event" data-value="${event.id}" class="${state.rsvp.events[event.id] ? 'selected' : ''}"><span>${state.rsvp.events[event.id] ? '✓' : '+'}</span>${esc(event.title)}</button>`).join('')}</div>` : ''}
      <button type="button" class="primary-cta whatsapp" data-action="whatsapp">${esc(t().whatsapp)} ↗</button>
      <button type="button" class="secondary-cta" data-action="save">${esc(t().save)}</button>
    </div></section>
    <footer class="closing-section section-dark">${crest()}<h2>${esc(t().closing)}</h2><p>${esc(names.join(' & '))}</p><strong>${esc(couple.hashtag)}</strong><span>24–26 NOVEMBER 2026 · JIM CORBETT</span></footer>
    <nav class="bottom-nav" aria-label="Wedding navigation"><button data-go="home">⌂<span>${esc(t().home)}</span></button><button data-go="events">◇<span>${esc(t().events)}</span></button><button data-go="stay">▱<span>${esc(t().stay)}</span></button><button data-go="travel">⌁<span>${esc(t().travel)}</span></button><button data-go="rsvp">♡<span>${esc(t().rsvp)}</span></button></nav>
  </div>`
}

function normalizedRsvp() {
  const parsed = Number.parseInt(String(state.rsvp.guests), 10)
  return { ...state.rsvp, guests: state.rsvp.status === 'yes' ? Math.min(12, Math.max(1, Number.isFinite(parsed) ? parsed : 1)) : 0, events: state.rsvp.status === 'yes' ? state.rsvp.events : {} }
}

function whatsappText() {
  const clean = normalizedRsvp(); const names = orderedNames();
  const selected = events.filter((e) => clean.events[e.id]).map((e) => e.title).join(', ')
  if (state.lang === 'hi') return [`RSVP — ${names.join(' & ')}`, `अतिथि/परिवार: ${clean.name || 'नाम दर्ज नहीं'}`, clean.status === 'yes' ? `अतिथियों की संख्या: ${clean.guests}` : '', `स्थिति: ${clean.status === 'yes' ? 'उपस्थित रहेंगे' : 'उपस्थित नहीं हो पाएँगे'}`, selected ? `कार्यक्रम: ${selected}` : ''].filter(Boolean).join('\n')
  return [`RSVP — ${names.join(' & ')}`, `Guest/Family: ${clean.name || 'Not entered'}`, clean.status === 'yes' ? `Guests: ${clean.guests}` : '', `Status: ${clean.status === 'yes' ? 'Attending' : 'Unable to attend'}`, selected ? `Events: ${selected}` : ''].filter(Boolean).join('\n')
}

function syncInputs() {
  const name = document.getElementById('fallback-name'); const guests = document.getElementById('fallback-guests')
  if (name) state.rsvp.name = name.value
  if (guests) state.rsvp.guests = guests.value
}

function render({ preserveScroll = false } = {}) {
  const previousScrollY = window.scrollY
  document.documentElement.lang = state.lang === 'hi' ? 'hi' : 'en'
  root.innerHTML = state.stage === 'side' ? sideScreen() : state.stage === 'language' ? languageScreen() : state.stage === 'intro' ? introScreen() : state.stage === 'passport' ? passportScreen() : siteScreen()
  if (preserveScroll) {
    requestAnimationFrame(() => window.scrollTo({ top: previousScrollY, left: 0, behavior: 'auto' }))
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
}

root.addEventListener('click', (event) => {
  const go = event.target.closest('[data-go]')
  if (go) { document.getElementById(go.dataset.go)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
  const el = event.target.closest('[data-action]'); if (!el) return
  const { action, value } = el.dataset
  if (action === 'side') { state.side = value; state.stage = 'language'; render() }
  else if (action === 'back') { state.stage = 'side'; render() }
  else if (action === 'lang') { state.lang = value; state.stage = 'intro'; state.intro = 0; render() }
  else if (action === 'intro') { if (state.intro < 2) state.intro += 1; else state.stage = 'passport'; render() }
  else if (action === 'open') { state.stage = 'site'; render() }
  else if (action === 'status') { syncInputs(); state.rsvp.status = value; if (value === 'no') state.rsvp.events = {}; render({ preserveScroll: true }) }
  else if (action === 'event') { syncInputs(); state.rsvp.events[value] = !state.rsvp.events[value]; render({ preserveScroll: true }) }
  else if (action === 'save') { syncInputs(); state.rsvp = normalizedRsvp(); localStorage.setItem('corbettWeddingRsvp', JSON.stringify({ ...state.rsvp, side: state.side, language: state.lang, submittedAt: new Date().toISOString() })); window.alert(state.lang === 'hi' ? 'आपका RSVP इस डिवाइस पर सुरक्षित कर दिया गया है।' : 'Your RSVP has been saved on this device.') }
  else if (action === 'whatsapp') { syncInputs(); state.rsvp = normalizedRsvp(); window.location.assign(`https://api.whatsapp.com/send?phone=919555877000&text=${encodeURIComponent(whatsappText())}`) }
})

render()
