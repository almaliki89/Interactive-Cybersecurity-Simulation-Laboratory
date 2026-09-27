import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'visual-qa');

// Ensure artifacts folder exists
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

// Viewports to test
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 800 },
  tabletLandscape: { width: 1024, height: 768 },
  tabletPortrait: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
  smallMobile: { width: 360, height: 800 },
};

/**
 * Helper to assert no horizontal viewport overflow
 */
async function assertNoHorizontalOverflow(page: Page, contextName: string) {
  const isOverflowing = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
    const clientWidth = docEl.clientWidth;
    return scrollWidth > clientWidth + 1; // Allow 1px subpixel rounding tolerance
  });

  if (isOverflowing) {
    const details = await page.evaluate(() => {
      const docEl = document.documentElement;
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing: string[] = [];
      const vw = docEl.clientWidth;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > vw + 2) {
          overflowing.push(
            `${el.tagName.toLowerCase()}.${Array.from(el.classList).slice(0, 3).join('.')} (right: ${Math.round(rect.right)}, clientWidth: ${vw})`
          );
        }
      }
      return overflowing.slice(0, 5).join(' | ');
    });

    expect(isOverflowing, `Horizontal overflow detected in ${contextName}: ${details}`).toBeFalsy();
  }
}

/**
 * Helper to ensure language switch
 */
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

  await expect(page.locator('html')).toHaveAttribute('dir', targetDir);
}

/**
 * Helper to navigate to a simulation world via hash
 */
async function navigateToWorld(page: Page, worldId: string) {
  await page.goto(`/#${worldId}`, { waitUntil: 'domcontentloaded' });
  // Wait for header to be visible
  await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(300); // Allow react suspense/animation to settle
}

