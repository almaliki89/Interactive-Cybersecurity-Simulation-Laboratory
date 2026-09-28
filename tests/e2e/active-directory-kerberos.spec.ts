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
  const currentDir = await page.locator('html').getAttribute('dir');
  const targetDir = targetLang === 'ar' ? 'rtl' : 'ltr';

  if (currentDir !== targetDir) {
    const langBtn = page.getByTestId('lang-toggle-btn').first();
    await expect(langBtn).toBeVisible({ timeout: 5000 });
    await langBtn.click();
    await page.waitForFunction(
      (expected) => document.documentElement.getAttribute('dir') === expected,
      targetDir
    );
  }
}

async function navigateToWorld(page: Page, worldId: string) {
  await page.goto(`/#${worldId}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(500); // Allow React state to initialize
}

async function saveScreenshot(page: Page, name: string) {
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, name), fullPage: false });
  await page.screenshot({ path: path.join(VISUAL_QA_DIR, name), fullPage: false });
  console.log(`Captured screenshot: ${name}`);
}

test.describe('Active Directory & Kerberos Complete E2E Integration Suite', () => {

  test('E2E AD & Kerberos Scenarios', async ({ page }) => {
    test.setTimeout(180000);
    page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack || err.message));
    page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });

    await page.setViewportSize(VIEWPORT);
    await navigateToWorld(page, 'range');
    await switchLanguage(page, 'en');

    // ==========================================
    // 1 — SARA.FINANCE LOGIN
    // ==========================================
    // Navigate to FIN-WS01
    const finWsBtn = page.getByTestId('nav-device-FIN-WS01');
    await expect(finWsBtn).toBeVisible();
    await finWsBtn.click();

    // Click Sessions tab
    const sessTab = page.getByTestId('tab-sessions-inspector');
    await expect(sessTab).toBeVisible();
    await sessTab.click();

    // Fill in credentials for sara.finance
    const usernameInput = page.getByTestId('domain-username-input');
    const passwordInput = page.getByTestId('domain-password-input');
    const loginBtn = page.getByTestId('domain-login-btn');

    await usernameInput.fill('sara.finance');
    await passwordInput.fill('P@ssword123!');
    await loginBtn.click();

    // Expect successful logon (logged-in-user is visible with sara.finance)
    const loggedInUser = page.getByTestId('logged-in-user');
    await expect(loggedInUser).toBeVisible({ timeout: 10000 });
    await expect(loggedInUser).toContainText('sara.finance');

    // Select Kerberos tab and verify TGT
    const kerberosTab = page.getByTestId('tab-kerberos-inspector');
    await expect(kerberosTab).toBeVisible();
    await kerberosTab.click();

    const ticketList = page.getByTestId('kerberos-ticket-list');
    await expect(ticketList).toContainText('TGT');
    await expect(ticketList).toContainText('sara.finance@NEXORA.LOCAL');

    // Capture TGT issued screenshot
    await saveScreenshot(page, 'kerberos-tgt-issued.png');

    // ==========================================
    // 2 — FINANCE SHARE ACCESS
    // ==========================================
    // Select FILE01 device
    const file01Btn = page.getByTestId('nav-device-FILE01');
    await expect(file01Btn).toBeVisible();
    await file01Btn.click();

    // On Network & CLI tab, click "Connect as Sara" for Finance share
    const connectAsSaraBtn = page.locator('button:has-text("Connect as Sara")').first();
    await expect(connectAsSaraBtn).toBeVisible();
    await connectAsSaraBtn.click();

    // Select FIN-WS01 and view Kerberos tab
    await finWsBtn.click();
    await kerberosTab.click();

    // Verify TGS is cached for cifs/FILE01
    await expect(ticketList).toContainText('TGS');
    await expect(ticketList).toContainText('cifs/FILE01');

    // Save screenshots
    await saveScreenshot(page, 'kerberos-tgs-cifs-file01.png');
    await saveScreenshot(page, 'finance-share-authorized.png');

    // ==========================================
    // 3 — HR AUTHENTICATION VS AUTHORIZATION
    // ==========================================
    // Select Sessions tab and log off Sara
    await sessTab.click();
    const logoffBtn = page.getByTestId('domain-logoff-btn');
    await expect(logoffBtn).toBeVisible();
    await logoffBtn.click();

    // Login as omar.hr
    await usernameInput.fill('omar.hr');
    await passwordInput.fill('P@ssword123!');
    await loginBtn.click();

    // Verify logon succeeds
    await expect(loggedInUser).toBeVisible();
    await expect(loggedInUser).toContainText('omar.hr');

    // Select FILE01 and connect as Omar (HR) to Finance share -> ACCESS_DENIED
    await file01Btn.click();
    const connectAsOmarBtn = page.locator('button:has-text("Connect as Omar")').first();
    await expect(connectAsOmarBtn).toBeVisible();
    await connectAsOmarBtn.click();

    // Save screenshot for Access Denied
    await saveScreenshot(page, 'finance-share-access-denied.png');

    // ==========================================
    // 4 — DC CABLE FAILURE
    // ==========================================
    // Log off Omar on FIN-WS01
    await finWsBtn.click();
    await sessTab.click();
    await logoffBtn.click();

    // Disconnect DC01 cable
    const dcCableBtn = page.getByTestId('cable-CAB-SRV-DC01');
    await expect(dcCableBtn).toBeVisible();
    await dcCableBtn.click();

    const disconnectBtn = page.getByTestId('cable-disconnect-btn');
    await expect(disconnectBtn).toBeVisible();
    await disconnectBtn.click();

    // Return to FIN-WS01 and attempt logon as sara.finance
    await finWsBtn.click();
    await sessTab.click();
    await usernameInput.fill('sara.finance');
    await passwordInput.fill('P@ssword123!');
    await loginBtn.click();

    // Verify error is shown
    const loginError = page.getByTestId('domain-login-error');
    await expect(loginError).toBeVisible();
    await expect(loginError).toContainText('DOMAIN_CONTROLLER_UNREACHABLE');

    // Capture cable failure logon failure
    await saveScreenshot(page, 'domain-login-dc-offline.png');

    // ==========================================
    // 5 — RESTORE DC CONNECTIVITY
    // ==========================================
    // Reconnect DC01 cable
    await dcCableBtn.click();
    const reconnectBtn = page.getByTestId('cable-reconnect-btn');
    await expect(reconnectBtn).toBeVisible();
    await reconnectBtn.click();

    // Return to FIN-WS01 and sign in again -> succeeds
    await finWsBtn.click();
    await sessTab.click();
    await loginBtn.click();

    // Expect successful logon again
    await expect(loggedInUser).toBeVisible();
    await expect(loggedInUser).toContainText('sara.finance');

    // Capture restored logon screenshot
    await saveScreenshot(page, 'domain-login-restored.png');

    // ==========================================
    // 6 — AD ADMIN CONSOLE E2E
    // ==========================================
    // Select AD Console Tab
    const adConsoleTab = page.getByTestId('tab-ad-console');
    await expect(adConsoleTab).toBeVisible();
    await adConsoleTab.click();

    // Expect AD Admin Console view visible
    const adConsole = page.getByTestId('ad-console');
    await expect(adConsole).toBeVisible();

    // Click Users sub-tab if needed (it is default)
    await expect(page.getByText('sara.finance')).toBeVisible();

    // Save AD Domain overview screenshot
    await saveScreenshot(page, 'ad-domain-overview.png');

    // Click on sara.finance user element
    const saraUserEl = page.locator('div:has-text("sara.finance")').last();
    await saraUserEl.click();

    // Verify details panel shows user SID, UPN, Enabled, and Groups
    await expect(page.getByText('S-1-5-21-99887766-2001')).toBeVisible();
    await expect(page.getByText('sara.finance@NEXORA.LOCAL')).toBeVisible();
    await expect(page.getByText('YES')).toBeVisible();
    await expect(page.getByText('Finance Users')).toBeVisible();

    // Capture User Sara screenshot
    await saveScreenshot(page, 'ad-user-sara.png');

    // ==========================================
    // 7 — DC01 HEALTH INSPECTOR
    // ==========================================
    // Select DC01
    const dc01Btn = page.getByTestId('nav-device-DC01');
    await expect(dc01Btn).toBeVisible();
    await dc01Btn.click();

    // Select DC01 Health Tab
    const dc01HealthTab = page.getByTestId('tab-dc01-inspector');
    await expect(dc01HealthTab).toBeVisible();
    await dc01HealthTab.click();

    const dc01Inspector = page.getByTestId('dc01-inspector');
    await expect(dc01Inspector).toBeVisible();

    // Verify roles and counts
    await expect(dc01Inspector).toContainText('DC01.NEXORA.LOCAL');
    await expect(dc01Inspector).toContainText('AD DS ONLINE');
    await expect(dc01Inspector).toContainText('Identity Directory');
    await expect(dc01Inspector).toContainText('Domain Computers');
    await expect(dc01Inspector).toContainText('Active Tickets');

    console.log('E2E Active Directory & Kerberos Complete E2E Integration Succeeded!');
  });
});
