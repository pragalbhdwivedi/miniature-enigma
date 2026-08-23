// Production RSVP behavior shared by the React app and the raw-source fallback.
// Keeps the guest anchored in the RSVP section, injects the contact-number field,
// and guarantees WhatsApp opens the intended Indian number.

const RSVP_PHONE = '919555877000'
let pendingScrollY = null
let pendingAt = 0
let contactNo = sessionStorage.getItem('corbettWeddingContactNo') || ''

const isRsvpControl = (target) => Boolean(target?.closest?.('.event-checks button, .status-toggle button'))
const isWhatsAppButton = (target) => Boolean(target?.closest?.('.rsvp-form .primary-cta.whatsapp'))
const isSaveButton = (target) => Boolean(target?.closest?.('.rsvp-form .secondary-cta'))

function currentLang() {
  return document.documentElement.lang === 'hi' ? 'hi' : 'en'
}

function rememberScroll(event) {
  if (!isRsvpControl(event.target)) return
  pendingScrollY = window.scrollY
  pendingAt = performance.now()
}

function forceRestore(targetY, capturedAt) {
  if (capturedAt !== pendingAt || performance.now() - capturedAt > 1800) return
  if (Math.abs(window.scrollY - targetY) > 3) {
    window.scrollTo({ top: targetY, left: 0, behavior: 'auto' })
  }
}

function restoreScroll(event) {
  if (!isRsvpControl(event.target) || pendingScrollY === null) return
  const targetY = pendingScrollY
  const capturedAt = pendingAt

  // Mobile Safari can apply layout/focus scrolling after the click handler.
  // Restore more than once so neither React reconciliation nor the raw fallback
  // can drag the guest back to the top of the page.
  requestAnimationFrame(() => forceRestore(targetY, capturedAt))
  ;[40, 120, 260, 520, 900].forEach((delay) => {
    window.setTimeout(() => forceRestore(targetY, capturedAt), delay)
  })
  window.setTimeout(() => {
    if (capturedAt === pendingAt) pendingScrollY = null
  }, 1100)
}

function ensureContactField() {
  const form = document.querySelector('.rsvp-form')
  if (!form || form.querySelector('.contact-number-field')) return

  const firstLabel = form.querySelector('label')
  if (!firstLabel) return

  const label = document.createElement('label')
  label.className = 'contact-number-field'
  label.htmlFor = 'rsvp-contact-number'
  label.append(document.createTextNode(currentLang() === 'hi' ? 'संपर्क नंबर' : 'Contact number'))

  const input = document.createElement('input')
  input.id = 'rsvp-contact-number'
  input.type = 'tel'
  input.inputMode = 'tel'
  input.autocomplete = 'tel'
  input.placeholder = currentLang() === 'hi' ? 'मोबाइल नंबर' : 'Mobile number'
  input.value = contactNo
  input.addEventListener('input', () => {
    contactNo = input.value
    sessionStorage.setItem('corbettWeddingContactNo', contactNo)
  })
  label.append(input)

  firstLabel.insertAdjacentElement('afterend', label)
}

function readRsvpSnapshot() {
  const form = document.querySelector('.rsvp-form')
  const name = form?.querySelector('#rsvp-name, #fallback-name')?.value?.trim() || ''
  const guests = form?.querySelector('#rsvp-guests, #fallback-guests')?.value || ''
  const contact = form?.querySelector('#rsvp-contact-number')?.value?.trim() || contactNo.trim()
  const attendingButton = form?.querySelector('.status-toggle button:first-child')
  const attending = attendingButton?.getAttribute('aria-pressed') === 'true' || attendingButton?.classList.contains('active')
  const selectedEvents = [...(form?.querySelectorAll('.event-checks button') || [])]
    .filter((button) => button.getAttribute('aria-pressed') === 'true' || button.classList.contains('selected'))
    .map((button) => button.textContent.replace(/^[✓+]/, '').trim())

  return { name, guests, contact, attending, selectedEvents }
}

function whatsappMessage() {
  const data = readRsvpSnapshot()
  const hi = currentLang() === 'hi'
  const lines = hi
    ? [
        'RSVP — Kritica & Ashish',
        `अतिथि/परिवार: ${data.name || 'नाम दर्ज नहीं'}`,
        `संपर्क नंबर: ${data.contact || 'दर्ज नहीं'}`,
        data.attending ? `अतिथियों की संख्या: ${data.guests || '1'}` : '',
        `स्थिति: ${data.attending ? 'उपस्थित रहेंगे' : 'उपस्थित नहीं हो पाएँगे'}`,
        data.selectedEvents.length ? `कार्यक्रम: ${data.selectedEvents.join(', ')}` : '',
      ]
    : [
        'RSVP — Kritica & Ashish',
        `Guest/Family: ${data.name || 'Not entered'}`,
        `Contact number: ${data.contact || 'Not entered'}`,
        data.attending ? `Guests: ${data.guests || '1'}` : '',
        `Status: ${data.attending ? 'Attending' : 'Unable to attend'}`,
        data.selectedEvents.length ? `Events: ${data.selectedEvents.join(', ')}` : '',
      ]

  return lines.filter(Boolean).join('\n')
}

function handleWhatsApp(event) {
  if (!isWhatsAppButton(event.target)) return
  event.preventDefault()
  event.stopImmediatePropagation()

  const url = `https://api.whatsapp.com/send?phone=${RSVP_PHONE}&text=${encodeURIComponent(whatsappMessage())}`
  window.location.assign(url)
}

function persistContactOnSave(event) {
  if (!isSaveButton(event.target)) return
  const value = document.querySelector('#rsvp-contact-number')?.value?.trim() || contactNo.trim()
  if (!value) return

  window.setTimeout(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('corbettWeddingRsvp') || '{}')
      localStorage.setItem('corbettWeddingRsvp', JSON.stringify({ ...stored, contactNo: value }))
    } catch {
      // The normal RSVP flow should never fail because of optional local persistence.
    }
  }, 0)
}

function scan() {
  ensureContactField()
}

const observer = new MutationObserver(scan)
observer.observe(document.documentElement, { childList: true, subtree: true })
scan()

document.addEventListener('pointerdown', rememberScroll, { capture: true, passive: true })
document.addEventListener('touchstart', rememberScroll, { capture: true, passive: true })
document.addEventListener('click', restoreScroll, { capture: true })
document.addEventListener('click', handleWhatsApp, { capture: true })
document.addEventListener('click', persistContactOnSave, { capture: true })
