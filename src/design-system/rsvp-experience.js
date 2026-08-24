// Module 20 — Guided RSVP Experience
// Enhances the existing RSVP controls in-place. React / fallback state, WhatsApp handling,
// local persistence and the optional contact-number injector remain the source of truth.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mounted = new WeakMap()
let scanQueued = false
let persistentStep = 0

const STEP_COPY = {
  en: {
    0: ['IDENTITY', 'Your details', 'Tell us who is replying.'],
    1: ['ATTENDANCE', 'Will you be joining us?', 'A simple yes or no is perfect.'],
    2: ['PARTY', 'How many are coming?', 'Include everyone travelling with your invitation.'],
    3: ['CELEBRATIONS', 'Choose your celebrations', 'Select the functions you expect to attend.'],
    4: ['CONFIRM', 'Review your RSVP', 'Check the details, then save or send on WhatsApp.'],
    next: 'CONTINUE', back: 'BACK', journey: 'RSVP · PRIVATE GUEST JOURNEY',
    attending: 'Attending', unable: 'Unable to attend', guest: 'Guest / family', contact: 'Contact',
    guests: 'Guests', events: 'Celebrations', none: 'None selected', code: 'Guest code',
  },
  hi: {
    0: ['पहचान', 'आपकी जानकारी', 'कृपया बताएं कि RSVP कौन भेज रहा है।'],
    1: ['उपस्थिति', 'क्या आप हमारे साथ शामिल होंगे?', 'हाँ या नहीं, बस इतना ही पर्याप्त है।'],
    2: ['अतिथि', 'कितने अतिथि आएँगे?', 'अपने निमंत्रण के साथ आने वाले सभी अतिथियों को शामिल करें।'],
    3: ['उत्सव', 'कार्यक्रम चुनें', 'जिन कार्यक्रमों में आने की संभावना है उन्हें चुनें।'],
    4: ['पुष्टि', 'अपना RSVP जाँचें', 'विवरण जाँचकर सेव करें या WhatsApp पर भेजें।'],
    next: 'आगे', back: 'पीछे', journey: 'RSVP · निजी अतिथि यात्रा',
    attending: 'उपस्थित रहेंगे', unable: 'उपस्थित नहीं हो पाएँगे', guest: 'अतिथि / परिवार', contact: 'संपर्क',
    guests: 'अतिथि', events: 'कार्यक्रम', none: 'कोई कार्यक्रम चयनित नहीं', code: 'अतिथि कोड',
  },
}

function isHindi() { return document.documentElement.lang === 'hi' }
function text() { return STEP_COPY[isHindi() ? 'hi' : 'en'] }
function element(tag, className, value) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (value != null) node.textContent = value
  return node
}

function attendance(form) {
  const buttons = [...form.querySelectorAll('.status-toggle button')]
  const yes = buttons[0]
  const no = buttons[1]
  const yesActive = yes?.getAttribute('aria-pressed') === 'true' || yes?.classList.contains('active')
  const noActive = no?.getAttribute('aria-pressed') === 'true' || no?.classList.contains('active')
  if (noActive) return 'no'
  if (yesActive) return 'yes'
  return 'yes'
}

function sequence(form) { return attendance(form) === 'no' ? [0, 1, 4] : [0, 1, 2, 3, 4] }
function inputs(form) {
  return {
    name: form.querySelector('#rsvp-name, #fallback-name'),
    contact: form.querySelector('#rsvp-contact-number'),
    guests: form.querySelector('#rsvp-guests, #fallback-guests'),
    status: form.querySelector('.status-toggle'),
    events: form.querySelector('.event-checks'),
    whatsapp: form.querySelector('.primary-cta.whatsapp'),
    save: form.querySelector('.secondary-cta'),
  }
}

function selectedEvents(form) {
  return [...form.querySelectorAll('.event-checks button')]
    .filter((button) => button.getAttribute('aria-pressed') === 'true' || button.classList.contains('selected'))
    .map((button) => button.textContent.replace(/^[✓+]/, '').trim())
}

function createSummary() {
  const summary = element('section', 'rsvp-wizard__summary')
  summary.dataset.rsvpStep = '4'
  summary.setAttribute('aria-label', 'RSVP summary')
  ;['guest', 'contact', 'status', 'guests', 'events', 'code'].forEach((key) => {
    const row = element('div', `rsvp-review-row rsvp-review-row--${key}`)
    row.dataset.reviewRow = key
    row.append(element('small', ''), element('strong', ''))
    summary.appendChild(row)
  })
  return summary
}

function createChrome() {
  const root = element('div', 'rsvp-wizard__chrome')
  root.setAttribute('aria-live', 'polite')
  const top = element('div', 'rsvp-wizard__topline')
  const journey = element('span', 'rsvp-wizard__journey')
  const count = element('span', 'rsvp-wizard__count')
  top.append(journey, count)
  const kicker = element('p', 'rsvp-wizard__kicker')
  const title = element('h3', 'rsvp-wizard__title')
  title.tabIndex = -1
  const note = element('p', 'rsvp-wizard__note')
  const progress = element('div', 'rsvp-wizard__progress')
  progress.setAttribute('aria-hidden', 'true')
  const track = element('span', 'rsvp-wizard__track')
  const fill = element('span', 'rsvp-wizard__fill')
  track.appendChild(fill)
  const dots = element('div', 'rsvp-wizard__dots')
  progress.append(track, dots)
  root.append(top, kicker, title, note, progress)
  return { root, journey, count, kicker, title, note, fill, dots }
}

function createNav() {
  const root = element('div', 'rsvp-wizard__nav')
  const back = element('button', 'rsvp-wizard__back')
  const next = element('button', 'rsvp-wizard__next')
  back.type = 'button'; next.type = 'button'
  next.append(element('span', 'rsvp-wizard__next-label'), element('i', '', '→'))
  root.append(back, next)
  return { root, back, next, nextLabel: next.querySelector('.rsvp-wizard__next-label') }
}

function mount(form) {
  if (mounted.has(form)) return mounted.get(form)
  form.classList.add('rsvp-wizard-ready')
  const chrome = createChrome()
  const summary = createSummary()
  const nav = createNav()
  form.prepend(chrome.root)
  form.append(summary, nav.root)
  const section = form.closest('.rsvp-section')
  section?.classList.add('rsvp-experience-ready')

  const state = { form, section, chrome, summary, nav, currentStep: persistentStep, direction: 1 }

  const refreshReview = () => {
    const t = text(), controls = inputs(form), going = attendance(form) === 'yes'
    const events = selectedEvents(form)
    const guestCode = new URLSearchParams(window.location.search).get('g') || ''
    const rows = Object.fromEntries([...summary.querySelectorAll('[data-review-row]')].map((row) => [row.dataset.reviewRow, row]))
    const set = (key, label, value, visible = true) => {
      const row = rows[key]
      if (!row) return
      row.hidden = !visible
      row.querySelector('small').textContent = label
      row.querySelector('strong').textContent = value
    }
    set('guest', t.guest, controls.name?.value?.trim() || '—')
    set('contact', t.contact, controls.contact?.value?.trim() || '—')
    set('status', isHindi() ? 'स्थिति' : 'Status', going ? t.attending : t.unable)
    set('guests', t.guests, controls.guests?.value || '1', going)
    set('events', t.events, events.length ? events.join(' · ') : t.none, going)
    set('code', t.code, guestCode, Boolean(guestCode))
  }

  const classify = () => {
    const controls = inputs(form)
    const nameLabel = controls.name?.closest('label')
    const contactLabel = controls.contact?.closest('label')
    const guestLabel = controls.guests?.closest('label')
    ;[nameLabel, contactLabel].filter(Boolean).forEach((node) => { node.dataset.rsvpStep = '0' })
    if (controls.status) controls.status.dataset.rsvpStep = '1'
    if (guestLabel) guestLabel.dataset.rsvpStep = '2'
    if (controls.events) controls.events.dataset.rsvpStep = '3'
    if (controls.whatsapp) controls.whatsapp.dataset.rsvpStep = '4'
    if (controls.save) controls.save.dataset.rsvpStep = '4'
    summary.dataset.rsvpStep = '4'
  }

  const paint = (focusTitle = false) => {
    classify()
    const seq = sequence(form)
    if (!seq.includes(state.currentStep)) state.currentStep = seq.includes(1) ? 1 : seq[0]
    persistentStep = state.currentStep
    const t = text(), position = Math.max(0, seq.indexOf(state.currentStep)), copy = t[state.currentStep]
    chrome.journey.textContent = t.journey
    chrome.count.textContent = `${String(position + 1).padStart(2, '0')} / ${String(seq.length).padStart(2, '0')}`
    chrome.kicker.textContent = copy[0]; chrome.title.textContent = copy[1]; chrome.note.textContent = copy[2]
    chrome.fill.style.setProperty('--rsvp-progress', seq.length <= 1 ? '1' : String(position / (seq.length - 1)))
    chrome.dots.replaceChildren(...seq.map((step, index) => {
      const dot = element('i', index <= position ? 'is-passed' : '')
      if (step === state.currentStep) dot.classList.add('is-current')
      return dot
    }))
    form.querySelectorAll('[data-rsvp-step]').forEach((node) => {
      const active = Number(node.dataset.rsvpStep) === state.currentStep
      node.hidden = !active
      node.setAttribute('aria-hidden', active ? 'false' : 'true')
    })
    nav.back.hidden = position === 0
    nav.next.hidden = position === seq.length - 1
    nav.back.textContent = t.back
    nav.nextLabel.textContent = t.next
    form.dataset.rsvpCurrentStep = String(state.currentStep)
    form.dataset.rsvpDirection = state.direction > 0 ? 'forward' : 'back'
    refreshReview()
    if (focusTitle) chrome.title.focus({ preventScroll: true })
  }

  const stableStep = (nextStep, direction) => {
    if (nextStep == null || nextStep === state.currentStep) return
    const y = window.scrollY
    state.direction = direction
    state.currentStep = nextStep
    persistentStep = nextStep
    paint(true)
    requestAnimationFrame(() => window.scrollTo(0, y))
  }

  const move = (delta) => {
    const seq = sequence(form)
    const index = Math.max(0, seq.indexOf(state.currentStep))
    stableStep(seq[index + delta], delta)
  }

  const onBack = () => move(-1)
  const onNext = () => move(1)
  const onInteraction = (event) => {
    if (event.target.closest('.status-toggle button, .event-checks button')) {
      window.setTimeout(() => paint(false), 0)
      window.setTimeout(() => paint(false), 90)
    }
  }
  const onInput = () => refreshReview()
  nav.back.addEventListener('click', onBack)
  nav.next.addEventListener('click', onNext)
  form.addEventListener('click', onInteraction)
  form.addEventListener('input', onInput)
  form.addEventListener('change', onInput)

  state.refresh = () => paint(false)
  mounted.set(form, state)
  paint(false)
  return state
}

function scan() {
  document.querySelectorAll('.rsvp-form').forEach((form) => {
    const state = mounted.get(form) || mount(form)
    state?.refresh?.()
  })
}

function mutationMatters(records) {
  return records.some((record) => [...record.addedNodes, ...record.removedNodes].some((node) => {
    if (!(node instanceof Element)) return false
    return node.matches?.('.rsvp-form, .contact-number-field, .status-toggle, .event-checks') ||
      node.querySelector?.('.rsvp-form, .contact-number-field, .status-toggle, .event-checks')
  }))
}

const observer = new MutationObserver((records) => {
  if (!mutationMatters(records) || scanQueued) return
  scanQueued = true
  queueMicrotask(() => { scanQueued = false; scan() })
})

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
