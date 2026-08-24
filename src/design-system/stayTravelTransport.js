// Module 17 — Stay / Travel / Transport
// Practical logistics enhancement. The current planning schedules below were checked on
// 24 Aug 2026 and must be reconfirmed on IRCTC before booking because railway timetables,
// running days and availability may change before the November wedding.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const IRCTC_URL = 'https://www.irctc.co.in/nget/train-search'
const RESORT_ADDRESS = 'Farm No 51, Khushalpur Shah, Chhoi, Ramnagar, Uttarakhand 244715'

const DIRECTIONS = {
  rail: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Ramnagar Railway Station, Uttarakhand')}&destination=${encodeURIComponent(RESORT_ADDRESS)}`,
  airport: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Pantnagar Airport, Uttarakhand')}&destination=${encodeURIComponent(RESORT_ADDRESS)}`,
  delhi: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Delhi, India')}&destination=${encodeURIComponent(RESORT_ADDRESS)}`,
}

const TRAINS = [
  {
    group: 'kunda',
    number: '14241',
    name: 'NAUCHANDI EXP',
    from: 'KHNM · Kunda Harnamganj',
    to: 'MB · Moradabad',
    depart: '19:03',
    arrive: '03:40',
    duration: '8h 37m',
    days: 'DAILY',
    tagEn: 'BEST FROM KUNDA',
    tagHi: 'कुंडा से बेहतर विकल्प',
    noteEn: 'Preferred Kunda rail leg. Continue from Moradabad by coordinated road transfer after RSVP.',
    noteHi: 'कुंडा से प्राथमिक रेल विकल्प। RSVP के बाद मुरादाबाद से सड़क ट्रांसफर समन्वित किया जाएगा।',
  },
  {
    group: 'prayagraj',
    number: '14241',
    name: 'NAUCHANDI EXP',
    from: 'PYGS · Prayagraj Sangam',
    to: 'MB · Moradabad',
    depart: '17:50',
    arrive: '03:40',
    duration: '9h 50m',
    days: 'DAILY',
    tagEn: 'OVERNIGHT',
    tagHi: 'रात्रि यात्रा',
    noteEn: 'Useful for a 23 Nov departure and early 24 Nov arrival at Moradabad.',
    noteHi: '23 नवम्बर प्रस्थान और 24 नवम्बर तड़के मुरादाबाद आगमन के लिए उपयोगी।',
  },
  {
    group: 'prayagraj',
    number: '14113',
    name: 'SFG DDN EXPRESS',
    from: 'SFG · Subedarganj',
    to: 'MB · Moradabad',
    depart: '20:30',
    arrive: '06:53',
    duration: '10h 23m',
    days: 'DAILY',
    tagEn: 'MORNING ARRIVAL',
    tagHi: 'सुबह आगमन',
    noteEn: 'Daily alternative from the Prayagraj area with a morning Moradabad arrival.',
    noteHi: 'प्रयागराज क्षेत्र से दैनिक विकल्प, सुबह मुरादाबाद आगमन।',
  },
  {
    group: 'prayagraj',
    number: '14229',
    name: 'PYGS YNRK EXPRESS',
    from: 'PYGS · Prayagraj Sangam',
    to: 'MB · Moradabad',
    depart: '23:40',
    arrive: '10:32',
    duration: '10h 52m',
    days: 'TUE · THU · SUN',
    tagEn: 'EARLY-ARRIVAL BACKUP',
    tagHi: 'वैकल्पिक विकल्प',
    noteEn: 'Runs Tue/Thu/Sun. Useful only when your travel date matches the operating day.',
    noteHi: 'मंगल/गुरु/रवि को चलती है। यात्रा तिथि मेल खाने पर ही उपयोग करें।',
  },
  {
    group: 'amroha',
    number: '14241',
    name: 'NAUCHANDI EXP',
    from: 'PYGS / KHNM',
    to: 'AMRO · Amroha',
    depart: '17:50 / 19:03',
    arrive: '04:26',
    duration: '10h 36m / 9h 23m',
    days: 'DAILY',
    tagEn: 'AMROHA BACKUP',
    tagHi: 'अमरोहा बैकअप',
    noteEn: 'Nauchandi continues beyond Moradabad to Amroha. Moradabad is still the preferred interchange for Ramnagar.',
    noteHi: 'नौचंडी मुरादाबाद के बाद अमरोहा जाती है। रामनगर के लिए मुरादाबाद प्राथमिक इंटरचेंज है।',
  },
  {
    group: 'amroha',
    number: '15035',
    name: 'UTR SAMPRK KRTI',
    from: 'AMRO · Amroha',
    to: 'RMR · Ramnagar',
    depart: '18:18',
    arrive: '21:00',
    duration: '2h 42m',
    days: 'DAILY',
    tagEn: 'AMROHA → RAMNAGAR',
    tagHi: 'अमरोहा → रामनगर',
    noteEn: 'Direct Ramnagar link from Amroha; useful only if the longer interchange wait suits your plan.',
    noteHi: 'अमरोहा से सीधा रामनगर लिंक; लंबा इंटरचेंज समय आपके कार्यक्रम के अनुकूल हो तभी चुनें।',
  },
  {
    group: 'delhi',
    number: '15035',
    name: 'UTR SAMPRK KRTI',
    from: 'DLI · Old Delhi',
    to: 'RMR · Ramnagar',
    depart: '16:00',
    arrive: '21:00',
    duration: '5h 00m',
    days: 'DAILY',
    tagEn: 'DIRECT · DAY',
    tagHi: 'सीधी · दिन यात्रा',
    noteEn: 'Most convenient daytime direct rail option from Delhi to Ramnagar.',
    noteHi: 'दिल्ली से रामनगर का सुविधाजनक सीधा दिन का रेल विकल्प।',
  },
  {
    group: 'delhi',
    number: '15013',
    name: 'RANIKHET EXP',
    from: 'DLI · Old Delhi',
    to: 'RMR · Ramnagar',
    depart: '22:05',
    arrive: '04:15',
    duration: '6h 10m',
    days: 'DAILY',
    tagEn: 'DIRECT · OVERNIGHT',
    tagHi: 'सीधी · रात्रि यात्रा',
    noteEn: 'Direct overnight option from Delhi, arriving Ramnagar before dawn.',
    noteHi: 'दिल्ली से सीधी रात्रि ट्रेन, तड़के रामनगर आगमन।',
  },
]

let mounted = null
let scanQueued = false

function isHindi() {
  return document.documentElement.lang === 'hi'
}

function copy(en, hi) {
  return isHindi() ? hi : en
}

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

function externalLink(label, href, className = 'logistics-link') {
  const link = element('a', className)
  link.href = href
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.append(element('span', '', label), element('i', '', '↗'))
  return link
}

function createFact(icon, label, value, note) {
  const fact = element('article', 'logistics-fact')
  const symbol = element('span', 'logistics-fact__icon', icon)
  symbol.setAttribute('aria-hidden', 'true')
  const body = element('div', 'logistics-fact__body')
  body.append(
    element('small', '', label),
    element('strong', '', value),
    element('p', '', note),
  )
  fact.append(symbol, body)
  return fact
}

function createTrainCard(train, index) {
  const card = element('article', `rail-option rail-option--${train.group}`)
  card.setAttribute('data-train-number', train.number)

  const top = element('div', 'rail-option__top')
  const number = element('span', 'rail-option__number', train.number)
  const tag = element('span', 'rail-option__tag', isHindi() ? train.tagHi : train.tagEn)
  top.append(number, tag)

  const name = element('strong', 'rail-option__name', train.name)
  const route = element('div', 'rail-option__route')
  const from = element('div', 'rail-option__station')
  from.append(element('small', '', copy('FROM', 'प्रस्थान')), element('strong', '', train.from), element('time', '', train.depart))
  const line = element('div', 'rail-option__line')
  line.append(element('span', '', '→'), element('small', '', train.duration))
  const to = element('div', 'rail-option__station rail-option__station--to')
  to.append(element('small', '', copy('TO', 'आगमन')), element('strong', '', train.to), element('time', '', train.arrive))
  route.append(from, line, to)

  const meta = element('div', 'rail-option__meta')
  meta.append(element('span', '', train.days), element('span', '', `${String(index + 1).padStart(2, '0')} / ${String(TRAINS.length).padStart(2, '0')}`))
  const note = element('p', 'rail-option__note', isHindi() ? train.noteHi : train.noteEn)

  card.append(top, name, route, meta, note)
  return card
}

