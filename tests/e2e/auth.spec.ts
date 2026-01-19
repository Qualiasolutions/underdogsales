import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('redirects unauthenticated users from protected routes', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/login/)
  })

  test('shows login page correctly', async ({ page }) => {
    await page.goto('/login')

    // Check for login elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows signup page correctly', async ({ page }) => {
    await page.goto('/signup')

    // Check for signup elements
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
  })

  test('shows validation errors for invalid email', async ({ page }) => {
    await page.goto('/login')

    // Enter invalid email
    await page.getByPlaceholder(/email/i).fill('invalid-email')
    await page.getByPlaceholder(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show validation error
    await expect(page.getByText(/invalid|email/i)).toBeVisible()
  })

  test('shows validation errors for empty password', async ({ page }) => {
    await page.goto('/login')

    // Enter email but no password
    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show validation error
    await expect(page.getByText(/password|required/i)).toBeVisible()
  })

  test('link to signup from login works', async ({ page }) => {
    await page.goto('/login')

    // Click signup link
    await page.getByRole('link', { name: /sign up|create account/i }).click()

    // Should navigate to signup
    await expect(page).toHaveURL(/signup/)
  })

  test('link to login from signup works', async ({ page }) => {
    await page.goto('/signup')

    // Click login link
    await page.getByRole('link', { name: /sign in|login/i }).click()

    // Should navigate to login
    await expect(page).toHaveURL(/login/)
  })
})

test.describe('Landing Page', () => {
  test('shows landing page with CTA', async ({ page }) => {
    await page.goto('/')

    // Check for key elements
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started|start|try/i })).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')

    // Click on sign in link
    const signInLink = page.getByRole('link', { name: /sign in|login/i })
    if (await signInLink.isVisible()) {
      await signInLink.click()
      await expect(page).toHaveURL(/login/)
    }
  })
})
