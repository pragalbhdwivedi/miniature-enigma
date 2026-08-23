const FAMILY_DATA = {
  en: {
    bride: {
      title: 'Bride Family',
      entries: [
        ['Father', 'Dr. Vinay Kumar Dwivedi'],
        ['Mother', 'Mrs. Archana Dwivedi'],
        ['Bhaiya and Bhabhi', 'Pragalbh Dwivedi and Nisha Dwivedi'],
        ['Bade Bhaiya and Bhabhi', 'Pankaj Shukla and Neeta Shukla'],
        ['Nephew', 'Aadidev Dwivedi'],
      ],
    },
    groom: {
      title: 'Groom Family',
      entries: [
        ['Father', 'Mr. Shushil Pandey'],
        ['Mother', 'Mrs. Rajwanti Pandey'],
        ['Sister', 'Anjali Pandey'],
        ['Didi and Jija', 'Sushma Pandey and Manish Mishra'],
        ['Niece', 'Samridhi Mishra'],
      ],
    },
  },
  hi: {
    bride: {
      title: 'वधू पक्ष का परिवार',
      entries: [
        ['पिता', 'Dr. Vinay Kumar Dwivedi'],
        ['माता', 'Mrs. Archana Dwivedi'],
        ['भैया और भाभी', 'Pragalbh Dwivedi और Nisha Dwivedi'],
        ['बड़े भैया और भाभी', 'Pankaj Shukla और Neeta Shukla'],
        ['भतीजा', 'Aadidev Dwivedi'],
      ],
    },
    groom: {
      title: 'वर पक्ष का परिवार',
      entries: [
        ['पिता', 'Mr. Shushil Pandey'],
        ['माता', 'Mrs. Rajwanti Pandey'],
        ['बहन', 'Anjali Pandey'],
        ['दीदी और जीजा', 'Sushma Pandey और Manish Mishra'],
        ['भांजी', 'Samridhi Mishra'],
      ],
    },
  },
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
}

function cardHtml(block, index, side) {
  const rows = block.entries.map(([relation, name]) => `
    <div class="family-person">
      <dt>${escapeHtml(relation)}</dt>
      <dd>${escapeHtml(name)}</dd>
    </div>`).join('')

  return `<article class="family-card family-card--${side}" data-family-card="${side}">
    <div class="family-card-topline"><span>0${index + 1}</span><strong>${escapeHtml(block.title)}</strong></div>
    <dl>${rows}</dl>
  </article>`
}

function renderApprovedFamilies() {
  const section = document.querySelector('.family-section')
  const grid = section?.querySelector('.family-grid')
  if (!section || !grid) return

  const lang = document.documentElement.lang === 'hi' ? 'hi' : 'en'
  const copy = FAMILY_DATA[lang]
  const groomFirst = document.querySelector('.site-shell')?.classList.contains('side-groom') || false
  const order = groomFirst ? ['groom', 'bride'] : ['bride', 'groom']
  const signature = `${lang}:${order.join('-')}`
  if (grid.dataset.familySignature === signature) return

  grid.innerHTML = order.map((side, index) => cardHtml(copy[side], index, side)).join('')
  grid.dataset.familySignature = signature
  section.querySelectorAll('.placeholder-note').forEach((node) => node.remove())
}

const observer = new MutationObserver(renderApprovedFamilies)
observer.observe(document.documentElement, { childList: true, subtree: true })
renderApprovedFamilies()

window.addEventListener('pageshow', renderApprovedFamilies)
