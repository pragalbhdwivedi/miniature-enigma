// Module 21 — RSVP confirmation / micro-interactions
// Keeps the existing RSVP save / WhatsApp logic authoritative and only enhances
// completion feedback around the real controls.

const SAVE_ALERTS = new Set([
  'Your RSVP has been saved on this device.',
  'आपका RSVP इस डिवाइस पर सुरक्षित कर दिया गया है।',
])

const COPY = {
  en: {
    eyebrow: 'THE CORBETT WEDDING · RSVP',
    ready: 'RSVP READY',
    title: 'Ready when you are',
    note: 'Save a local copy or send the prepared RSVP on WhatsApp.',
    saving: 'SAVING…',
    savedButton: 'SAVED ON THIS DEVICE ✓',
    savedTitle: 'RSVP saved',
    savedNote: 'A copy has been stored locally on this device.',
    savedStatus: 'Saved on this device',
    whatsappReady: 'RSVP READY ✓',
  },
  hi: {
    eyebrow: 'THE CORBETT WEDDING · RSVP',
    ready: 'RSVP तैयार',
    title: 'आपका RSVP तैयार है',
    note: 'एक स्थानीय प्रति सेव करें या तैयार RSVP WhatsApp पर भेजें।',
    saving: 'सेव हो रहा है…',
    savedButton: 'इस डिवाइस पर सुरक्षित ✓',
    savedTitle: 'RSVP सुरक्षित है',
    savedNote: 'एक प्रति इस डिवाइस पर स्थानीय रूप से सुरक्षित की गई है।',
    savedStatus: 'इस डिवाइस पर सुरक्षित',
    whatsappReady: 'RSVP तैयार ✓',
  },
}

const mounted = new Map()
let scanQueued = false
let lastController = null

function isHindi() {
  return document.documentElement.lang === 'hi'
}

function text() {
  return COPY[isHindi() ? 'hi' : 'en']
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value
}

function element(tag, className, value) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (value != null) node.textContent = value
  return node
}

function buildConfirmation() {
  const root = element('aside', 'rsvp-confirmation')
  root.dataset.rsvpStep = '4'
  root.setAttribute('aria-live', 'polite')
  root.setAttribute('aria-atomic', 'true')

  const topline = element('div', 'rsvp-confirmation__topline')
  const eyebrow = element('p', 'rsvp-confirmation__eyebrow')
  const ready = element('span', 'rsvp-confirmation__ready')
  topline.append(eyebrow, ready)

  const body = element('div', 'rsvp-confirmation__body')
  const seal = element('span', 'rsvp-confirmation__seal')
  seal.setAttribute('aria-hidden', 'true')
  seal.appendChild(element('i', 'rsvp-confirmation__check'))

  const copy = element('div', 'rsvp-confirmation__copy')
  const title = element('strong', '')
  const note = element('span', '')
  copy.append(title, note)
  body.append(seal, copy)

  const status = element('div', 'rsvp-confirmation__status')
  status.append(element('i', ''), element('span', ''))

  root.append(topline, body, status)
  return { root, eyebrow, ready, title, note, statusText: status.querySelector('span') }
}