function createStayPanel() {
  const panel = element('div', 'logistics-panel logistics-panel--stay')
  const lock = element('div', 'stay-lock')
  lock.append(
    element('span', 'stay-lock__mark', '⌂'),
    element('p', 'stay-lock__kicker', copy('PRIVATE STAY DETAILS', 'निजी ठहराव विवरण')),
    element('h3', 'stay-lock__title', copy('Your room details follow your RSVP.', 'आपके कमरे की जानकारी RSVP के बाद साझा होगी।')),
    element('p', 'stay-lock__body', copy(
      'Room allocation, room number and guest-specific stay instructions will be shared only after RSVP confirmation.',
      'कमरे का आवंटन, कमरा नंबर और अतिथि-विशिष्ट ठहराव निर्देश RSVP पुष्टि के बाद ही साझा किए जाएंगे।',
    )),
  )

  const facts = element('div', 'stay-facts')
  facts.append(
    createFact('24', copy('DESTINATION STAY', 'डेस्टिनेशन ठहराव'), '24–26 NOV 2026', copy('Wyndham Garden · Ramnagar', 'Wyndham Garden · रामनगर')),
    createFact('11', copy('CHECKOUT', 'चेकआउट'), '26 NOV · 11:00 AM', copy('Locked itinerary timing', 'निर्धारित यात्रा समय')),
  )

  const rsvpButton = element('button', 'logistics-jump', copy('GO TO RSVP', 'RSVP पर जाएँ'))
  rsvpButton.type = 'button'
  rsvpButton.addEventListener('click', () => document.getElementById('rsvp')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }))

  panel.append(lock, facts, rsvpButton)
  return panel
}

function createTravelPanel() {
  const panel = element('div', 'logistics-panel logistics-panel--travel')
  panel.id = 'travel'

  const summary = element('div', 'travel-summary')
  summary.append(
    createFact('R', copy('NEAREST RAIL', 'निकटतम रेलवे'), 'RAMNAGAR · RMR', copy('≈ 13 km from Wyndham Garden', 'Wyndham Garden से लगभग 13 किमी')),
    createFact('✈', copy('NEAREST AIRPORT', 'निकटतम एयरपोर्ट'), 'PANTNAGAR · PGH', copy('≈ 80 km from the resort', 'रिसॉर्ट से लगभग 80 किमी')),
    createFact('↗', copy('BY ROAD FROM DELHI', 'दिल्ली से सड़क मार्ग'), '≈ 5–6 HOURS', copy('Via Hapur · Gajraula · Moradabad · Kashipur · Ramnagar', 'हापुड़ · गजरौला · मुरादाबाद · काशीपुर · रामनगर मार्ग से')),
  )

  const intro = element('div', 'rail-guide__intro')
  const introCopy = element('div')
  introCopy.append(
    element('p', 'logistics-kicker', copy('RAIL FIELD GUIDE · 8 OPTIONS', 'रेल फील्ड गाइड · 8 विकल्प')),
    element('h3', '', copy('Plan the journey. Book it on IRCTC.', 'यात्रा की योजना यहाँ, बुकिंग IRCTC पर।')),
    element('p', '', copy(
      'For Prayagraj and Kunda guests, Moradabad is the preferred interchange. Amroha is shown as a backup. Delhi has direct Ramnagar trains.',
      'प्रयागराज और कुंडा के अतिथियों के लिए मुरादाबाद प्राथमिक इंटरचेंज है। अमरोहा बैकअप विकल्प है। दिल्ली से रामनगर की सीधी ट्रेनें उपलब्ध हैं।',
    )),
  )
  intro.append(introCopy, externalLink('IRCTC', IRCTC_URL, 'logistics-link logistics-link--irctc'))

  const filters = element('div', 'rail-filters')
  filters.setAttribute('role', 'group')
  filters.setAttribute('aria-label', copy('Filter train options', 'ट्रेन विकल्प फ़िल्टर करें'))
  const filterLabels = [
    ['all', copy('ALL 8', 'सभी 8')],
    ['kunda', copy('KUNDA', 'कुंडा')],
    ['prayagraj', copy('PRAYAGRAJ', 'प्रयागराज')],
    ['amroha', copy('AMROHA', 'अमरोहा')],
    ['delhi', copy('DELHI', 'दिल्ली')],
  ]
  const trainGrid = element('div', 'rail-options')
  TRAINS.forEach((train, index) => trainGrid.appendChild(createTrainCard(train, index)))

  const filter = (group) => {
    filters.querySelectorAll('button').forEach((button) => {
      const active = button.dataset.filter === group
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-pressed', String(active))
    })
    trainGrid.querySelectorAll('.rail-option').forEach((card) => {
      card.hidden = group !== 'all' && !card.classList.contains(`rail-option--${group}`)
    })
  }

  filterLabels.forEach(([key, label], index) => {
    const button = element('button', `rail-filter${index === 0 ? ' is-active' : ''}`, label)
    button.type = 'button'
    button.dataset.filter = key
    button.setAttribute('aria-pressed', String(index === 0))
    button.addEventListener('click', () => filter(key))
    filters.appendChild(button)
  })

  const note = element('div', 'rail-warning')
  note.append(
    element('strong', '', copy('CHECK BEFORE BOOKING', 'बुकिंग से पहले जाँचें')),
    element('p', '', copy(
      'Schedules checked 24 Aug 2026 for planning. Reconfirm train number, running day, timing and seat availability on IRCTC for your exact travel date.',
      'योजना हेतु समय-सारणी 24 अगस्त 2026 को जाँची गई। अपनी यात्रा तिथि के लिए ट्रेन नंबर, चलने का दिन, समय और सीट उपलब्धता IRCTC पर पुनः जाँचें।',
    )),
  )

  const roadAir = element('div', 'road-air-grid')
  const road = element('article', 'road-air-card')
  road.append(
    element('span', 'road-air-card__number', '01'),
    element('p', 'logistics-kicker', copy('BY ROAD', 'सड़क मार्ग')),
    element('h4', '', copy('Delhi → Ramnagar', 'दिल्ली → रामनगर')),
    element('p', '', copy('Delhi · Hapur · Gajraula · Moradabad · Kashipur · Ramnagar · Chhoi', 'दिल्ली · हापुड़ · गजरौला · मुरादाबाद · काशीपुर · रामनगर · छोई')),
    externalLink(copy('OPEN ROAD ROUTE', 'सड़क मार्ग खोलें'), DIRECTIONS.delhi),
  )
  const air = element('article', 'road-air-card')
  air.append(
    element('span', 'road-air-card__number', '02'),
    element('p', 'logistics-kicker', copy('BY AIR', 'हवाई मार्ग')),
    element('h4', '', 'PANTNAGAR · PGH'),
    element('p', '', copy('Nearest airport, approximately 80 km from Wyndham Garden. Delhi IGI remains the major international gateway.', 'निकटतम एयरपोर्ट, Wyndham Garden से लगभग 80 किमी। अंतरराष्ट्रीय यात्रा के लिए दिल्ली IGI प्रमुख विकल्प है।')),
    externalLink(copy('AIRPORT → RESORT', 'एयरपोर्ट → रिसॉर्ट'), DIRECTIONS.airport),
  )
  roadAir.append(road, air)

  panel.append(summary, intro, filters, trainGrid, note, roadAir)
  return panel
}

