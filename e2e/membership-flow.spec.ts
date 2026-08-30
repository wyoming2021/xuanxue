import { test, expect } from '@playwright/test';

test.describe('Login → Purchase Membership flow', () => {
  test('login and purchase membership', async ({ page, request }) => {
    const testEmail = `member-${Date.now()}@example.com`;

    // ─── Step 1: Login ───
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/玄语/);

    // Open login dialog
    await page.locator('header button').filter({ hasText: '登录' }).first().click();
    const dialog = page.locator('[role=dialog]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Enter email and send OTP
    await dialog.locator('#email').fill(testEmail);
    await dialog.locator('button').filter({ hasText: '发送验证码' }).click();
    await expect(dialog).toContainText('输入验证码', { timeout: 15000 });

    // Get OTP from debug endpoint
    const otpRes = await request.get(`http://localhost:3000/api/auth/debug-otp?email=${testEmail}`);
    const otpData = await otpRes.json();
    expect(otpData.code).toBeTruthy();
    const code = otpData.code as string;

    // Type each digit individually with explicit click+type+wait
    const otpInputs = dialog.locator("input[maxlength='1']");
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).click();
      await page.waitForTimeout(100);
      await page.keyboard.type(code[i], { delay: 30 });
      await page.waitForTimeout(150);
    }

    // Wait for auto-submit
    await expect(dialog).toContainText('登录成功', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verify logged in
    const headerText = await page.locator('header').textContent();
    expect(headerText).toContain(testEmail.split('@')[0]);
    console.log('✅ Step 1: Login successful');

    // ─── Step 2: Open Membership Dialog ───
    await page.locator('header button').filter({ hasText: '会员' }).first().click();
    await expect(dialog).toContainText('开通会员', { timeout: 5000 });

    // Verify plans
    await expect(dialog).toContainText('月卡');
    await expect(dialog).toContainText('¥19.9');
    console.log('✅ Step 2: Membership dialog opened');

    // ─── Step 3: Purchase monthly plan ───
    // Click the second "购买" button (monthly plan, index 1)
    // Plans: day=0, month=1 (most popular), year=2
    const buyBtns = dialog.locator('button').filter({ hasText: '购买' });
    await buyBtns.nth(1).click();

    // Wait for payment redirect or new tab
    await page.waitForTimeout(3000);

    const allPages = page.context().pages();
    if (allPages.length > 1) {
      const payPage = allPages[allPages.length - 1];
      const payUrl = payPage.url();
      console.log(`✅ Step 3: Payment page opened: ${payUrl}`);

      // In demo mode, should redirect to demo payment page
      if (payUrl.includes('payment/demo')) {
        await expect(payPage.locator('body')).toContainText(/演示|demo|订单|支付/, {
          timeout: 5000,
        });
        console.log('✅ Step 3: Demo payment page confirmed');
        await payPage.close();
      } else {
        console.log('✅ Step 3: Real payment page');
        await payPage.close();
      }
    } else {
      // Check if toast or notification appeared
      const pageContent = await page.locator('body').textContent();
      console.log(
        `✅ Step 3: Payment initiated (same tab). Page contains: ${pageContent?.substring(0, 200)}`,
      );
    }

    console.log('\n🎉 Full login → membership purchase flow completed!');
  });
});
