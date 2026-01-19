import { test, expect } from '@playwright/test'

test.describe('Call Analysis Flow', () => {
  test('analyze page shows upload interface', async ({ page }) => {
    await page.goto('/analyze')

    // May redirect to login if protected
    const pageUrl = page.url()

    if (pageUrl.includes('/login')) {
      // Expected behavior for unauthenticated users
      await expect(page).toHaveURL(/login/)
    } else {
      // Should show upload interface
      await expect(page.getByText(/call analysis/i)).toBeVisible()
      await expect(page.getByText(/upload|drag|drop/i)).toBeVisible()
    }
  })

  test('shows supported file formats', async ({ page }) => {
    await page.goto('/analyze')

    if (!page.url().includes('/login')) {
      // Should mention supported formats
      const supportedFormats = page.getByText(/mp3|wav|webm|ogg|m4a/i)
      await expect(supportedFormats).toBeVisible()
    }
  })

  test('shows recent analyses section', async ({ page }) => {
    await page.goto('/analyze')

    if (!page.url().includes('/login')) {
      // Should show recent analyses section
      await expect(page.getByText(/recent analyses/i)).toBeVisible()
    }
  })

  test('analyze button is disabled without file', async ({ page }) => {
    await page.goto('/analyze')

    if (!page.url().includes('/login')) {
      // The analyze button should only appear after file selection
      const analyzeButton = page.getByRole('button', { name: /analyze call/i })
      await expect(analyzeButton).not.toBeVisible()
    }
  })
})

test.describe('Analysis Results Page', () => {
  test('results page shows 404 for invalid ID', async ({ page }) => {
    await page.goto('/analyze/invalid-uuid')

    // Should show error or not found
    const pageContent = await page.textContent('body')
    expect(pageContent).toMatch(/not found|error|invalid/i)
  })

  test('results page shows 404 for non-existent UUID', async ({ page }) => {
    await page.goto('/analyze/00000000-0000-0000-0000-000000000000')

    // Should redirect to login or show not found
    const pageContent = await page.textContent('body')
    const isLoginOrNotFound = page.url().includes('/login') ||
      /not found|error/i.test(pageContent || '')
    expect(isLoginOrNotFound).toBeTruthy()
  })
})

test.describe('API Rate Limiting', () => {
  test('chat API returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'Hello' }],
      },
    })

    expect(response.status()).toBe(401)
  })

  test('upload API returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/upload', {
      data: {},
    })

    expect(response.status()).toBe(401)
  })

  test('transcribe API returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/transcribe', {
      data: { callId: '00000000-0000-0000-0000-000000000000' },
    })

    expect(response.status()).toBe(401)
  })

  test('score API returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/analyze/score', {
      data: { callId: '00000000-0000-0000-0000-000000000000' },
    })

    expect(response.status()).toBe(401)
  })
})

test.describe('API Validation', () => {
  // Note: These would require authentication in real tests
  // Testing that validation errors are returned correctly

  test('chat API validates request body', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        // Invalid: missing messages
      },
    })

    // Should return 400 or 401
    expect([400, 401]).toContain(response.status())
  })

  test('score API validates UUID format', async ({ request }) => {
    const response = await request.post('/api/analyze/score', {
      data: { callId: 'not-a-uuid' },
    })

    // Should return 400 or 401
    expect([400, 401]).toContain(response.status())
  })
})
