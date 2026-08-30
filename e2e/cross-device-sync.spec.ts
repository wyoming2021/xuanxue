import { test, expect } from '@playwright/test';

test.describe('Cross-device membership sync', () => {
  test('membership status syncs across devices', async ({ browser, request }) => {
    const testEmail = `sync-${Date.now()}@example.com`;

    // ─── Helper: Login via browser-side API ───
    async function loginDevice(label: string) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('http://localhost:3000');

      // Send OTP via server API
      const sendRes = await request.post('http://localhost:3000/api/auth/send-otp', {
        data: { email: testEmail },
      });
      expect((await sendRes.json()).success).toBe(true);

      // Get OTP
      const otpRes = await request.get(
        `http://localhost:3000/api/auth/debug-otp?email=${testEmail}`,
      );
      const otpData = await otpRes.json();
      expect(otpData.code).toBeTruthy();
      const code = otpData.code as string;

      // Verify OTP via browser-side fetch (auto-sets cookies)
      const verifyResult = await page.evaluate(
        async ({ email, code }) => {
          const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
          });
          return res.json();
        },
        { email: testEmail, code },
      );
      expect(verifyResult.success).toBe(true);

      // Reload to pick up session
      await page.reload();
      await page.waitForTimeout(1500);

      // Verify logged in
      const headerText = await page.locator('header').textContent();
      expect(headerText).toContain(testEmail.split('@')[0]);
      console.log(`✅ ${label}: Logged in`);
      return { context, page };
    }

    // ─── Helper: Check VIP via browser-side fetch ───
    async function checkVip(page: any, expectVip: boolean, label: string) {
      const meData = await page.evaluate(async () => {
        const res = await fetch('/api/auth/me');
        return res.json();
      });
      expect(meData.success).toBe(true);
      expect(meData.data.isVip).toBe(expectVip);
      if (expectVip) {
        expect(meData.data.remainingDays).toBeGreaterThanOrEqual(29);
        console.log(`✅ ${label}: VIP = true (${meData.data.remainingDays}d)`);
      } else {
        console.log(`✅ ${label}: VIP = false`);
      }
      return meData.data;
    }

    // ═══════════════════════════════════════════
    // STEP 1: Device A - Login, not VIP
    // ═══════════════════════════════════════════
    const { context: ctxA, page: pageA } = await loginDevice('Device A');
    const dataA = await checkVip(pageA, false, 'Device A (before)');

    // ═══════════════════════════════════════════
    // STEP 2: Activate membership
    // ═══════════════════════════════════════════
    const actRes = await request.post('http://localhost:3000/api/dev/activate-membership', {
      data: { email: testEmail, days: 30 },
    });
    expect((await actRes.json()).success).toBe(true);
    console.log('✅ Membership activated (30 days)');

    // Verify Device A sees VIP (reload to refresh)
    await pageA.reload();
    await pageA.waitForTimeout(1000);
    await checkVip(pageA, true, 'Device A (after)');

    // ═══════════════════════════════════════════
    // STEP 3: Device B - Login, VIP synced
    // ═══════════════════════════════════════════
    const { context: ctxB, page: pageB } = await loginDevice('Device B');
    const dataB = await checkVip(pageB, true, 'Device B (synced)');

    // ═══════════════════════════════════════════
    // STEP 4: Same userId
    // ═══════════════════════════════════════════
    expect(dataA.userId).toBe(dataB.userId);
    console.log(`✅ Same userId: ${dataA.userId}`);

    await ctxA.close();
    await ctxB.close();

    console.log('\n🎉 Cross-device membership sync test PASSED!');
  });
});
