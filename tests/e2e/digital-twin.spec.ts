import { test, expect } from '@playwright/test';

test.describe('ZORG Living Digital Enterprise', () => {
  test('keeps network, firewall, SOC, and incident response synchronized', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const launchButton = page.getByTestId('open-digital-twin-btn');
    await expect(launchButton).toBeVisible();
    await launchButton.click();

    await expect(page.getByRole('heading', { name: /المؤسسة الرقمية الحية/i })).toBeVisible();
    await expect(page.getByTestId('digital-twin-node-hr-ws-04')).toBeVisible();
    await expect(page.getByTestId('digital-twin-incident-state')).toHaveText('قيد التحقيق');

    const inspect = page.getByTestId('digital-twin-inspect-btn');
    const isolate = page.getByTestId('digital-twin-isolate-btn');
    const block = page.getByTestId('digital-twin-block-btn');
    const resolve = page.getByTestId('digital-twin-resolve-btn');

    await expect(isolate).toBeDisabled();
    await expect(block).toBeDisabled();
    await expect(resolve).toBeDisabled();

    await inspect.click();
    await expect(inspect).toBeDisabled();
    await expect(isolate).toBeEnabled();

    await isolate.click();
    await expect(page.getByTestId('digital-twin-node-hr-ws-04')).toContainText('معزول');
    await expect(block).toBeEnabled();

    await block.click();
    await expect(page.getByTestId('digital-twin-incident-state')).toHaveText('تم الاحتواء');
    await expect(resolve).toBeEnabled();

    await resolve.click();
    await expect(page.getByTestId('digital-twin-incident-state')).toHaveText('مغلق');
    await expect(page.getByTestId('digital-twin-score')).toContainText('100');

    // The same virtual enterprise state should survive a page reload.
    await page.reload();
    await expect(page.getByTestId('digital-twin-incident-state')).toHaveText('مغلق');
    await expect(page.getByTestId('digital-twin-score')).toContainText('100');
  });

  test('advances only virtual time and never requires a real target', async ({ page }) => {
    await page.goto('/#digital_twin');
    await page.waitForLoadState('domcontentloaded');

    const clock = page.getByTestId('digital-twin-clock');
    await expect(clock).toBeVisible();
    await page.getByRole('button', { name: /قدّم دقيقة افتراضية/i }).click();
    await expect(clock).toHaveText('09:13');
    await expect(page.getByText(/بيئة اصطناعية بالكامل/i)).toBeVisible();
  });
});
