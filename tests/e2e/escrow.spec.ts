import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Escrow E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FRONTEND_URL);
  });

  test('should display landing page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Secure Escrow Platform');
    await expect(page.locator('text=Create Escrow')).toBeVisible();
    await expect(page.locator('text=Track Escrow')).toBeVisible();
  });

  test('should navigate to create escrow page', async ({ page }) => {
    await page.click('text=Create Escrow');
    await expect(page).toHaveURL(/.*\/create/);
  });

  test('should navigate to track escrow page', async ({ page }) => {
    await page.click('text=Track Escrow');
    await expect(page).toHaveURL(/.*\/track/);
  });

  test('should navigate to auth page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*\/auth/);
  });
});

test.describe('Authentication Flow', () => {
  test('should request OTP', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/request-otp`, {
      data: {
        phone: '+2348123456789',
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('message');
    expect(body.message).toBe('OTP sent successfully');
  });

  test('should handle invalid OTP request', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/request-otp`, {
      data: {
        phone: 'invalid',
      },
    });

    expect(response.status()).toBe(400);
  });
});

