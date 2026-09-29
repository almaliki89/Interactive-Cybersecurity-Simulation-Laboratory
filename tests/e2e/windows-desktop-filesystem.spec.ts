/**
 * OMEGA ULTRA REALITY V1.4 — Windows Desktop, File System & Services E2E Suite
 * Deterministic real Chromium browser end-to-end tests for Windows Desktop, File Explorer,
 * NTFS ACLs, SMB Network Shares, Services Lifecycle, and Recycle Bin.
 *
 * Rules:
 *   - NO force:true
 *   - NO waitForTimeout
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
    console.log(`[WIN-E2E] Captured screenshot: ${name}`);
  } catch (err) {
    console.log(`[WIN-E2E] Screenshot skipped or timed out for ${name}`);
  }
}

test.describe('Windows Desktop & File System Reality Suite', () => {
  test.describe.configure({ timeout: 180000 });

  test.beforeEach(async ({ page }) => {
    await ensureArtifactsDirs();
    await page.goto('/#range', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('cyber-range-root')).toBeVisible({ timeout: 20000 });
  });

  test('Scenario A: Login Sara and verify Windows Desktop', async ({ page }) => {
    // 1. Select FIN-WS01
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible({ timeout: 15000 });

    // 2. Open Desktop Tab
    const desktopTab = page.getByTestId('tab-desktop');
    await desktopTab.click();
    await expect(desktopTab).toHaveAttribute('data-state', 'active');

    // 3. If login screen is shown, perform logon
    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    // 4. Verify Desktop Elements
    await expect(page.getByTestId('desktop-FIN-WS01')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('start-button')).toBeVisible();
    await expect(page.getByTestId('taskbar')).toBeVisible();
    await expect(page.getByTestId('system-tray-clock')).toBeVisible();
    await expect(page.getByTestId('icon-this-pc')).toBeVisible();
    await expect(page.getByTestId('icon-file-explorer')).toBeVisible();
    await expect(page.getByTestId('icon-services')).toBeVisible();
    await expect(page.getByTestId('icon-task-manager')).toBeVisible();

    await saveScreenshot(page, 'windows-desktop-sara.png');
  });

  test('Scenario B: Open File Explorer and browse Documents', async ({ page }) => {
    // 1. Select FIN-WS01 and ensure logged in
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();

    const desktopTab = page.getByTestId('tab-desktop');
    await desktopTab.click();

    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    // 2. Double-click File Explorer icon
    const feIcon = page.getByTestId('icon-file-explorer');
    await feIcon.dblclick();

    // 3. Verify File Explorer opened
    await expect(page.getByTestId('file-explorer')).toBeVisible({ timeout: 15000 });
    const pathInput = page.getByTestId('file-explorer-path');
    await expect(pathInput).toBeVisible();

    await saveScreenshot(page, 'file-explorer-documents.png');
  });

  test('Scenario C: Open \\\\FILE01\\Finance successfully', async ({ page }) => {
    // 1. Select FIN-WS01 and logon
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();

    const desktopTab = page.getByTestId('tab-desktop');
    await desktopTab.click();

    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    // 2. Open File Explorer
    await page.getByTestId('icon-file-explorer').dblclick();
    await expect(page.getByTestId('file-explorer')).toBeVisible();

    // 3. Click \\FILE01\Finance from Quick Access / Network Shares
    const shareBtn = page.getByRole('button', { name: '\\\\FILE01\\Finance' }).first();
    await shareBtn.click();

    // 4. Verify Finance Share Files are visible
    await expect(page.getByText('Quarterly_Report_Q1.xlsx').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Budget_2026.xlsx').first()).toBeVisible();
    await expect(page.getByText('Payroll_Summary.csv').first()).toBeVisible();

    // 5. Select Quarterly Report and check preview
    await page.getByText('Quarterly_Report_Q1.xlsx').first().click();
    await expect(page.getByTestId('file-preview-content')).toContainText('Q1 CORPORATE FINANCIAL AUDIT REPORT');

    await saveScreenshot(page, 'file-explorer-finance-share.png');
  });

  test('Scenario D: Login Omar and verify Finance access denied', async ({ page }) => {
    // 1. Select HR-WS01
    const hrBtn = page.getByTestId('nav-device-HR-WS01');
    await hrBtn.click();
    await expect(page.getByTestId('device-inspector-HR-WS01')).toBeVisible({ timeout: 15000 });

    const desktopTab = page.getByTestId('tab-desktop');
    await desktopTab.click();

    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('omar.hr');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    // 2. Open File Explorer
    await page.getByTestId('icon-file-explorer').dblclick();
    await expect(page.getByTestId('file-explorer')).toBeVisible();

    // 3. Try to access \\FILE01\Finance
    const shareBtn = page.getByRole('button', { name: '\\\\FILE01\\Finance' }).first();
    await shareBtn.click();

    // 4. Verify Access Denied banner is displayed
    const accessResult = page.getByTestId('file-access-result');
    await expect(accessResult).toBeVisible({ timeout: 15000 });
    await expect(accessResult).toHaveAttribute('data-state', 'denied');
    await expect(accessResult).toContainText('Access Denied');

    await saveScreenshot(page, 'file-explorer-finance-denied.png');
  });

  test('Scenario E: Stop FILE01 LanmanServer and verify share unavailable', async ({ page }) => {
    // 1. Switch to FILE01
    const file01Btn = page.getByTestId('nav-device-FILE01');
    await file01Btn.click();
    await expect(page.getByTestId('device-inspector-FILE01')).toBeVisible({ timeout: 15000 });

    // Open Desktop on FILE01
    const desktopTab = page.getByTestId('tab-desktop');
    await desktopTab.click();

    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('administrator');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    // Open Services Console on FILE01
    await page.getByTestId('icon-services').dblclick();
    await expect(page.getByTestId('services-console')).toBeVisible({ timeout: 15000 });

    // Stop LanmanServer Service
    const stopBtn = page.getByTestId('service-action-stop-LanmanServer');
    await stopBtn.click();
    await expect(page.getByTestId('service-status-LanmanServer')).toHaveAttribute('data-state', 'STOPPED');

    // 2. Switch back to FIN-WS01 (Sara)
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();

    await page.getByTestId('tab-desktop').click();
    const feIcon = page.getByTestId('icon-file-explorer');
    await feIcon.dblclick();
    await expect(page.getByTestId('file-explorer')).toBeVisible();

    // Try accessing \\FILE01\Finance
    const shareBtn = page.getByRole('button', { name: '\\\\FILE01\\Finance' }).first();
    await shareBtn.click();

    // Verify share is unavailable due to service stopped
    const accessResult = page.getByTestId('file-access-result');
    await expect(accessResult).toBeVisible({ timeout: 15000 });
    await expect(accessResult).toHaveAttribute('data-state', 'unavailable');
    await expect(accessResult).toHaveAttribute('data-reason', 'SERVICE_UNAVAILABLE');
    await expect(accessResult).toContainText('LanmanServer service is stopped on \'FILE01\'');

    await saveScreenshot(page, 'file-explorer-share-service-stopped.png');
  });

  test('Scenario F: Restart service and verify recovery', async ({ page }) => {
    // 1. Switch to FILE01 and start LanmanServer
    const file01Btn = page.getByTestId('nav-device-FILE01');
    await file01Btn.click();
    await expect(page.getByTestId('device-inspector-FILE01')).toBeVisible();

    await page.getByTestId('tab-desktop').click();
    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('administrator');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    await page.getByTestId('icon-services').dblclick();
    await expect(page.getByTestId('services-console')).toBeVisible();

    const startBtn = page.getByTestId('service-action-start-LanmanServer');
    await startBtn.click();
    await expect(page.getByTestId('service-status-LanmanServer')).toHaveAttribute('data-state', 'RUNNING');

    // 2. Switch back to FIN-WS01 (Sara)
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();

    await page.getByTestId('tab-desktop').click();
    await page.getByTestId('icon-file-explorer').dblclick();
    await expect(page.getByTestId('file-explorer')).toBeVisible();

    // Navigate to \\FILE01\Finance
    const shareBtn = page.getByRole('button', { name: '\\\\FILE01\\Finance' }).first();
    await shareBtn.click();

    // Verify recovery - files reappear
    await expect(page.getByText('Quarterly_Report_Q1.xlsx').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Budget_2026.xlsx').first()).toBeVisible();

    await saveScreenshot(page, 'file-explorer-share-service-restored.png');
  });

  test('Scenario G: Create/delete/restore local file', async ({ page }) => {
    // 1. Select FIN-WS01 and logon
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click();
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();

    await page.getByTestId('tab-desktop').click();
    const loginScreen = page.getByTestId('windows-login-screen');
    if (await loginScreen.isVisible()) {
      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
    }

    // 2. Open File Explorer
    await page.getByTestId('icon-file-explorer').dblclick();
    await expect(page.getByTestId('file-explorer')).toBeVisible();

    // Navigate to Documents
    const docsBtn = page.getByRole('button', { name: 'Documents' }).first();
    await docsBtn.click();

    // 3. Create a new document
    const newFileBtn = page.getByTestId('btn-new-file');
    await newFileBtn.click();

    const fileNameInput = page.getByPlaceholder('NewDocument.txt');
    await fileNameInput.fill('Audit_Checklist.txt');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify file exists
    const fileRow = page.getByText('Audit_Checklist.txt').first();
    await expect(fileRow).toBeVisible({ timeout: 10000 });

    // 4. Delete the file
    await fileRow.click();
    const delBtn = page.getByTestId('btn-delete-file');
    await delBtn.click();
    await expect(fileRow).toBeHidden({ timeout: 10000 });

    // 5. Navigate to Recycle Bin
    const recycleBtn = page.getByRole('button', { name: 'Recycle Bin' }).first();
    await recycleBtn.click();

    // Verify item in Recycle Bin and click restore
    await expect(page.getByText('Audit_Checklist.txt').first()).toBeVisible({ timeout: 10000 });
    const restoreBtn = page.getByTestId('btn-restore-file').first();
    await restoreBtn.click();

    // 6. Navigate back to Documents and verify restored
    await docsBtn.click();
    await expect(page.getByText('Audit_Checklist.txt').first()).toBeVisible({ timeout: 10000 });

    await saveScreenshot(page, 'file-recycle-bin-restored.png');
  });
});
