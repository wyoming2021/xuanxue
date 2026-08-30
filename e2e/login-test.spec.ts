import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('can login with email OTP', async ({ page, request }) => {
    const testEmail = `test-${Date.now()}@example.com`;

    // Step 1: Go to homepage
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/玄语/);

    // Step 2: Open login dialog
    const loginBtn = page.locator('header button').filter({ hasText: '登录' }).first();
    await loginBtn.click();

    const dialog = page.locator('[role=dialog]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Step 3: Enter email and send OTP
    await dialog.locator('#email').fill(testEmail);
    await dialog.locator('button').filter({ hasText: '发送验证码' }).click();

    // Step 4: Wait for OTP input step
    await expect(dialog).toContainText('输入验证码', { timeout: 15000 });

    // Step 5: Get OTP from debug endpoint
    const otpRes = await request.get(`http://localhost:3000/api/auth/debug-otp?email=${testEmail}`);
    const otpData = await otpRes.json();
    expect(otpData.code).toBeTruthy();
    const code = otpData.code as string;

    // Step 6: Click first OTP input and type code using keyboard
    const firstInput = dialog.locator("input[maxlength='1']").first();
    await firstInput.click();
    await page.keyboard.type(code, { delay: 50 });

    // Step 7: Wait for auto-submit and success
    await expect(dialog).toContainText('登录成功', { timeout: 10000 });

    // Wait for dialog to close
    await page.waitForTimeout(2000);

    // Step 8: Verify logged-in state
    const headerText = await page.locator('header').textContent();
    expect(headerText).toContain(testEmail.split('@')[0]);
  });
});
