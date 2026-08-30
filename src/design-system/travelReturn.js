// Return travel enhancement for Module 17.
// Planning schedules checked 30 Aug 2026 from current public railway timetable sources.
// Guests must reconfirm train number, running day, timing and availability on IRCTC.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const IRCTC_URL = 'https://www.irctc.co.in/nget/train-search'
const RESORT_ADDRESS = 'Farm No 51, Khushalpur Shah, Chhoi, Ramnagar, Uttarakhand 244715'

const RETURN_DIRECTIONS = {
  delhi: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(RESORT_ADDRESS)}&destination=${encodeURIComponent('Delhi, India')}`,
  airport: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(RESORT_ADDRESS)}&destination=${encodeURIComponent('Pantnagar Airport, Uttarakhand')}`,
  moradabad: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(RESORT_ADDRESS)}&destination=${encodeURIComponent('Moradabad Railway Station, Uttar Pradesh')}`,
}

const RETURN_TRAINS = [
  {
    group: 'moradabad', number: '25036', name: 'RMR DLI LINK EX',
    from: 'RMR · Ramnagar', to: 'MB · Moradabad', depart: '09:50', arrive: '11:45', duration: '1h 55m', days: 'DAILY',
    tagEn: 'EARLY DEPARTURE', tagHi: 'जल्दी प्रस्थान',
    noteEn: 'Useful rail connection to Moradabad, but it leaves before the locked 11:00 AM checkout. Choose only if you plan an early departure.',
    noteHi: 'मुरादाबाद के लिए उपयोगी रेल कनेक्शन, लेकिन यह निर्धारित 11:00 बजे चेकआउट से पहले निकलती है। केवल जल्दी प्रस्थान की योजना हो तो चुनें।',
  },
  {
    group: 'kunda', number: '14242', name: 'NAUCHANDI EXP',
    from: 'MB · Moradabad', to: 'KHNM · Kunda Harnamganj', depart: '23:00', arrive: '07:51', duration: '8h 51m', days: 'DAILY',
    tagEn: 'KUNDA RETURN', tagHi: 'कुंडा वापसी',
    noteEn: 'Daily overnight return from Moradabad. Reach Moradabad by your coordinated transfer or another suitable connection after checkout.',
    noteHi: 'मुरादाबाद से दैनिक रात्रि वापसी। चेकआउट के बाद समन्वित ट्रांसफर या उपयुक्त कनेक्शन से मुरादाबाद पहुँचें।',
  },
  {
    group: 'prayagraj', number: '14242', name: 'NAUCHANDI EXP',
    from: 'MB · Moradabad', to: 'PYGS · Prayagraj Sangam', depart: '23:00', arrive: '09:20', duration: '10h 20m', days: 'DAILY',
    tagEn: 'PRAYAGRAJ · OVERNIGHT', tagHi: 'प्रयागराज · रात्रि',
    noteEn: 'Same Nauchandi service continues through Kunda and reaches Prayagraj Sangam the following morning.',
    noteHi: 'यही नौचंडी सेवा कुंडा होते हुए अगली सुबह प्रयागराज संगम पहुँचती है।',
  },
  {
    group: 'prayagraj', number: '14114', name: 'DDN SFG EXPRESS',
    from: 'MB · Moradabad', to: 'SFG · Subedarganj', depart: '18:28', arrive: '05:55', duration: '11h 27m', days: 'DAILY',
    tagEn: 'PRAYAGRAJ AREA', tagHi: 'प्रयागराज क्षेत्र',
    noteEn: 'Daily alternative to Subedarganj. This requires reaching Moradabad in time after the 11:00 AM checkout.',
    noteHi: 'सूबेदारगंज के लिए दैनिक विकल्प। 11:00 बजे चेकआउट के बाद समय से मुरादाबाद पहुँचना आवश्यक है।',
  },
  {
    group: 'delhi', number: '25036', name: 'RMR DLI LINK EX',
    from: 'RMR · Ramnagar', to: 'DLI · Old Delhi', depart: '09:50', arrive: '15:25', duration: '5h 35m', days: 'DAILY',
    tagEn: 'DIRECT · EARLY', tagHi: 'सीधी · जल्दी',
    noteEn: 'Direct daytime Delhi option. It departs before the locked 11:00 AM checkout, so it is only for guests leaving early.',
    noteHi: 'दिल्ली की सीधी दिन की ट्रेन। यह निर्धारित 11:00 बजे चेकआउट से पहले निकलती है, इसलिए केवल जल्दी लौटने वाले अतिथियों के लिए है।',
  },
  {
    group: 'delhi', number: '25014', name: 'CORBET PRK LINK',
    from: 'RMR · Ramnagar', to: 'DLI · Old Delhi', depart: '22:25', arrive: '04:10', duration: '5h 45m', days: 'DAILY',
    tagEn: 'DIRECT · AFTER CHECKOUT', tagHi: 'सीधी · चेकआउट के बाद',
    noteEn: 'Direct overnight Delhi return after the wedding checkout day, with no Moradabad change required.',
    noteHi: 'विवाह के चेकआउट वाले दिन रात की सीधी दिल्ली वापसी, मुरादाबाद में ट्रेन बदलने की आवश्यकता नहीं।',
  },
]

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

function createTrainCard(train, index) {
  const card = element('article', `rail-option rail-option--${train.group}`)
  card.dataset.returnTrain = train.number

  const top = element('div', 'rail-option__top')
  top.append(
    element('span', 'rail-option__number', train.number),
    element('span', 'rail-option__tag', isHindi() ? train.tagHi : train.tagEn),
  )

  const route = element('div', 'rail-option__route')
  const from = element('div', 'rail-option__station')
  from.append(element('small', '', copy('FROM', 'प्रस्थान')), element('strong', '', train.from), element('time', '', train.depart))
  const line = element('div', 'rail-option__line')
  line.append(element('span', '', '→'), element('small', '', train.duration))
  const to = element('div', 'rail-option__station rail-option__station--to')
  to.append(element('small', '', copy('TO', 'आगमन')), element('strong', '', train.to), element('time', '', train.arrive))
  route.append(from, line, to)

  const meta = element('div', 'rail-option__meta')
  meta.append(element('span', '', train.days), element('span', '', `${String(index + 1).padStart(2, '0')} / ${String(RETURN_TRAINS.length).padStart(2, '0')}`))

  card.append(
    top,
    element('strong', 'rail-option__name', train.name),
    route,
    meta,
    element('p', 'rail-option__note', isHindi() ? train.noteHi : train.noteEn),
  )
  return card
}

function createReturnPanel() {
  const panel = element('div', 'travel-direction-panel travel-direction-panel--return')
  panel.dataset.travelDirection = 'return'
  panel.hidden = true

  const intro = element('div', 'rail-guide__intro')
  const introCopy = element('div')
  introCopy.append(
    element('p', 'logistics-kicker', copy('RETURN FIELD GUIDE · 26 NOV', 'वापसी फील्ड गाइड · 26 नवम्बर')),
    element('h3', '', copy('Plan the journey home.', 'वापसी की यात्रा की योजना।')),
    element('p', '', copy(
      'Checkout is locked at 11:00 AM on 26 Nov. Use the filters below for Kunda, Prayagraj and Delhi return planning; early trains are marked clearly.',
      '26 नवम्बर को चेकआउट 11:00 बजे निर्धारित है। कुंडा, प्रयागराज और दिल्ली वापसी के विकल्प नीचे फ़िल्टर करें; जल्दी निकलने वाली ट्रेनें स्पष्ट रूप से चिन्हित हैं।',
    )),
  )
  intro.append(introCopy, externalLink('IRCTC', IRCTC_URL, 'logistics-link logistics-link--irctc'))

  const filters = element('div', 'rail-filters rail-filters--return')
  filters.setAttribute('role', 'group')
  filters.setAttribute('aria-label', copy('Filter return train options', 'वापसी ट्रेन विकल्प फ़िल्टर करें'))
  const labels = [
    ['all', copy('ALL 6', 'सभी 6')],
    ['kunda', copy('KUNDA', 'कुंडा')],
    ['prayagraj', copy('PRAYAGRAJ', 'प्रयागराज')],
    ['moradabad', copy('MORADABAD', 'मुरादाबाद')],
    ['delhi', copy('DELHI', 'दिल्ली')],
  ]

  const grid = element('div', 'rail-options rail-options--return')
  RETURN_TRAINS.forEach((train, index) => grid.appendChild(createTrainCard(train, index)))

  const filter = (group) => {
    filters.querySelectorAll('button').forEach((button) => {
      const active = button.dataset.returnFilter === group
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-pressed', String(active))
    })
    grid.querySelectorAll('.rail-option').forEach((card) => {
      card.hidden = group !== 'all' && !card.classList.contains(`rail-option--${group}`)
    })
  }

  labels.forEach(([key, label], index) => {
    const button = element('button', `rail-filter${index === 0 ? ' is-active' : ''}`, label)
    button.type = 'button'
    button.dataset.returnFilter = key
    button.setAttribute('aria-pressed', String(index === 0))
    button.addEventListener('click', () => filter(key))
    filters.appendChild(button)
  })

  const warning = element('div', 'rail-warning')
  warning.append(
    element('strong', '', copy('RETURN SCHEDULE CHECK', 'वापसी समय-सारणी जाँच')),
    element('p', '', copy(
      'Return schedules checked 30 Aug 2026 for planning. Reconfirm the exact 26 Nov service, running day, timing and seat availability on IRCTC before booking.',
      'वापसी समय-सारणी योजना हेतु 30 अगस्त 2026 को जाँची गई। बुकिंग से पहले 26 नवम्बर की सटीक सेवा, चलने का दिन, समय और सीट उपलब्धता IRCTC पर पुनः जाँचें।',
    )),
  )

  const roadAir = element('div', 'road-air-grid')
  const road = element('article', 'road-air-card')
  road.append(
    element('span', 'road-air-card__number', '01'),
    element('p', 'logistics-kicker', copy('RETURN BY ROAD', 'सड़क मार्ग से वापसी')),
    element('h4', '', copy('Ramnagar → Delhi', 'रामनगर → दिल्ली')),
    element('p', '', copy('Ramnagar · Kashipur · Moradabad · Gajraula · Hapur · Delhi', 'रामनगर · काशीपुर · मुरादाबाद · गजरौला · हापुड़ · दिल्ली')),
    externalLink(copy('OPEN RETURN ROAD ROUTE', 'वापसी सड़क मार्ग खोलें'), RETURN_DIRECTIONS.delhi),
  )
  const air = element('article', 'road-air-card')
  air.append(
    element('span', 'road-air-card__number', '02'),
    element('p', 'logistics-kicker', copy('RETURN BY AIR', 'हवाई मार्ग से वापसी')),
    element('h4', '', copy('Resort → Pantnagar', 'रिसॉर्ट → पंतनगर')),
    element('p', '', copy('Pantnagar is the nearest airport. Flight availability depends on your onward city and travel date.', 'पंतनगर निकटतम एयरपोर्ट है। उड़ान उपलब्धता आपके आगे के शहर और यात्रा तिथि पर निर्भर करेगी।')),
    externalLink(copy('RESORT → AIRPORT', 'रिसॉर्ट → एयरपोर्ट'), RETURN_DIRECTIONS.airport),
  )
  roadAir.append(road, air)

  const transfer = element('div', 'return-transfer-note')
  transfer.append(
    element('strong', '', copy('MORADABAD CONNECTION', 'मुरादाबाद कनेक्शन')),
    element('p', '', copy('For the evening Nauchandi / Subedarganj return trains, a post-checkout road transfer to Moradabad may be more practical than the 09:50 rail connection. Final vehicle coordination follows RSVP.', 'शाम की नौचंडी / सूबेदारगंज वापसी ट्रेनों के लिए 09:50 रेल कनेक्शन की तुलना में चेकआउट के बाद मुरादाबाद तक सड़क ट्रांसफर अधिक व्यावहारिक हो सकता है। अंतिम वाहन समन्वय RSVP के बाद होगा।')),
    externalLink(copy('RESORT → MORADABAD', 'रिसॉर्ट → मुरादाबाद'), RETURN_DIRECTIONS.moradabad),
  )

  panel.append(intro, filters, grid, warning, transfer, roadAir)
  return panel
}

function mount(panel) {
  if (panel.dataset.returnTravelReady === 'true') return
  const summary = panel.querySelector(':scope > .travel-summary')
  const firstGuide = panel.querySelector(':scope > .rail-guide__intro')
  if (!summary || !firstGuide) return

  panel.dataset.returnTravelReady = 'true'

  const switcher = element('div', 'travel-direction-switch')
  switcher.setAttribute('role', 'group')
  switcher.setAttribute('aria-label', copy('Choose travel direction', 'यात्रा दिशा चुनें'))

  const outboundButton = element('button', 'travel-direction-button is-active', copy('TO CORBETT', 'कॉर्बेट के लिए'))
  const returnButton = element('button', 'travel-direction-button', copy('RETURN · 26 NOV', 'वापसी · 26 नवम्बर'))
  outboundButton.type = 'button'; returnButton.type = 'button'
  outboundButton.dataset.direction = 'outbound'; returnButton.dataset.direction = 'return'
  outboundButton.setAttribute('aria-pressed', 'true'); returnButton.setAttribute('aria-pressed', 'false')
  switcher.append(outboundButton, returnButton)

  const outboundPanel = element('div', 'travel-direction-panel travel-direction-panel--outbound')
  outboundPanel.dataset.travelDirection = 'outbound'
  const nodesToMove = [...panel.children].filter((node) => node !== summary)
  nodesToMove.forEach((node) => outboundPanel.appendChild(node))

  const returnPanel = createReturnPanel()
  panel.append(switcher, outboundPanel, returnPanel)
  summary.insertAdjacentElement('afterend', switcher)

  const setDirection = (direction) => {
    const returning = direction === 'return'
    outboundPanel.hidden = returning
    returnPanel.hidden = !returning
    outboundButton.classList.toggle('is-active', !returning)
    returnButton.classList.toggle('is-active', returning)
    outboundButton.setAttribute('aria-pressed', String(!returning))
    returnButton.setAttribute('aria-pressed', String(returning))
    panel.dataset.activeTravelDirection = direction
    if (!reducedMotion) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  outboundButton.addEventListener('click', () => setDirection('outbound'))
  returnButton.addEventListener('click', () => setDirection('return'))
  setDirection('outbound')
}

function scan() {
  document.querySelectorAll('.logistics-panel--travel').forEach(mount)
}

const observer = new MutationObserver((records) => {
  const relevant = records.some((record) => [...record.addedNodes].some((node) => node instanceof Element && (node.matches?.('.logistics-panel--travel') || node.querySelector?.('.logistics-panel--travel'))))
  if (!relevant || scanQueued) return
  scanQueued = true
  queueMicrotask(() => { scanQueued = false; scan() })
})

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
