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
  console.log('[AD-E2E] switchLanguage: waiting for lang-toggle-btn visible');
  await expect(langBtn).toBeVisible({ timeout: 10000 });

  const btnText = (await langBtn.innerText()).trim();
  console.log('[AD-E2E] switchLanguage: btnText is ' + btnText);
  // When language is Arabic ('ar'), button shows 'EN' to switch to English.
  // When language is English ('en'), button shows 'ع' to switch to Arabic.
  if (targetLang === 'en' && btnText === 'EN') {
    console.log('[AD-E2E] switchLanguage: clicking EN to switch to English');
    await langBtn.click();
    await page.waitForFunction(
      () => document.documentElement.getAttribute('dir') === 'ltr',
      null,
      { timeout: 10000 }
    );
  } else if (targetLang === 'ar' && btnText === 'ع') {
    console.log('[AD-E2E] switchLanguage: clicking ع to switch to Arabic');
    await langBtn.click();
    await page.waitForFunction(
      () => document.documentElement.getAttribute('dir') === 'rtl',
      null,
      { timeout: 10000 }
    );
  }

  console.log('[AD-E2E] switchLanguage: verifying dir attribute');
  await expect(page.locator('html')).toHaveAttribute('dir', targetDir);
  console.log('[AD-E2E] switchLanguage: finished successfully');
}

async function navigateToWorld(page: Page, worldId: string) {
  console.log('[AD-E2E] navigateToWorld: goto #' + worldId);
  await page.goto(`/#${worldId}`, { waitUntil: 'domcontentloaded' });
  console.log('[AD-E2E] navigateToWorld: waiting for header');
  await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  console.log('[AD-E2E] navigateToWorld: header visible, waiting 1000ms');
  await page.waitForTimeout(1000);
  console.log('[AD-E2E] navigateToWorld: done');
}

async function saveScreenshot(page: Page, name: string) {
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, name), fullPage: false });
  await page.screenshot({ path: path.join(VISUAL_QA_DIR, name), fullPage: false });
  console.log(`[AD-E2E] Captured screenshot: ${name}`);
}

