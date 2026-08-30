import { test, expect } from '@playwright/test'

const RAW_FALLBACK_URL = 'http://127.0.0.1:4174'

async function openInvitation(page, { url = '/', lang = 'en' } = {}) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.selection-screen:not(.language-screen)')).toBeVisible()
  await page.locator('.passport-choice.bride').click()

  const languageCards = page.locator('.language-card')
  await expect(languageCards).toHaveCount(2)
  const languageButton = lang === 'hi' ? languageCards.first() : languageCards.nth(1)
  await languageButton.click()

  await expect(page.locator('.intro-screen.intro-0')).toBeVisible()
  await page.locator('.intro-0 .tap-hint').click()
  await expect(page.locator('.intro-screen.intro-1')).toBeVisible()
  await page.locator('.intro-1 .tap-hint').click()

  const crestScreen = page.locator('.intro-screen.intro-2')
  await expect(crestScreen).toBeVisible()
  await expect.poll(() => crestScreen.getAttribute('data-crest-phase'), { timeout: 4_500 }).toBe('3')
  await page.locator('.intro-2 .tap-hint').click()

  await expect(page.locator('.passport-stage')).toBeVisible()
  const openButton = page.locator('.passport-stage .primary-cta')
  await openButton.scrollIntoViewIfNeeded()
  await openButton.click()
  await expect(page.locator('.site-shell')).toBeVisible()
}

async function assertGuestInformation(page) {
  const itineraryDays = page.locator('.itinerary-section .itinerary-day')
  await expect(itineraryDays).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) {
    await expect(itineraryDays.nth(index)).toBeVisible()
  }
  await expect(page.locator('.itinerary-navigator')).toHaveCount(0)

  const travel = page.locator('.logistics-panel--travel')
  await expect(travel).toBeVisible()
  const directionButtons = travel.locator('.travel-direction-button')
  await expect(directionButtons).toHaveCount(2)
  await expect(directionButtons.nth(0)).toContainText('TO CORBETT')
  await expect(directionButtons.nth(1)).toContainText('RETURN')

  await directionButtons.nth(1).click()
  const returnPanel = travel.locator('.travel-direction-panel--return')
  await expect(returnPanel).toBeVisible()
  await expect(returnPanel.locator('.rail-option')).toHaveCount(8)

  await returnPanel.locator('[data-return-filter="kunda"]').click()
  await expect(returnPanel.locator('.rail-option:visible')).toHaveCount(1)
  await expect(returnPanel.locator('.rail-option:visible')).toContainText('14242')

  await returnPanel.locator('[data-return-filter="prayagraj"]').click()
  await expect(returnPanel.locator('.rail-option:visible')).toHaveCount(2)

  await returnPanel.locator('[data-return-filter="amroha"]').click()
  await expect(returnPanel.locator('.rail-option:visible')).toHaveCount(2)

  await page.locator('#rsvp').scrollIntoViewIfNeeded()
  const next = page.locator('.rsvp-wizard__next')
  await expect(next).toBeVisible()
  await next.click()
  await next.click()
  await next.click()

  const eventButtons = page.locator('.rsvp-form .event-checks button')
  await expect(eventButtons).toHaveCount(6)
  const mehendi = eventButtons.first()
  await expect(mehendi).toHaveAttribute('data-rsvp-event-type', '(Mehendi)')
  await expect(mehendi).toHaveAttribute('data-rsvp-event-when', '24 Nov · 3:00 PM')
  await expect(mehendi).toHaveAttribute('aria-label', /Pind Green Flag \(Mehendi\).*24 Nov.*3:00 PM/)
  await expect(mehendi).toHaveAttribute('aria-pressed', 'false')
  await mehendi.click()
  await expect(mehendi).toHaveAttribute('aria-pressed', 'true')
  await mehendi.click()
  await expect(mehendi).toHaveAttribute('aria-pressed', 'false')
}

async function expectMangalFirst(locator) {
  await expect(locator).toBeVisible()
  const family = await locator.evaluate((element) => getComputedStyle(element).fontFamily)
  expect(family).toContain('Mangal')
}

test('guest information stays discoverable and detailed', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-390', 'Guest-information regression runs at the primary iPhone width')
  await openInvitation(page)
  await assertGuestInformation(page)
})

test('raw fallback keeps the same guest information behavior', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-390', 'Raw fallback regression runs at the primary iPhone width')
  await openInvitation(page, { url: RAW_FALLBACK_URL })
  await assertGuestInformation(page)
})

test('Hindi itinerary, travel and RSVP utilities use the Mangal-first stack', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-390', 'Hindi utility typography runs at the primary iPhone width')
  await openInvitation(page, { lang: 'hi' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')

  await expectMangalFirst(page.locator('.itinerary-section .timeline-item span').first())
  await expectMangalFirst(page.locator('.logistics-panel--travel .travel-direction-button').first())
  await expectMangalFirst(page.locator('.rsvp-form label').first())
})