function createTransportPanel() {
  const panel = element('div', 'logistics-panel logistics-panel--transport')
  const lead = element('div', 'transport-lead')
  lead.append(
    element('p', 'logistics-kicker', copy('GUEST TRANSFERS', 'अतिथि ट्रांसफर')),
    element('h3', '', copy('Pickup and drop details follow RSVP.', 'पिकअप और ड्रॉप विवरण RSVP के बाद साझा होंगे।')),
    element('p', '', copy(
      'Final pickup points, vehicle allocation and drop schedules will be coordinated after we receive your RSVP and travel details. Do not treat the planning railheads below as confirmed pickup points yet.',
      'अंतिम पिकअप स्थान, वाहन आवंटन और ड्रॉप समय आपके RSVP और यात्रा विवरण मिलने के बाद समन्वित किए जाएंगे। नीचे दिए रेलहेड को अभी निश्चित पिकअप स्थान न मानें।',
    )),
  )

  const transferGrid = element('div', 'transport-grid')
  transferGrid.append(
    createFact('RMR', copy('CLOSEST RAILHEAD', 'निकटतम रेलहेड'), 'RAMNAGAR', copy('≈ 13 km from resort', 'रिसॉर्ट से लगभग 13 किमी')),
    createFact('MB', copy('MAJOR INTERCHANGE', 'प्रमुख इंटरचेंज'), 'MORADABAD', copy('Preferred connection from Prayagraj / Kunda', 'प्रयागराज / कुंडा से प्राथमिक कनेक्शन')),
    createFact('PGH', copy('AIR TRANSFER', 'एयर ट्रांसफर'), 'PANTNAGAR', copy('≈ 80 km from resort', 'रिसॉर्ट से लगभग 80 किमी')),
  )

  const buttons = element('div', 'transport-actions')
  buttons.append(
    externalLink(copy('RMR → RESORT', 'RMR → रिसॉर्ट'), DIRECTIONS.rail),
    externalLink(copy('PGH → RESORT', 'PGH → रिसॉर्ट'), DIRECTIONS.airport),
  )
  const rsvpButton = element('button', 'logistics-jump', copy('SHARE DETAILS VIA RSVP', 'RSVP में विवरण साझा करें'))
  rsvpButton.type = 'button'
  rsvpButton.addEventListener('click', () => document.getElementById('rsvp')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }))
  buttons.appendChild(rsvpButton)

  panel.append(lead, transferGrid, buttons)
  return panel
}

