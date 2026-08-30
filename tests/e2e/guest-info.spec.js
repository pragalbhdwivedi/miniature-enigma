import { test, expect } from '@playwright/test'

async function openInvitation(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.locator('.passport-choice.bride').click()
  await page.locator('.language-card.wine').click()

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

test('guest information stays discoverable and detailed', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-390', 'Guest-information regression runs at the primary iPhone width')
  await openInvitation(page)

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
  await expect(returnPanel.locator('.rail-option')).toHaveCount(6)

  await returnPanel.locator('[data-return-filter="kunda"]').click()
  await expect(returnPanel.locator('.rail-option:visible')).toHaveCount(1)
  await expect(returnPanel.locator('.rail-option:visible')).toContainText('14242')

  await returnPanel.locator('[data-return-filter="prayagraj"]').click()
  await expect(returnPanel.locator('.rail-option:visible')).toHaveCount(2)

  const hindiUtilityStack = await page.locator('html').evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--font-utility-hi'))
  expect(hindiUtilityStack).toContain('Mangal')

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
})