function mount(form) {
  if (mounted.has(form)) return mounted.get(form)

  const whatsapp = form.querySelector('.primary-cta.whatsapp')
  const save = form.querySelector('.secondary-cta')
  if (!whatsapp || !save) return null

  form.classList.add('rsvp-confirmation-ready')
  if (!whatsapp.dataset.rsvpOriginalLabel) whatsapp.dataset.rsvpOriginalLabel = whatsapp.textContent.trim()
  if (!save.dataset.rsvpOriginalLabel) save.dataset.rsvpOriginalLabel = save.textContent.trim()

  const panel = buildConfirmation()
  whatsapp.insertAdjacentElement('beforebegin', panel.root)

  const state = {
    form,
    whatsapp,
    save,
    panel,
    resetTimer: 0,
    whatsappTimer: 0,
    saved: false,
  }

  const applyLanguage = () => {
    const t = text()
    setText(panel.eyebrow, t.eyebrow)
    setText(panel.ready, state.saved ? t.savedButton : t.ready)
    if (state.saved) {
      setText(panel.title, t.savedTitle)
      setText(panel.note, t.savedNote)
      setText(panel.statusText, t.savedStatus)
      setText(save, t.savedButton)
    } else {
      setText(panel.title, t.title)
      setText(panel.note, t.note)
    }
  }

  const showWhatsAppReady = () => {
    window.clearTimeout(state.whatsappTimer)
    const t = text()
    whatsapp.classList.add('rsvp-action-ready')
    setText(whatsapp, t.whatsappReady)
    state.whatsappTimer = window.setTimeout(() => {
      if (!whatsapp.isConnected) return
      whatsapp.classList.remove('rsvp-action-ready')
      setText(whatsapp, whatsapp.dataset.rsvpOriginalLabel || t.whatsappReady)
    }, 1800)
  }

  const showSaving = () => {
    const t = text()
    save.classList.remove('rsvp-action-saved')
    save.classList.add('rsvp-action-saving')
    setText(save, t.saving)
  }

  const showSaved = () => {
    window.clearTimeout(state.resetTimer)
    const t = text()
    state.saved = true
    save.classList.remove('rsvp-action-saving')
    save.classList.add('rsvp-action-saved')
    setText(save, t.savedButton)
    panel.root.classList.add('is-saved')
    setText(panel.ready, t.savedButton)
    setText(panel.title, t.savedTitle)
    setText(panel.note, t.savedNote)
    setText(panel.statusText, t.savedStatus)
    navigator.vibrate?.(12)
  }

  const clearSavedPresentation = (event) => {
    if (!state.saved) return
    if (event?.target?.closest?.('.primary-cta.whatsapp, .secondary-cta, .rsvp-wizard__nav')) return
    state.saved = false
    save.classList.remove('rsvp-action-saved', 'rsvp-action-saving')
    setText(save, save.dataset.rsvpOriginalLabel || save.textContent)
    panel.root.classList.remove('is-saved')
    applyLanguage()
  }

  const onPointerDown = (event) => {
    if (event.target.closest('.primary-cta.whatsapp')) showWhatsAppReady()
    if (event.target.closest('.secondary-cta')) showSaving()
  }

  const onKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.target.closest('.primary-cta.whatsapp')) showWhatsAppReady()
    if (event.target.closest('.secondary-cta')) showSaving()
  }

  const onInput = (event) => clearSavedPresentation(event)
  const onClick = (event) => {
    if (event.target.closest('.status-toggle button, .event-checks button')) {
      window.setTimeout(() => clearSavedPresentation(event), 0)
    }
  }

  form.addEventListener('pointerdown', onPointerDown, { passive: true })
  form.addEventListener('keydown', onKeyDown)
  form.addEventListener('input', onInput)
  form.addEventListener('change', onInput)
  form.addEventListener('click', onClick)

  state.showSaved = showSaved
  state.refresh = applyLanguage
  state.destroy = () => {
    window.clearTimeout(state.resetTimer)
    window.clearTimeout(state.whatsappTimer)
    form.removeEventListener('pointerdown', onPointerDown)
    form.removeEventListener('keydown', onKeyDown)
    form.removeEventListener('input', onInput)
    form.removeEventListener('change', onInput)
    form.removeEventListener('click', onClick)
    whatsapp.classList.remove('rsvp-action-ready')
    save.classList.remove('rsvp-action-saving', 'rsvp-action-saved')
    if (whatsapp.dataset.rsvpOriginalLabel) setText(whatsapp, whatsapp.dataset.rsvpOriginalLabel)
    if (save.dataset.rsvpOriginalLabel) setText(save, save.dataset.rsvpOriginalLabel)
    panel.root.remove()
    form.classList.remove('rsvp-confirmation-ready')
    mounted.delete(form)
    if (lastController === state) lastController = null
  }

  mounted.set(form, state)
  lastController = state
  applyLanguage()
  return state
}

function scan() {
  for (const [form, state] of [...mounted.entries()]) {
    if (!form.isConnected) state.destroy()
  }

  document.querySelectorAll('.rsvp-form').forEach((form) => {
    const state = mounted.get(form) || mount(form)
    state?.refresh?.()
    if (state) lastController = state
  })
}

function patchRsvpAlert() {
  if (window.__corbettRsvpConfirmationAlertPatched) return
  window.__corbettRsvpConfirmationAlertPatched = true
  const nativeAlert = window.alert.bind(window)
  window.__corbettNativeAlert = nativeAlert

  window.alert = (message, ...rest) => {
    const value = String(message ?? '')
    if (SAVE_ALERTS.has(value)) {
      lastController?.showSaved?.()
      return undefined
    }
    return nativeAlert(message, ...rest)
  }
}

function mutationMatters(records) {
  return records.some((record) => [...record.addedNodes, ...record.removedNodes].some((node) => {
    if (!(node instanceof Element)) return false
    return node.matches?.('.rsvp-form, .primary-cta.whatsapp, .secondary-cta') ||
      node.querySelector?.('.rsvp-form, .primary-cta.whatsapp, .secondary-cta')
  }))
}

const observer = new MutationObserver((records) => {
  if (scanQueued || !mutationMatters(records)) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

function start() {
  patchRsvpAlert()
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })