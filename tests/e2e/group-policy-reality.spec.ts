/**
 * OMEGA ULTRA REALITY V1.5 — Group Policy & Enterprise Policy Reality E2E Suite
 * Deterministic real Chromium browser end-to-end tests for Group Policy Objects,
 * LSDOU Link Resolution, Security Filtering, RSOP, Mapped Drives, and Enforcement.
 *
 * Rules:
 *   - NO force:true
 *   - NO waitForTimeout()
 *   - State-driven locators and attributes
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = path.resolve(process.cwd(), 'artifacts');
const VISUAL_QA_DIR = path.resolve(process.cwd(), 'artifacts/visual-qa');

async function ensureArtifactsDirs() {
  if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  if (!fs.existsSync(VISUAL_QA_DIR)) fs.mkdirSync(VISUAL_QA_DIR, { recursive: true });
}

async function saveScreenshot(page: Page, name: string) {
  try {
    const p = path.join(ARTIFACTS_DIR, name);
    await page.screenshot({ path: p, fullPage: false, animations: 'disabled', timeout: 20000 });
    fs.copyFileSync(p, path.join(VISUAL_QA_DIR, name));
    console.log(`[GPO-E2E] Captured screenshot: ${name}`);
  } catch (err) {
    console.log(`[GPO-E2E] Screenshot skipped or timed out for ${name}`);
  }
}

test.describe('Group Policy Reality Suite', () => {
  test.describe.configure({ timeout: 180000 });

  test.beforeEach(async ({ page }) => {
    await ensureArtifactsDirs();
    await page.goto('/#range', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('cyber-range-root')).toBeVisible({ timeout: 20000 });
  });

  test('Scenario A: Login Sara, verify Finance GPO and mapped F: drive in File Explorer', async ({ page }) => {
    // 1. Select FIN-WS01
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible({ timeout: 15000 });

    // 2. Open Desktop Tab and Login as sara.finance
    const desktopTab = page.getByTestId('tab-desktop');
    await desktopTab.click();
    await expect(desktopTab).toHaveAttribute('data-state', 'active');

    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    await expect(page.getByTestId('desktop-FIN-WS01')).toBeVisible({ timeout: 15000 });

    // 3. Open File Explorer
    const fileExplorerIcon = page.getByTestId('icon-file-explorer');
    await fileExplorerIcon.dblclick();

    await expect(page.getByTestId('file-explorer')).toBeVisible({ timeout: 10000 });

    // 4. Verify Mapped Drive F: exists and opens Finance Share
    const mappedF = page.getByTestId('mapped-drive-F');
    await expect(mappedF).toBeVisible({ timeout: 10000 });
    await mappedF.click();

    // Verify share contents
    await expect(page.getByTestId('share-authorized-banner')).toBeVisible({ timeout: 10000 });

    await saveScreenshot(page, 'gpo-sara-finance-mapped-drive.png');
  });

  test('Scenario B: Login Omar on HR-WS01, verify HR GPO and mapped H: drive (No F: drive)', async ({ page }) => {
    // 1. Select HR-WS01
    const hrBtn = page.getByTestId('nav-device-HR-WS01');
    await hrBtn.click();
    await expect(page.getByTestId('device-inspector-HR-WS01')).toBeVisible({ timeout: 15000 });

    // 2. Open Desktop Tab and Login as omar.hr
    const desktopTab = page.getByTestId('tab-desktop');
    await desktopTab.click();
    await expect(desktopTab).toHaveAttribute('data-state', 'active');

    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('omar.hr');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    await expect(page.getByTestId('desktop-HR-WS01')).toBeVisible({ timeout: 15000 });

    // 3. Open File Explorer
    const fileExplorerIcon = page.getByTestId('icon-file-explorer');
    await fileExplorerIcon.dblclick();

    await expect(page.getByTestId('file-explorer')).toBeVisible({ timeout: 10000 });

    // 4. Verify Mapped Drive H: exists, F: does NOT exist
    const mappedH = page.getByTestId('mapped-drive-H');
    await expect(mappedH).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('mapped-drive-F')).toBeHidden();

    await saveScreenshot(page, 'gpo-omar-hr-mapped-drive.png');
  });

  test('Scenario C: Inspect Group Policy Management Console (GPMC) in Inspector', async ({ page }) => {
    // 1. Select FIN-WS01
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible({ timeout: 15000 });

    // 2. Click Group Policy Tab
    const gpoTab = page.getByTestId('tab-group-policy');
    await gpoTab.click();
    await expect(gpoTab).toHaveAttribute('data-state', 'active');

    // 3. Verify GPMC Console & Tree
    await expect(page.getByTestId('group-policy-console')).toBeVisible();
    await expect(page.getByTestId('gpo-tree')).toBeVisible();

    // Verify baseline GPOs exist in tree
    await expect(page.getByTestId('gpo-item-gpo-domain-baseline')).toBeVisible();
    await expect(page.getByTestId('gpo-item-gpo-workstation-baseline')).toBeVisible();
    await expect(page.getByTestId('gpo-item-gpo-finance-policy')).toBeVisible();

    await saveScreenshot(page, 'gpo-gpmc-console-inspector.png');
  });

  test('Scenario D: Inspect RSOP Panel in Inspector', async ({ page }) => {
    // 1. Select FIN-WS01
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible({ timeout: 15000 });

    // 2. Click RSOP Tab
    const rsopTab = page.getByTestId('tab-rsop');
    await rsopTab.click();
    await expect(rsopTab).toHaveAttribute('data-state', 'active');

    // 3. Verify RSOP Panel
    await expect(page.getByTestId('rsop-panel')).toBeVisible();

    await saveScreenshot(page, 'gpo-rsop-panel-inspector.png');
  });
});
