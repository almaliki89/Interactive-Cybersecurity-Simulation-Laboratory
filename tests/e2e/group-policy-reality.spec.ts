/**
 * OMEGA ULTRA REALITY V1.5 — Group Policy & Enterprise Policy Reality E2E Suite
 * Deterministic Chromium E2E coverage for GPO application, mapped drives,
 * service/firewall consequences, and RSOP precedence.
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
  } catch {
    console.log(`[GPO-E2E] Screenshot skipped for ${name}`);
  }
}

async function selectDevice(page: Page, deviceId: string) {
  await page.getByTestId(`nav-device-${deviceId}`).click();
  await expect(page.getByTestId(`device-inspector-${deviceId}`)).toBeVisible({ timeout: 15000 });
}

async function loginDomainUser(page: Page, deviceId: string, userName: string) {
  await selectDevice(page, deviceId);
  const desktopTab = page.getByTestId('tab-desktop');
  await desktopTab.click();
  await expect(desktopTab).toHaveAttribute('data-state', 'active');

  const loginScreen = page.getByTestId('windows-login-screen');
  if (await loginScreen.isVisible()) {
    await page.getByTestId('domain-username-input').fill(userName);
    await page.getByTestId('domain-password-input').fill('P@ssword123!');
    await page.getByTestId('domain-login-btn').click();
  }

  await expect(page.getByTestId(`desktop-${deviceId}`)).toBeVisible({ timeout: 15000 });
}

async function openFileExplorer(page: Page) {
  const icon = page.getByTestId('icon-file-explorer');
  await icon.dblclick();
  await expect(page.getByTestId('file-explorer')).toBeVisible({ timeout: 10000 });
}

async function openGpoComputerConfig(page: Page, deviceId: string, gpoId: string) {
  await selectDevice(page, deviceId);
  const gpoTab = page.getByTestId('tab-group-policy');
  await gpoTab.click();
  await expect(gpoTab).toHaveAttribute('data-state', 'active');
  await expect(page.getByTestId('group-policy-console')).toBeVisible();
  await page.getByTestId(`gpo-item-${gpoId}`).click();
  await page.getByTestId('gpo-tab-computer-config').click();
  await expect(page.getByTestId('gpo-policy-lab-controls')).toBeVisible();
}

test.describe('Group Policy Reality Suite', () => {
  test.describe.configure({ timeout: 180000 });

  test.beforeEach(async ({ page }) => {
    await ensureArtifactsDirs();
    await page.goto('/#range', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('cyber-range-root')).toBeVisible({ timeout: 20000 });
  });

  test('Scenario A: Sara receives Finance GPO and mapped F: opens through real SMB path', async ({ page }) => {
    await loginDomainUser(page, 'FIN-WS01', 'sara.finance');
    await openFileExplorer(page);

    const mappedF = page.getByTestId('mapped-drive-F');
    await expect(mappedF).toBeVisible({ timeout: 10000 });
    await mappedF.click();

    const access = page.getByTestId('file-access-result');
    await expect(access).toHaveAttribute('data-state', 'success', { timeout: 10000 });
    await expect(access).toHaveAttribute('data-reason', '');

    await saveScreenshot(page, 'gpo-sara-finance-mapped-drive.png');
  });

  test('Scenario B: Omar receives HR GPO and never receives mapped F:', async ({ page }) => {
    await loginDomainUser(page, 'HR-WS01', 'omar.hr');
    await openFileExplorer(page);

    await expect(page.getByTestId('mapped-drive-H')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('mapped-drive-F')).toBeHidden();

    await saveScreenshot(page, 'gpo-omar-hr-mapped-drive.png');
  });

  test('Scenario C: GPMC exposes baseline GPOs and enterprise hierarchy', async ({ page }) => {
    await selectDevice(page, 'FIN-WS01');
    const gpoTab = page.getByTestId('tab-group-policy');
    await gpoTab.click();
    await expect(gpoTab).toHaveAttribute('data-state', 'active');

    await expect(page.getByTestId('group-policy-console')).toBeVisible();
    await expect(page.getByTestId('gpo-tree')).toBeVisible();
    await expect(page.getByTestId('gpo-item-gpo-domain-baseline')).toBeVisible();
    await expect(page.getByTestId('gpo-item-gpo-workstation-baseline')).toBeVisible();
    await expect(page.getByTestId('gpo-item-gpo-finance-policy')).toBeVisible();

    await saveScreenshot(page, 'gpo-gpmc-console-inspector.png');
  });

  test('Scenario D: Service policy disables and restores LanmanServer on FILE01', async ({ page }) => {
    await openGpoComputerConfig(page, 'FILE01', 'gpo-domain-baseline');

    const lanmanPolicy = page.getByTestId('policy-lanman-disabled');
    await lanmanPolicy.check();
    await page.getByTestId('gpo-apply-active-machine').click();

    await expect(page.getByTestId('gpo-apply-result')).toHaveAttribute('data-state', 'success');
    await expect(page.getByTestId('gpo-runtime-lanman')).toHaveAttribute('data-state', 'STOPPED');

    await lanmanPolicy.uncheck();
    await page.getByTestId('gpo-apply-active-machine').click();
    await expect(page.getByTestId('gpo-runtime-lanman')).toHaveAttribute('data-state', 'RUNNING');

    await saveScreenshot(page, 'gpo-service-policy-lanmanserver.png');
  });

  test('Scenario E: Firewall GPO blocks SMB and File Explorer reports FIREWALL_DENIED', async ({ page }) => {
    await openGpoComputerConfig(page, 'FIN-WS01', 'gpo-workstation-baseline');

    const firewallPolicy = page.getByTestId('policy-smb-firewall-blocked');
    await firewallPolicy.check();
    await page.getByTestId('gpo-apply-active-machine').click();

    await expect(page.getByTestId('gpo-apply-result')).toHaveAttribute('data-state', 'success');
    await expect(page.getByTestId('gpo-runtime-smb-firewall')).toHaveAttribute('data-state', 'BLOCKED');

    await loginDomainUser(page, 'FIN-WS01', 'sara.finance');
    await openFileExplorer(page);
    await expect(page.getByTestId('mapped-drive-F')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('mapped-drive-F').click();

    const access = page.getByTestId('file-access-result');
    await expect(access).toHaveAttribute('data-state', 'denied', { timeout: 10000 });
    await expect(access).toHaveAttribute('data-reason', 'FIREWALL_DENIED');

    await saveScreenshot(page, 'gpo-firewall-smb-blocked.png');
  });

  test('Scenario F: Removing firewall GPO consequence restores SMB access', async ({ page }) => {
    await openGpoComputerConfig(page, 'FIN-WS01', 'gpo-workstation-baseline');

    const firewallPolicy = page.getByTestId('policy-smb-firewall-blocked');
    await firewallPolicy.check();
    await page.getByTestId('gpo-apply-active-machine').click();
    await expect(page.getByTestId('gpo-runtime-smb-firewall')).toHaveAttribute('data-state', 'BLOCKED');

    await firewallPolicy.uncheck();
    await page.getByTestId('gpo-apply-active-machine').click();
    await expect(page.getByTestId('gpo-runtime-smb-firewall')).toHaveAttribute('data-state', 'ALLOWED');

    await loginDomainUser(page, 'FIN-WS01', 'sara.finance');
    await openFileExplorer(page);
    await page.getByTestId('mapped-drive-F').click();

    await expect(page.getByTestId('file-access-result')).toHaveAttribute('data-state', 'success', { timeout: 10000 });

    await saveScreenshot(page, 'gpo-firewall-smb-restored.png');
  });

  test('Scenario G: RSOP precedence identifies Finance Policy as winning user screen-lock source', async ({ page }) => {
    await selectDevice(page, 'FIN-WS01');
    const rsopTab = page.getByTestId('tab-rsop');
    await rsopTab.click();
    await expect(rsopTab).toHaveAttribute('data-state', 'active');
    await expect(page.getByTestId('rsop-panel')).toBeVisible();

    const row = page.getByTestId('rsop-setting-user-desktopRestrictions-screenLockTimeout');
    await expect(row).toBeVisible();
    await expect(row).toContainText('600');
    await expect(row).toContainText('NEXORA - Finance Policy');

    await saveScreenshot(page, 'gpo-rsop-precedence.png');
  });
});
