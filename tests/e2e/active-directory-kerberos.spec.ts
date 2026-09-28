import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const VISUAL_QA_DIR = path.join(process.cwd(), 'artifacts', 'visual-qa');

// Ensure directories exist
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}
if (!fs.existsSync(VISUAL_QA_DIR)) {
  fs.mkdirSync(VISUAL_QA_DIR, { recursive: true });
}

const VIEWPORT = { width: 1440, height: 900 };

async function switchLanguage(page: Page, targetLang: 'en' | 'ar') {
  console.log('[AD-E2E] switchLanguage: start for ' + targetLang);
  const targetDir = targetLang === 'ar' ? 'rtl' : 'ltr';
  const langBtn = page.getByTestId('lang-toggle-btn').first();
  await expect(langBtn).toBeVisible({ timeout: 10000 });

  const btnText = (await langBtn.innerText()).trim();
  if (targetLang === 'en' && btnText === 'EN') {
    await langBtn.click({ force: true });
    await page.waitForFunction(
      () => document.documentElement.getAttribute('dir') === 'ltr',
      null,
      { timeout: 10000 }
    );
  } else if (targetLang === 'ar' && btnText === 'ع') {
    await langBtn.click({ force: true });
    await page.waitForFunction(
      () => document.documentElement.getAttribute('dir') === 'rtl',
      null,
      { timeout: 10000 }
    );
  }

  await expect(page.locator('html')).toHaveAttribute('dir', targetDir);
}