test.describe('Active Directory & Kerberos Integration Suite', () => {

  test.beforeEach(async ({ page }) => {
    console.log('[AD-E2E] BEFORE_EACH: start');
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
    
    console.log('[AD-E2E] BEFORE_EACH: calling navigateToWorld');
    await navigateToWorld(page, 'range');
    console.log('[AD-E2E] BEFORE_EACH: calling switchLanguage');
    await switchLanguage(page, 'en');
    console.log('[AD-E2E] BEFORE_EACH: finished');
  });

  test('Scenario A: sara.finance logon and Kerberos TGT issuance', async ({ page }) => {
    await test.step('Select FIN-WS01', async () => {
      console.log('[AD-E2E] STEP: Select FIN-WS01 - locating button');
      const finBtn = page.getByTestId('nav-device-FIN-WS01');
      const count = await finBtn.count();
      console.log('[AD-E2E] STEP: Select FIN-WS01 - count:', count);
      console.log('[AD-E2E] STEP: Select FIN-WS01 - waiting for visible');
      await expect(finBtn).toBeVisible({ timeout: 5000 });
      console.log('[AD-E2E] STEP: Select FIN-WS01 - clicking');
      await finBtn.click();
      console.log('[AD-E2E] STEP: Select FIN-WS01 - clicked, waiting for inspector');
      await expect(page.getByTestId('device-inspector-FIN-WS01')).toBeVisible({ timeout: 5000 });
      console.log('[AD-E2E] STEP: Select FIN-WS01 - inspector visible!');
    });

    await test.step('Open Sessions tab', async () => {
      console.log('[AD-E2E] STEP: Open Sessions tab');
      await page.getByTestId('tab-sessions-inspector').click();
      await expect(page.getByTestId('sessions-panel')).toBeVisible();
    });

    await test.step('Perform domain logon as sara.finance', async () => {
      console.log('[AD-E2E] STEP: Perform domain logon');
      const loginStatus = page.getByTestId('domain-login-status');
      await expect(loginStatus).toHaveAttribute('data-state', 'none');

      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();

      await expect(loginStatus).toHaveAttribute('data-state', 'authenticated', { timeout: 10000 });
      await expect(page.getByTestId('logged-in-user')).toContainText('sara.finance');
    });

    await test.step('Verify Kerberos TGT', async () => {
      console.log('[AD-E2E] STEP: Verify TGT');
      await page.getByTestId('tab-kerberos-inspector').click();
      await expect(page.getByTestId('kerberos-inspector')).toBeVisible();
      
      const tgtTicket = page.locator('[data-ticket-type="TGT"]').first();
      await expect(tgtTicket).toBeVisible();
      await expect(tgtTicket).toContainText('sara.finance@NEXORA.LOCAL');
      
      await saveScreenshot(page, 'kerberos-tgt-issued.png');
    });
  });

  test('Scenario B: Finance share access and TGS validation', async ({ page }) => {
    // 1. First login as sara
    await page.getByTestId('nav-device-FIN-WS01').click();
    await page.getByTestId('tab-sessions-inspector').click();
    await page.getByTestId('domain-username-input').fill('sara.finance');
    await page.getByTestId('domain-password-input').fill('P@ssword123!');
    await page.getByTestId('domain-login-btn').click();
    await expect(page.getByTestId('logged-in-user')).toBeVisible();

    await test.step('Select FILE01 and connect to Finance share', async () => {
      console.log('[AD-E2E] STEP: Select FILE01 and connect');
      await page.getByTestId('nav-device-FILE01').click();
      await expect(page.getByTestId('device-inspector-FILE01')).toBeVisible();
      
      await page.getByTestId('tab-network-inspector').click();
      const connectBtn = page.getByTestId('smb-finance-connect-sara');
      await expect(connectBtn).toBeVisible();
      await connectBtn.click();
      
      const result = page.getByTestId('smb-access-result');
      await expect(result).toHaveAttribute('data-result', 'success');
      await saveScreenshot(page, 'finance-share-authorized.png');
    });

    await test.step('Verify TGS on FIN-WS01', async () => {
      console.log('[AD-E2E] STEP: Verify TGS on workstation');
      await page.getByTestId('nav-device-FIN-WS01').click();
      await page.getByTestId('tab-kerberos-inspector').click();
      
      const tgsTicket = page.locator('[data-ticket-type="TGS"][data-service-principal="cifs/FILE01"]');
      await expect(tgsTicket).toBeVisible();
      await saveScreenshot(page, 'kerberos-tgs-cifs-file01.png');
    });
  });

  test('Scenario C: omar.hr authorization denied', async ({ page }) => {
    await test.step('Login as omar.hr on FIN-WS01', async () => {
      console.log('[AD-E2E] STEP: Login omar.hr');
      await page.getByTestId('nav-device-FIN-WS01').click();
      await page.getByTestId('tab-sessions-inspector').click();
      await page.getByTestId('domain-username-input').fill('omar.hr');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
      await expect(page.getByTestId('logged-in-user')).toContainText('omar.hr');
    });

    await test.step('Attempt Finance share access as Omar', async () => {
      console.log('[AD-E2E] STEP: Access Finance as Omar');
      await page.getByTestId('nav-device-FILE01').click();
      await page.getByTestId('tab-network-inspector').click();
      
      const connectBtn = page.getByTestId('smb-finance-connect-omar');
      await expect(connectBtn).toBeVisible();
      await connectBtn.click();
      
      const result = page.getByTestId('smb-access-result');
      await expect(result).toHaveAttribute('data-result', 'access-denied');
      await saveScreenshot(page, 'finance-share-access-denied.png');
    });
  });

  test('Scenario D: DC cable disconnect and logon failure recovery', async ({ page }) => {
    await test.step('Disconnect DC01 cable', async () => {
      console.log('[AD-E2E] STEP: Disconnect DC cable');
      await page.getByTestId('cable-CAB-SRV-DC01').click();
      await expect(page.getByTestId('cable-inspector')).toBeVisible();
      
      const disconnectBtn = page.getByTestId('cable-disconnect-btn');
      await expect(disconnectBtn).toBeVisible();
      await disconnectBtn.click();
      
      // Verify disconnected state
      await expect(page.locator('[data-testid="cable-CAB-SRV-DC01"]')).toBeVisible();
    });

    await test.step('Attempt logon on FIN-WS01 while DC is offline', async () => {
      console.log('[AD-E2E] STEP: Attempt logon DC offline');
      await page.getByTestId('nav-device-FIN-WS01').click();
      await page.getByTestId('tab-sessions-inspector').click();
      
      await page.getByTestId('domain-username-input').fill('sara.finance');
      await page.getByTestId('domain-password-input').fill('P@ssword123!');
      await page.getByTestId('domain-login-btn').click();
      
      const error = page.getByTestId('domain-login-error');
      await expect(error).toBeVisible();
      await expect(error).toContainText('DOMAIN_CONTROLLER_UNREACHABLE');
      await saveScreenshot(page, 'domain-login-dc-offline.png');
    });

    await test.step('Reconnect DC01 cable and retry logon', async () => {
      console.log('[AD-E2E] STEP: Reconnect DC cable');
      await page.getByTestId('cable-CAB-SRV-DC01').click();
      const reconnectBtn = page.getByTestId('cable-reconnect-btn');
      await expect(reconnectBtn).toBeVisible();
      await reconnectBtn.click();
      
      console.log('[AD-E2E] STEP: Retry logon');
      await page.getByTestId('nav-device-FIN-WS01').click();
      await page.getByTestId('tab-sessions-inspector').click();
      await page.getByTestId('domain-login-btn').click();
      
      await expect(page.getByTestId('logged-in-user')).toBeVisible();
      await saveScreenshot(page, 'domain-login-restored.png');
    });
  });

  test('Scenario E: AD Console and DC01 Inspector integrity', async ({ page }) => {
    await test.step('Verify AD Console Users', async () => {
      console.log('[AD-E2E] STEP: AD Console');
      await page.getByTestId('nav-device-FIN-WS01').click();
      await page.getByTestId('tab-ad-console').click();
      await expect(page.getByTestId('ad-console')).toBeVisible();
      
      const saraEntry = page.getByTestId('ad-user-sara.finance');
      await expect(saraEntry).toBeVisible();
      await saraEntry.click();
      
      await expect(page.getByTestId('ad-user-upn')).toContainText('sara.finance@NEXORA.LOCAL');
      await expect(page.getByTestId('ad-user-sid')).toContainText('S-1-5-21-99887766-2001');
      await expect(page.getByTestId('ad-user-enabled')).toContainText('YES');
      await expect(page.getByTestId('ad-user-groups')).toContainText('Finance Users');
      
      await saveScreenshot(page, 'ad-user-sara.png');
    });

    await test.step('Verify DC01 Health Inspector', async () => {
      console.log('[AD-E2E] STEP: DC01 Health');
      await page.getByTestId('nav-device-DC01').click();
      await page.getByTestId('tab-dc01-inspector').click();
      await expect(page.getByTestId('dc01-inspector')).toBeVisible();
      
      const status = page.getByTestId('dc01-ad-status');
      await expect(status).toHaveAttribute('data-state', 'ONLINE');
      await expect(status).toContainText('AD DS ONLINE');
      
      await saveScreenshot(page, 'ad-domain-overview.png');
    });
  });
});
