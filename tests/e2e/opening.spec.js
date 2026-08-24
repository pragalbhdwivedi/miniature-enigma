import { test, expect } from '@playwright/test'

async function pseudoBackground(locator, pseudo = '::before') {
  return locator.evaluate((element, targetPseudo) => getComputedStyle(element, targetPseudo).backgroundImage, pseudo)
}

async function expectPseudoAsset(locator, token, pseudo = '::before') {
  await expect.poll(() => pseudoBackground(locator, pseudo), {
    message: `Expected ${pseudo} background to include ${token}`,
  }).toContain(token)
}

async function capture(page, testInfo, name) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: false })
}

async function expectLargeTapTarget(locator) {
  const box = await locator.boundingBox()
  expect(box, 'tap target must have a rendered box').not.toBeNull()
  expect(box.width).toBeGreaterThanOrEqual(220)
  expect(box.height).toBeGreaterThanOrEqual(48)
}

async function runOpening(page, testInfo, { side = 'bride', lang = 'en' } = {}) {
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.selection-screen:not(.language-screen)')).toBeVisible()

  const sideButton = page.locator(`.passport-choice.${side}`)
  await expect(sideButton).toBeVisible()
  await expectPseudoAsset(sideButton, `tiger-medallion-${side}`)
  await capture(page, testInfo, '01-side')
  await sideButton.click()

  await expect(page.locator('.language-screen')).toBeVisible()
  const languageCards = page.locator('.language-card')
  await expect(languageCards).toHaveCount(2)
  await expectPseudoAsset(languageCards.first(), 'tiger-medallion-front')
  await expectPseudoAsset(languageCards.nth(1), 'tiger-medallion-front')

  const originMedallion = page.locator('.language-origin__medallion')
  await expect(originMedallion).toBeVisible()
  await expect.poll(() => originMedallion.evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain(`tiger-medallion-${side}`)

  await capture(page, testInfo, '02-language')
  const languageButton = lang === 'hi' ? languageCards.first() : languageCards.nth(1)
  await languageButton.click()

  await expect(page.locator('.intro-screen.intro-0')).toBeVisible()
  const forestContinue = page.locator('.intro-0 .tap-hint')
  await expect(forestContinue).toBeVisible()
  await expectLargeTapTarget(forestContinue)
  await capture(page, testInfo, '03-forest')
  await forestContinue.click()

  await expect(page.locator('.intro-screen.intro-1')).toBeVisible()
  await expect.poll(() => page.locator('.intro-1 .intro-media').evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain('tiger-reveal-front')
  const tigerLabel = page.locator('.intro-1 .tiger-reveal-label')
  await expect(tigerLabel).toBeVisible()
  const tigerLabelBox = await tigerLabel.boundingBox()
  expect(tigerLabelBox).not.toBeNull()
  expect(tigerLabelBox.height).toBeLessThan(testInfo.project.use.viewport.height * 0.28)
  const tigerContinue = page.locator('.intro-1 .tap-hint')
  await expectLargeTapTarget(tigerContinue)
  await capture(page, testInfo, '04-tiger')
  await tigerContinue.click()

  const crestScreen = page.locator('.intro-screen.intro-2')
  await expect(crestScreen).toBeVisible()
  const crest = page.locator('.intro-2 .crest-transform')
  await expect(crest).toBeVisible()
  await expectPseudoAsset(crest, 'tiger-transition-engraved')
  const crestBox = await crest.boundingBox()
  expect(crestBox).not.toBeNull()
  expect(crestBox.width).toBeGreaterThan(120)
  expect(crestBox.height).toBeGreaterThan(120)

  /* Module 05 deliberately spends ~2.2 s transforming photography into the
     engraved crest. Verify the final phase, not an arbitrary mid-animation frame. */
  await expect.poll(() => crestScreen.getAttribute('data-crest-phase'), {
    timeout: 4_500,
    message: 'Tiger-to-crest choreography should reach its settled phase',
  }).toBe('3')
  await expect.poll(() => crest.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)), {
    timeout: 2_000,
    message: 'Final engraved crest should become visibly settled',
  }).toBeGreaterThan(0.75)

  const crestContinue = page.locator('.intro-2 .tap-hint')
  await expectLargeTapTarget(crestContinue)
  await capture(page, testInfo, '05-crest')
  await crestContinue.click()

  await expect(page.locator('.passport-stage')).toBeVisible()
  const passportCover = page.locator('.passport-cover')
  const passportButton = page.locator('.passport-stage .primary-cta')
  await expect(passportCover).toBeVisible()
  await expectPseudoAsset(page.locator('.passport-stage .cover-crest'), 'tiger-medallion-front')
  await passportButton.scrollIntoViewIfNeeded()
  await expect(passportButton).toBeVisible()
  await expectLargeTapTarget(passportButton)

  const coverBox = await passportCover.boundingBox()
  const buttonBox = await passportButton.boundingBox()
  expect(coverBox).not.toBeNull()
  expect(buttonBox).not.toBeNull()
  expect(buttonBox.y).toBeGreaterThanOrEqual(coverBox.y + coverBox.height - 4)

  await capture(page, testInfo, '06-passport')
  await passportButton.click()

  await expect(page.locator('.site-shell')).toBeVisible()
  await expect(page.locator('#home')).toBeVisible()
  await capture(page, testInfo, '07-site')
  expect(pageErrors, `Unexpected page errors: ${pageErrors.join(' | ')}`).toEqual([])
}

test('Bride side English opening reaches the invitation', async ({ page }, testInfo) => {
  await runOpening(page, testInfo, { side: 'bride', lang: 'en' })
})

test('Groom side Hindi opening reaches the invitation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-390', 'Side/language parity runs once at the primary iPhone width')
  await runOpening(page, testInfo, { side: 'groom', lang: 'hi' })
})

test('Reduced motion opening remains fully navigable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-390', 'Reduced-motion parity runs once at the primary iPhone width')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await runOpening(page, testInfo, { side: 'bride', lang: 'en' })
})