function createDisclosure(kind, number, title, subtitle, panel, defaultOpen = false) {
  const article = element('article', `logistics-disclosure logistics-disclosure--${kind}`)
  const id = `logistics-panel-${kind}`
  const button = element('button', 'logistics-disclosure__trigger')
  button.type = 'button'
  button.setAttribute('aria-controls', id)
  button.setAttribute('aria-expanded', String(defaultOpen))

  const index = element('span', 'logistics-disclosure__index', number)
  const label = element('span', 'logistics-disclosure__label')
  label.append(element('strong', '', title), element('small', '', subtitle))
  const state = element('span', 'logistics-disclosure__state', defaultOpen ? '−' : '+')
  state.setAttribute('aria-hidden', 'true')
  button.append(index, label, state)

  const body = element('div', 'logistics-disclosure__body')
  body.id = id
  body.hidden = !defaultOpen
  body.appendChild(panel)

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open))
    state.textContent = open ? '−' : '+'
    article.classList.toggle('is-open', open)
    body.hidden = !open
  }

  setOpen(defaultOpen)
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'))
  article.append(button, body)
  return article
}

function createShell() {
  const shell = element('div', 'logistics-shell')
  const heading = element('header', 'logistics-header')
  heading.append(
    element('p', 'logistics-header__folio', '07 · FIELD NOTES'),
    element('h2', '', copy('Stay easy. Travel clearly.', 'ठहराव आसान। यात्रा स्पष्ट।')),
    element('p', '', copy(
      'The cinematic part is over for a moment. Here is the information guests actually need.',
      'कुछ देर के लिए सिनेमाई भाग समाप्त। यहाँ वह जानकारी है जिसकी अतिथियों को वास्तव में आवश्यकता है।',
    )),
  )

  const list = element('div', 'logistics-disclosures')
  list.append(
    createDisclosure('stay', '01', copy('STAY', 'ठहराव'), copy('Shared after RSVP', 'RSVP के बाद साझा होगा'), createStayPanel(), false),
    createDisclosure('travel', '02', copy('TRAVEL', 'यात्रा'), copy('Rail · Road · Air', 'रेल · सड़क · हवाई'), createTravelPanel(), true),
    createDisclosure('transport', '03', copy('TRANSPORT', 'परिवहन'), copy('Pickup · Drop · Assistance', 'पिकअप · ड्रॉप · सहायता'), createTransportPanel(), false),
  )

  shell.append(heading, list)
  return shell
}

function mount(section) {
  if (mounted?.section === section && mounted.shell.isConnected) return
  mounted?.destroy?.()

  const originalCards = [...section.querySelectorAll(':scope > .utility-card')]
  if (originalCards.length < 3) return

  const originalTravel = section.querySelector(':scope > #travel.utility-card')
  if (originalTravel) originalTravel.removeAttribute('id')

  const shell = createShell()
  section.classList.add('logistics-ready')
  section.appendChild(shell)

  const observer = new IntersectionObserver(([entry]) => {
    section.classList.toggle('is-logistics-visible', entry.isIntersecting)
  }, { threshold: .08, rootMargin: '5% 0px -8% 0px' })
  observer.observe(section)
  if (reducedMotion) section.classList.add('is-logistics-visible')

  mounted = {
    section,
    shell,
    observer,
    destroy() {
      observer.disconnect()
      shell.remove()
      section.classList.remove('logistics-ready', 'is-logistics-visible')
      if (originalTravel?.isConnected) originalTravel.id = 'travel'
      mounted = null
    },
  }
}

function scan() {
  const section = document.querySelector('#stay.utility-section, .utility-section#stay')
  if (!section) {
    mounted?.destroy?.()
    return
  }
  mount(section)
}

const mutationObserver = new MutationObserver(() => {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

function start() {
  mutationObserver.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