async function navigateToWorld(page: Page, worldId: string) {
  console.log('[AD-E2E] navigateToWorld: goto #' + worldId);
  await page.goto(`/#${worldId}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('nav-device-FIN-WS01')).toBeVisible({ timeout: 10000 });
}

async function saveScreenshot(page: Page, name: string) {
  try {
    const p = path.join(ARTIFACTS_DIR, name);
    await page.screenshot({ path: p, fullPage: false, timeout: 5000 });
    fs.copyFileSync(p, path.join(VISUAL_QA_DIR, name));
    console.log(`[AD-E2E] Captured screenshot: ${name}`);
  } catch (err) {
    console.log(`[AD-E2E] Screenshot skipped or timed out for ${name}`);
  }
}

test.describe('Active Directory & Kerberos Integration Suite', () => {
  // Configure generous timeout for virtualized runners
  test.describe.configure({ timeout: 90000 });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('omega_language', 'en');
      } catch {
        // ignore
      }
    });
    page.on('pageerror', err => console.log('[AD-E2E] PAGE ERROR:', err.stack || err.message));
    page.on('console', msg => console.log(`[AD-E2E BROWSER ${msg.type().toUpperCase()}]:`, msg.text()));
    
    await navigateToWorld(page, 'range');
    await switchLanguage(page, 'en');
  });

  test('Scenario A: sara.finance logon and Kerberos TGT issuance', async ({ page }) => {
    await test.step('Select FIN-WS01', async () => {
      const finBtn = page.getByTestId('nav-device-FIN-WS01');
      await expect(finBtn).toBeVisible({ timeout: 5000 });
      await finBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Open Sessions tab', async () => {
      const sessTab = page.getByTestId('tab-sessions-inspector');
      await sessTab.click({ force: true });
      await expect(page.getByTestId('sessions-panel')).toBeVisible();
    });

    await test.step('Perform domain logon as sara.finance', async () => {
      const loginStatus = page.getByTestId('domain-login-status');
      await expect(loginStatus).toHaveAttribute('data-state', 'none');

      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click({ force: true });

      await expect(loginStatus).toHaveAttribute('data-state', 'authenticated', { timeout: 15000 });
      await expect(page.getByTestId('logged-in-user')).toContainText('sara.finance');
    });

    await test.step('Verify Kerberos TGT', async () => {
      const kerbTab = page.getByTestId('tab-kerberos-inspector');
      await kerbTab.click({ force: true });
      await expect(page.getByTestId('kerberos-inspector')).toBeVisible();
      
      const tgtTicket = page.locator('[data-ticket-type="TGT"]').first();
      await expect(tgtTicket).toBeVisible();
      await expect(tgtTicket).toContainText('sara.finance@NEXORA.LOCAL');
      
      await saveScreenshot(page, 'kerberos-tgt-issued.png');
    });
  });

  test('Scenario B: Finance share access and TGS validation', async ({ page }) => {
    // 1. First login as sara
    const finBtn = page.getByTestId('nav-device-FIN-WS01');
    await finBtn.click({ force: true });
    await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();
    const sessTab = page.getByTestId('tab-sessions-inspector');
    await sessTab.click({ force: true });
    await page.getByTestId('domain-username-input').fill('sara.finance');
    await page.getByTestId('domain-password-input').fill('P@ssword123!');
    await page.getByTestId('domain-login-btn').click({ force: true });
    await expect(page.getByTestId('domain-login-status')).toHaveAttribute('data-state', 'authenticated', { timeout: 15000 });
    await expect(page.getByTestId('logged-in-user')).toContainText('sara.finance');

    await test.step('Select FILE01 and connect to Finance share', async () => {
      const fileBtn = page.getByTestId('nav-device-FILE01');
      await fileBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FILE01')).toBeVisible();
      
      const netTab = page.getByTestId('tab-network-inspector');
      await netTab.click({ force: true });
      const connectBtn = page.getByTestId('smb-finance-connect-sara');
      await expect(connectBtn).toBeVisible();
      await connectBtn.click({ force: true });
      
      const result = page.getByTestId('smb-access-result');
      await expect(result).toHaveAttribute('data-result', 'success', { timeout: 15000 });
      await saveScreenshot(page, 'finance-share-authorized.png');
    });

    await test.step('Verify TGS on FIN-WS01', async () => {
      const finBtn = page.getByTestId('nav-device-FIN-WS01');
      await finBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();
      const kerbTab = page.getByTestId('tab-kerberos-inspector');
      await kerbTab.click({ force: true });
      
      const tgsTicket = page.locator('[data-ticket-type="TGS"][data-service-principal="cifs/FILE01"]');
      await expect(tgsTicket).toBeVisible({ timeout: 15000 });
      await saveScreenshot(page, 'kerberos-tgs-cifs-file01.png');
    });
  });

  test('Scenario C: omar.hr authorization denied', async ({ page }) => {
    await test.step('Login as omar.hr on FIN-WS01', async () => {
      const finBtn = page.getByTestId('nav-device-FIN-WS01');
      await finBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();
      const sessTab = page.getByTestId('tab-sessions-inspector');
      await sessTab.click({ force: true });
      await page.getByTestId('domain-username-input').fill('omar.hr');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click({ force: true });
      await expect(page.getByTestId('domain-login-status')).toHaveAttribute('data-state', 'authenticated', { timeout: 15000 });
      await expect(page.getByTestId('logged-in-user')).toContainText('omar.hr');
    });

    await test.step('Verify Kerberos TGT for omar.hr', async () => {
      const kerbTab = page.getByTestId('tab-kerberos-inspector');
      await kerbTab.click({ force: true });
      await expect(page.getByTestId('kerberos-inspector')).toBeVisible();
      const tgtTicket = page.locator('[data-ticket-type="TGT"]').first();
      await expect(tgtTicket).toBeVisible();
      await expect(tgtTicket).toContainText('omar.hr@NEXORA.LOCAL');
    });

    await test.step('Attempt Finance share access as Omar', async () => {
      const fileBtn = page.getByTestId('nav-device-FILE01');
      await fileBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FILE01')).toBeVisible();
      const netTab = page.getByTestId('tab-network-inspector');
      await netTab.click({ force: true });
      
      const connectBtn = page.getByTestId('smb-finance-connect-omar');
      await expect(connectBtn).toBeVisible();
      await connectBtn.click({ force: true });
      
      const result = page.getByTestId('smb-access-result');
      await expect(result).toHaveAttribute('data-result', 'access-denied', { timeout: 15000 });
      await saveScreenshot(page, 'finance-share-access-denied.png');
    });
  });

  test('Scenario D: DC cable disconnect and logon failure recovery', async ({ page }) => {
    await test.step('Disconnect DC01 cable', async () => {
      const cableBtn = page.getByTestId('cable-CAB-SRV-DC01').first();
      await cableBtn.click({ force: true });
      await expect(page.getByTestId('cable-inspector')).toBeVisible({ timeout: 10000 });
      
      const disconnectBtn = page.getByTestId('cable-disconnect-btn');
      await expect(disconnectBtn).toBeVisible();
      await disconnectBtn.click({ force: true });
      
      // Verify disconnected cable status
      await expect(page.getByTestId('cable-status-CAB-SRV-DC01')).toHaveAttribute('data-state', 'DISCONNECTED');
    });

    await test.step('Attempt logon on FIN-WS01 while DC is offline', async () => {
      const finBtn = page.getByTestId('nav-device-FIN-WS01');
      await finBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();
      const sessTab = page.getByTestId('tab-sessions-inspector');
      await sessTab.click({ force: true });
      
      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click({ force: true });
      
      const error = page.getByTestId('domain-login-error');
      await expect(error).toBeVisible();
      await expect(error).toContainText('DOMAIN_CONTROLLER_UNREACHABLE');
      await saveScreenshot(page, 'domain-login-dc-offline.png');
    });

    await test.step('Reconnect DC01 cable and retry logon', async () => {
      const cableBtn = page.getByTestId('cable-CAB-SRV-DC01').first();
      await cableBtn.click({ force: true });
      await expect(page.getByTestId('cable-inspector')).toBeVisible({ timeout: 10000 });
      const reconnectBtn = page.getByTestId('cable-reconnect-btn');
      await expect(reconnectBtn).toBeVisible();
      await reconnectBtn.click({ force: true });
      
      await expect(page.getByTestId('cable-status-CAB-SRV-DC01')).toHaveAttribute('data-state', 'CONNECTED');

      const finBtn = page.getByTestId('nav-device-FIN-WS01');
      await finBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();
      const sessTab = page.getByTestId('tab-sessions-inspector');
      await sessTab.click({ force: true });
      await page.getByTestId('domain-login-btn').click({ force: true });
      
      await expect(page.getByTestId('domain-login-status')).toHaveAttribute('data-state', 'authenticated', { timeout: 15000 });
      await expect(page.getByTestId('logged-in-user')).toContainText('sara.finance');
      await saveScreenshot(page, 'domain-login-restored.png');
    });
  });

  test('Scenario E: AD Console and DC01 Inspector integrity', async ({ page }) => {
    await test.step('Verify AD Console Users', async () => {
      const finBtn = page.getByTestId('nav-device-FIN-WS01');
      await finBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible();
      const adTab = page.getByTestId('tab-ad-console');
      await adTab.click({ force: true });
      await expect(page.getByTestId('ad-console')).toBeVisible();
      
      const saraEntry = page.getByTestId('ad-user-sara.finance');
      await expect(saraEntry).toBeVisible();
      await saraEntry.click({ force: true });
      
      await expect(page.getByTestId('ad-user-upn')).toContainText('sara.finance@NEXORA.LOCAL');
      await expect(page.getByTestId('ad-user-sid')).toContainText('S-1-5-21-99887766-2001');
      await expect(page.getByTestId('ad-user-enabled')).toContainText('YES');
      await expect(page.getByTestId('ad-user-groups')).toContainText('Finance Users');
      
      await saveScreenshot(page, 'ad-user-sara.png');
    });

    await test.step('Verify DC01 Health Inspector', async () => {
      const dcBtn = page.getByTestId('nav-device-DC01');
      await dcBtn.click({ force: true });
      await expect(page.getByTestId('device-inspector-DC01')).toBeVisible({ timeout: 10000 });
      const tabDc01 = page.getByTestId('tab-dc01-inspector');
      await expect(tabDc01).toBeVisible({ timeout: 10000 });
      await tabDc01.click({ force: true });
      await expect(page.getByTestId('dc01-inspector')).toBeVisible({ timeout: 10000 });
      
      const status = page.getByTestId('dc01-ad-status');
      await expect(status).toHaveAttribute('data-state', 'ONLINE');
      await expect(status).toContainText('AD DS ONLINE');
      
      await saveScreenshot(page, 'ad-domain-overview.png');
    });
  });
});