test.describe('OMEGA Phase 4B — Real Browser Visual QA', () => {

  // 1. SOC OPERATIONS WORLD
  test.describe('SOC Operations World', () => {
    test('SOC Desktop 1440x900 - English & Arabic Render QA', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'soc');
      await switchLanguage(page, 'en');

      // Assert structural components in Desktop SOC
      await expect(page.locator('header')).toBeVisible();
      await expect(page.getByTestId('soc-alert-queue')).toBeVisible();
      await expect(page.getByTestId('soc-investigation-pane')).toBeVisible();
      await expect(page.getByTestId('soc-inspector')).toBeVisible();

      // Check no horizontal overflow
      await assertNoHorizontalOverflow(page, 'SOC Desktop EN');

      // Screenshot EN
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-desktop-en.png'),
        fullPage: false,
      });

      // Switch to Arabic RTL
      await switchLanguage(page, 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await assertNoHorizontalOverflow(page, 'SOC Desktop AR');

      // Screenshot AR
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-desktop-ar.png'),
        fullPage: false,
      });
    });

    test('SOC Mobile 390x844 & Small Mobile 360x800 QA, Drawers & RTL', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await navigateToWorld(page, 'soc');
      await switchLanguage(page, 'en');

      // Mobile toolbar should be visible
      const mobileToolbar = page.getByTestId('soc-mobile-toolbar');
      await expect(mobileToolbar).toBeVisible();

      // Check toolbar button bounding box
      const queueBtn = page.getByTestId('soc-toggle-queue-btn');
      const box = await queueBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(36); // Touch friendly target
      }

      // Check no horizontal overflow
      await assertNoHorizontalOverflow(page, 'SOC Mobile EN Default');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-mobile-en.png'),
        fullPage: false,
      });

      // 1. Open Queue drawer on mobile
      await queueBtn.click();
      const mobileQueue = page.getByTestId('soc-mobile-queue-drawer');
      await expect(mobileQueue).toBeVisible();
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-mobile-queue-open.png'),
        fullPage: false,
      });

      // 2. Open Inspector drawer on mobile -> must mutually exclude queue drawer
      const inspectorBtn = page.getByTestId('soc-toggle-inspector-btn');
      await inspectorBtn.click();
      await expect(page.getByTestId('soc-mobile-inspector-drawer')).toBeVisible();
      await expect(page.getByTestId('soc-mobile-queue-drawer')).toBeHidden();
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-mobile-inspector-open.png'),
        fullPage: false,
      });

      // 3. Test Escape key closes drawer
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('soc-mobile-inspector-drawer')).toBeHidden();

      // Test Small Mobile 360x800 Arabic
      await page.setViewportSize(VIEWPORTS.smallMobile);
      await switchLanguage(page, 'ar');
      await assertNoHorizontalOverflow(page, 'SOC Small Mobile AR');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-mobile-ar.png'),
        fullPage: false,
      });
    });
  });

  // 2. DIGITAL FORENSICS WORLD
  test.describe('Digital Forensics World', () => {
    test('Forensics Desktop 1440x900 - English & Arabic Render QA', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'forensics');
      await switchLanguage(page, 'en');

      // Assert structural components in Forensics
      await expect(page.locator('header')).toBeVisible();
      await expect(page.getByTestId('forensics-workspace')).toBeVisible();

      await assertNoHorizontalOverflow(page, 'Forensics Desktop EN');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'forensics-desktop-en.png'),
        fullPage: false,
      });

      // Switch to Arabic RTL
      await switchLanguage(page, 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await assertNoHorizontalOverflow(page, 'Forensics Desktop AR');

      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'forensics-desktop-ar.png'),
        fullPage: false,
      });
    });

    test('Forensics Mobile 390x844 & 360x800 QA, Drawers & Technical Isolation', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await navigateToWorld(page, 'forensics');
      await switchLanguage(page, 'en');

      await assertNoHorizontalOverflow(page, 'Forensics Mobile EN');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'forensics-mobile-en.png'),
        fullPage: false,
      });

      // 1. Evidence Drawer
      const toggleEvidenceBtn = page.getByTestId('toggle-evidence-btn');
      if (await toggleEvidenceBtn.isVisible()) {
        await toggleEvidenceBtn.click();
        const evidenceDrawer = page.getByTestId('mobile-evidence-drawer');
        await expect(evidenceDrawer).toBeVisible();
        await page.screenshot({
          path: path.join(ARTIFACTS_DIR, 'forensics-mobile-evidence-open.png'),
          fullPage: false,
        });

        // Close via close button
        const closeBtn = page.getByTestId('close-evidence-drawer-btn');
        await closeBtn.click();
        await expect(evidenceDrawer).toBeHidden();
      }

      // 2. Inspector Drawer
      const toggleInspectorBtn = page.getByTestId('toggle-inspector-btn');
      if (await toggleInspectorBtn.isVisible()) {
        await toggleInspectorBtn.click();
        const inspectorDrawer = page.getByTestId('mobile-inspector-drawer');
        await expect(inspectorDrawer).toBeVisible();
        await page.screenshot({
          path: path.join(ARTIFACTS_DIR, 'forensics-mobile-inspector-open.png'),
          fullPage: false,
        });

        // Close with Escape
        await page.keyboard.press('Escape');
        await expect(inspectorDrawer).toBeHidden();
      }

      // 3. Technical Drawer
      const toggleTechBtn = page.getByTestId('toggle-tech-btn');
      if (await toggleTechBtn.isVisible()) {
        await toggleTechBtn.click();
        await page.screenshot({
          path: path.join(ARTIFACTS_DIR, 'forensics-mobile-technical-open.png'),
          fullPage: false,
        });
        await page.keyboard.press('Escape');
      }

      // Small Mobile 360x800 in Arabic
      await page.setViewportSize(VIEWPORTS.smallMobile);
      await switchLanguage(page, 'ar');
      await assertNoHorizontalOverflow(page, 'Forensics Small Mobile AR');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'forensics-mobile-ar.png'),
        fullPage: false,
      });
    });
  });

  // 3. THREAT HUNTING WORLD (V16)
  test.describe('Threat Hunting World', () => {
    test('Threat Hunting Desktop 1440x900 - English & Arabic Render QA', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'threat_hunting');
      await switchLanguage(page, 'en');

      const workspace = page.getByTestId('threat-hunting-workspace');
      await expect(workspace).toBeVisible();
      await assertNoHorizontalOverflow(page, 'Threat Hunting Desktop EN');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'threat-hunting-desktop-en.png'),
        fullPage: false,
      });

      // Switch tabs: Query Editor
      const queryTab = page.getByTestId('tab-query');
      if (await queryTab.isVisible()) {
        await queryTab.click();
        const runBtn = page.getByTestId('btn-run-query');
        if (await runBtn.isVisible()) {
          await runBtn.click();
          await page.screenshot({
            path: path.join(ARTIFACTS_DIR, 'threat-hunting-query-results.png'),
            fullPage: false,
          });
        }
      }

      // Switch tabs: Detection Builder
      const detTab = page.getByTestId('tab-detection');
      if (await detTab.isVisible()) {
        await detTab.click();
        const testBtn = page.getByTestId('btn-test-rule');
        if (await testBtn.isVisible()) {
          await testBtn.click();
          await page.screenshot({
            path: path.join(ARTIFACTS_DIR, 'threat-hunting-detection-builder.png'),
            fullPage: false,
          });
        }
      }

      // Switch to Arabic RTL
      await switchLanguage(page, 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await assertNoHorizontalOverflow(page, 'Threat Hunting Desktop AR');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'threat-hunting-desktop-ar.png'),
        fullPage: false,
      });
    });

    test('Threat Hunting Mobile 390x844 & 360x800 QA, Drawers & RTL', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await navigateToWorld(page, 'threat_hunting');
      await switchLanguage(page, 'en');

      await assertNoHorizontalOverflow(page, 'Threat Hunting Mobile EN');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'threat-hunting-mobile-en.png'),
        fullPage: false,
      });

      // 1. Mobile Navigator Drawer
      const navBtn = page.getByTestId('hunt-mobile-nav-btn');
      if (await navBtn.isVisible()) {
        await navBtn.click();
        await expect(page.getByTestId('hunt-mobile-nav-drawer')).toBeVisible();
        await page.keyboard.press('Escape');
      }

      // 2. Mobile Inspector Drawer
      const inspectorBtn = page.getByTestId('hunt-mobile-inspector-btn');
      if (await inspectorBtn.isVisible()) {
        await inspectorBtn.click();
        await expect(page.getByTestId('hunt-mobile-inspector-drawer')).toBeVisible();
        await page.keyboard.press('Escape');
      }

      // Switch to Arabic RTL on Small Mobile
      await page.setViewportSize(VIEWPORTS.smallMobile);
      await switchLanguage(page, 'ar');
      await assertNoHorizontalOverflow(page, 'Threat Hunting Small Mobile AR');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'threat-hunting-mobile-ar.png'),
        fullPage: false,
      });
    });
  });

  // 4. DEVSECOPS SUPPLY CHAIN WORLD
  test.describe('DevSecOps World', () => {
    test('DevSecOps Desktop 1440x900 - English & Arabic Render QA', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'devsecops');
      await switchLanguage(page, 'en');

      await expect(page.locator('header')).toBeVisible();
      await assertNoHorizontalOverflow(page, 'DevSecOps Desktop EN');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'devsecops-desktop-en.png'),
        fullPage: false,
      });

      // Switch to Arabic RTL
      await switchLanguage(page, 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await assertNoHorizontalOverflow(page, 'DevSecOps Desktop AR');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'devsecops-desktop-ar.png'),
        fullPage: false,
      });
    });
  });

  // 4. CLOUD & CONTAINERS SANITY QA
  test.describe('Cloud & Containers Worlds Sanity QA', () => {
    test('Cloud Security Desktop 1440x900', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'cloud');
      await switchLanguage(page, 'en');

      await expect(page.locator('header')).toBeVisible();
      await assertNoHorizontalOverflow(page, 'Cloud Desktop EN');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'cloud-desktop-en.png'),
        fullPage: false,
      });
    });

    test('Containers & Kubernetes Security Desktop 1440x900', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'containers');
      await switchLanguage(page, 'en');

      await expect(page.locator('header')).toBeVisible();
      await assertNoHorizontalOverflow(page, 'Containers Desktop EN');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'containers-desktop-en.png'),
        fullPage: false,
      });
    });
  });

  // 5. TABLET VIEWPORTS QA (1024x768 Landscape & 768x1024 Portrait)
  test.describe('Tablet Viewports QA', () => {
    test('SOC Tablet Landscape & Portrait', async ({ page }) => {
      await navigateToWorld(page, 'soc');
      await switchLanguage(page, 'en');

      // Landscape
      await page.setViewportSize(VIEWPORTS.tabletLandscape);
      await assertNoHorizontalOverflow(page, 'SOC Tablet Landscape');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-tablet-landscape-en.png'),
        fullPage: false,
      });

      // Portrait
      await page.setViewportSize(VIEWPORTS.tabletPortrait);
      await assertNoHorizontalOverflow(page, 'SOC Tablet Portrait');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'soc-tablet-portrait-en.png'),
        fullPage: false,
      });
    });

    test('Forensics Tablet Landscape & Portrait (AR)', async ({ page }) => {
      await navigateToWorld(page, 'forensics');

      // Landscape EN
      await switchLanguage(page, 'en');
      await page.setViewportSize(VIEWPORTS.tabletLandscape);
      await assertNoHorizontalOverflow(page, 'Forensics Tablet Landscape');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'forensics-tablet-landscape-en.png'),
        fullPage: false,
      });

      // Portrait AR
      await switchLanguage(page, 'ar');
      await page.setViewportSize(VIEWPORTS.tabletPortrait);
      await assertNoHorizontalOverflow(page, 'Forensics Tablet Portrait AR');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'forensics-tablet-portrait-ar.png'),
        fullPage: false,
      });
    });
  });

  // 6. CRITICAL ACCESSIBILITY & TECHNICAL ISOLATION ASSERTIONS
  test.describe('Accessibility & Technical Isolation', () => {
    test('Verifies technical values maintain dir="ltr" in RTL Arabic mode', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'forensics');
      await switchLanguage(page, 'ar');

      // Elements with hashes, timestamps, or code blocks should have dir="ltr" or unicode-bidi isolation
      const ltrElements = page.locator('[dir="ltr"]');
      const count = await ltrElements.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Global Header bounding box and visibility at 360px small mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.smallMobile);
      await navigateToWorld(page, 'soc');

      const header = page.locator('header');
      const box = await header.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.width).toBeLessThanOrEqual(VIEWPORTS.smallMobile.width + 1);
      }

      // Check lang toggle button inside header is clickable and within bounds
      const langToggle = page.getByTestId('lang-toggle-btn').first();
      const langBox = await langToggle.boundingBox();
      expect(langBox).not.toBeNull();
      if (langBox) {
        expect(langBox.x + langBox.width).toBeLessThanOrEqual(VIEWPORTS.smallMobile.width + 5);
      }
    });
  });

  // 7. OMEGA ULTRA REALITY — ENTERPRISE DIGITAL TWIN CYBER RANGE
  test.describe('Enterprise Digital Twin Cyber Range', () => {
    test('Cyber Range Desktop 1440x900 - 3D Digital Twin & 2D Schematic QA', async ({ page }) => {
      test.setTimeout(90000);
      page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack || err.message));
      page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'range');
      await switchLanguage(page, 'en');

      // Assert structural components in Cyber Range Digital Twin
      await expect(page.locator('header')).toBeVisible();
      await expect(page.getByText('ENTERPRISE DIGITAL TWIN')).toBeVisible();
      await expect(page.getByText('NEXORA HQ INVENTORY')).toBeVisible();

      // 1. Expect 3D view visible
      await expect(page.getByTestId('digital-twin-3d-view')).toBeVisible();

      // Check no horizontal overflow
      await assertNoHorizontalOverflow(page, 'Digital Twin Desktop EN');

      // Screenshot 3D WebGL mode
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'digital-twin-desktop-en.png'),
        fullPage: false,
      });

      // 2. Click digital-twin-mode-2d
      await page.getByTestId('digital-twin-mode-2d').click();

      // 3. Expect digital-twin-2d-view visible
      await expect(page.getByTestId('digital-twin-2d-view')).toBeVisible();

      // 4. Expect RACK-01 ELEVATION SCHEMATIC (42U) visible
      await expect(page.getByText('RACK-01 ELEVATION SCHEMATIC (42U)')).toBeVisible();

      // Switch to Arabic RTL and verify schematic layout
      await switchLanguage(page, 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await assertNoHorizontalOverflow(page, 'Digital Twin 2D RTL AR');

      // Screenshot 2D Schematic in Arabic
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'digital-twin-schematic-ar.png'),
        fullPage: false,
      });

      // Switch back to English
      await switchLanguage(page, 'en');

      // 5. Click digital-twin-mode-3d
      await page.getByTestId('digital-twin-mode-3d').click();

      // 6. Expect digital-twin-3d-view visible
      await expect(page.getByTestId('digital-twin-3d-view')).toBeVisible();
    });

    test('Workstation Network Inspector & True DNS / Cable / Switch Failure E2E QA', async ({ page }) => {
      test.setTimeout(120000);
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToWorld(page, 'range');
      await switchLanguage(page, 'en');

      // 1. Select FIN-WS01 workstation in navigator
      const finWsNavBtn = page.getByTestId('nav-device-FIN-WS01');
      await expect(finWsNavBtn).toBeVisible();
      await finWsNavBtn.click();

      // Verify Network CLI container is visible in inspector
      const cliContainer = page.getByTestId('network-cli-container');
      await expect(cliContainer).toBeVisible();

      // Capture baseline screenshot
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'network-inspector-baseline.png'),
        fullPage: false,
      });

      // 2. Perform nslookup FILE01 (Flush cache first if needed, then run)
      const cliInput = page.getByTestId('cli-command-input');
      const runBtn = page.getByTestId('btn-run-cli-command');
      const outputElem = page.getByTestId('cli-command-output');

      await cliInput.fill('nslookup FILE01');
      await runBtn.click();

      // Expect output with successful resolution: 10.10.20.10
      await expect(outputElem).toBeVisible();
      await expect(outputElem).toContainText('10.10.20.10');

      // Capture DNS Success screenshot
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'network-dns-success.png'),
        fullPage: false,
      });

      // 3. Genuine Cable Interaction: Select CAB-SRV-DC01 in navigator or inspector
      const dcCableBtn = page.getByTestId('cable-CAB-SRV-DC01');
      await expect(dcCableBtn).toBeVisible();
      await dcCableBtn.click();

      // Click DISCONNECT on the cable
      const disconnectBtn = page.getByTestId('cable-disconnect-btn');
      await expect(disconnectBtn).toBeVisible();
      await disconnectBtn.click();

      // Capture cable disconnected state
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'network-cable-disconnected.png'),
        fullPage: false,
      });

      // 4. Return to FIN-WS01, flush DNS cache, and run nslookup FILE01 again -> FAIL
      await finWsNavBtn.click();
      await cliInput.fill('ipconfig /flushdns');
      await runBtn.click();
      await expect(outputElem).toContainText('Successfully flushed');

      await cliInput.fill('nslookup FILE01');
      await runBtn.click();

      // Expect failure because physical path to DNS server DC01 is broken
      await expect(outputElem).toContainText('***');

      // Capture DNS Failure screenshot
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'network-dns-failure.png'),
        fullPage: false,
      });

      // 5. Reconnect CAB-SRV-DC01
      await dcCableBtn.click();
      const reconnectBtn = page.getByTestId('cable-reconnect-btn');
      await expect(reconnectBtn).toBeVisible();
      await reconnectBtn.click();

      // Capture cable reconnected state
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'network-cable-reconnected.png'),
        fullPage: false,
      });

      // 6. Return to FIN-WS01 and retry nslookup FILE01 -> SUCCESS
      await finWsNavBtn.click();
      await cliInput.fill('nslookup FILE01');
      await runBtn.click();

      await expect(outputElem).toContainText('10.10.20.10');

      // Capture final restored state
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'network-dns-restored.png'),
        fullPage: false,
      });

      // Select CORE-SW01 to view Switch MAC Table
      const coreSwNavBtn = page.getByTestId('nav-device-CORE-SW01');
      await coreSwNavBtn.click();

      const macTableCard = page.getByTestId('switch-mac-table-card');
      await expect(macTableCard).toBeVisible();

      // Capture Switch MAC Table screenshot
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'switch-mac-table.png'),
        fullPage: false,
      });
    });
  });

});
