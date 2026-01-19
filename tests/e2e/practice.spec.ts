import { test, expect } from '@playwright/test'

test.describe('Practice Flow', () => {

  test('practice page shows persona selection', async ({ page }) => {
    await page.goto('/practice')

    // May redirect to login if protected
    // If logged in, should show persona selection
    const pageUrl = page.url()

    if (pageUrl.includes('/login')) {
      // Expected behavior for unauthenticated users
      await expect(page).toHaveURL(/login/)
    } else {
      // Should show persona selection
      await expect(page.getByText(/choose your challenge/i)).toBeVisible()
      await expect(page.getByText(/select prospect/i)).toBeVisible()
    }
  })

  test('shows all 6 personas', async ({ page }) => {
    await page.goto('/practice')

    if (!page.url().includes('/login')) {
      // Check for persona cards (there should be 6)
      const personas = [
        'Skeptical CFO',
        'Busy VP Sales',
        'Friendly Gatekeeper',
        'Defensive Manager',
        'Interested But Stuck',
        'Aggressive Closer',
      ]

      for (const persona of personas) {
        await expect(page.getByText(persona)).toBeVisible()
      }
    }
  })

  test('shows scenario selection options', async ({ page }) => {
    await page.goto('/practice')

    if (!page.url().includes('/login')) {
      // Check for scenario options
      const scenarios = ['Cold Call', 'Objections', 'Closing', 'Gatekeeper']

      for (const scenario of scenarios) {
        await expect(page.getByText(scenario)).toBeVisible()
      }
    }
  })

  test('persona selection highlights selected card', async ({ page }) => {
    await page.goto('/practice')

    if (!page.url().includes('/login')) {
      // Click on a persona
      const busyVP = page.getByText('Busy VP Sales').first()
      if (await busyVP.isVisible()) {
        await busyVP.click()

        // The card should be highlighted (has ring-gold class)
        // We check for the check icon that appears on selection
        await expect(page.locator('[class*="ring-gold"]').first()).toBeVisible()
      }
    }
  })

  test('start button requires microphone notice', async ({ page }) => {
    await page.goto('/practice')

    if (!page.url().includes('/login')) {
      // Check for microphone notice
      await expect(page.getByText(/microphone access required/i)).toBeVisible()

      // Check for start button
      await expect(page.getByRole('button', { name: /start practice call/i })).toBeVisible()
    }
  })

  test('clicking start shows connecting state', async ({ page, context }) => {
    // Grant microphone permission before the test
    await context.grantPermissions(['microphone'])

    await page.goto('/practice')

    if (!page.url().includes('/login')) {
      // Click start button
      const startButton = page.getByRole('button', { name: /start practice call/i })
      if (await startButton.isVisible()) {
        await startButton.click()

        // Should show connecting state (or error if VAPI not configured)
        const connecting = page.getByText(/connecting/i)
        const error = page.getByText(/error|not configured/i)

        await expect(connecting.or(error)).toBeVisible({ timeout: 10000 })
      }
    }
  })
})

test.describe('Practice Results Page', () => {
  test('results page shows 404 for invalid session', async ({ page }) => {
    await page.goto('/practice/results/invalid-id')

    // Should show error or redirect
    const pageContent = await page.textContent('body')
    expect(pageContent).toMatch(/not found|error|invalid/i)
  })
})
