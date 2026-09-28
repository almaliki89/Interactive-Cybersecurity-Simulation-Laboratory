# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: active-directory-kerberos.spec.ts >> Active Directory & Kerberos Complete E2E Integration Suite >> E2E AD & Kerberos Scenarios
- Location: tests/e2e/active-directory-kerberos.spec.ts:47:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('tab-sessions-inspector')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('tab-sessions-inspector') with timeout 10000ms
  - waiting for getByTestId('tab-sessions-inspector')

```

```yaml
- banner:
  - button "OMEGA Cyber Range"
  - navigation:
    - button "Cyber Range"
    - button "60 Worlds"
    - button "Knowledge Graph"
    - button "Learning Paths"
    - button "Glossary"
  - button "Command ⌘K"
  - button "التبديل إلى العربية": ع
  - button "Guided"
  - button "Sandbox"
- main:
  - text: ENTERPRISE DIGITAL TWIN REALITY ENGINE V1.1 · T+0ms
  - button "Building HQ"
  - button "Server Room"
  - button "Rack Front"
  - button "Rack Rear (Cabling)"
  - button "Workstation"
  - button "3D WebGL"
  - button "2D Schematic"
  - button "Unmute Ambient Sound"
  - text: NEXORA HQ INVENTORY LIVE TWIN
  - button "Data Center & Server Room RU 1-42"
  - text: RACK-01 (Primary Core Rack 42U)
  - button "PP-01 RU 40"
  - button "FW-01 RU 38"
  - button "CORE-SW01 RU 36"
  - button "DC01 RU 30"
  - button "FILE01 RU 26"
  - button "PDU-01 RU 1"
  - button "UPS-01 RU 3"
  - button "Finance Department Floor 2"
  - button "FIN-WS01 WS"
  - button "Security Operations Center (SOC)"
  - button "IT Operations & Infrastructure"
  - button "Network Operations Room (NOC)"
  - button "Headquarters Reception"
  - text: PHYSICAL CABLE RUNS 10
  - button "CAB-UPLINK-01 UP"
  - button "CAB-SRV-DC01 UP"
  - button "CAB-SRV-FL01 UP"
  - button "CAB-PATCH-WS01 UP"
  - button "CAB-WALL-WS01 UP"
  - button "CAB-PATCH-HR01 UP"
  - button "CAB-WALL-HR01 UP"
  - button "CAB-PATCH-IT01 UP"
  - button "CAB-WALL-IT01 UP"
  - button "CAB-MGMT-01 UP"
  - text: "SERVER ROOM AMBIENT 20.5 °C RACK INTAKE AIR 19.2 °C TOTAL LOAD 1.84 kW • Click device in 3D to inspect • Drag to orbit | Scroll to zoom • Press 1: HQ | 2: Room | 3: Rack | 4: Desk FIN-WS01 WORKSTATION FIN-WS01 — Finance Lead Workstation (Sara / Accounting)"
  - button "POWER OFF"
  - text: STATUS ONLINE TEMP 32.1 °C DRAW 145 W
  - button "Network & CLI"
  - button "System & HW"
  - button "Proc (6)"
  - button "Sess (0)"
  - button "Logs"
  - button "Kerberos"
  - button "AD Console"
  - text: "ACTIVE NETWORK INTERFACE OPERATIONAL (UP) Adapter Name: Realtek PCIe GbE IPv4 Address: 10.10.30.15 Subnet Mask: 255.255.255.0 Default Gateway: 10.10.30.1 DNS Server: 10.10.10.10 Physical MAC: 00:1A:2B:3C:4D:5E VLAN Segment: VLAN 30 TX: 450 pkts (57,600 B) RX: 890 pkts (113,920 B) PHYSICAL CABLE: CAB-WALL-WS01 CONNECTED"
  - button "Disconnect Cable"
  - text: SIMULATED NETWORK DIAGNOSTIC CLI
  - button "nslookup FILE01"
  - button "ping DC01"
  - button "Test SMB (445)"
  - button "ipconfig /all"
  - button "arp -a"
  - button "route print"
  - textbox "e.g. nslookup FILE01, ping 10.10.10.10": nslookup FILE01
  - button "RUN"
  - text: "NEXORA HEADQUARTERS RACK-01:"
  - strong: 42U ACTIVE
  - text: "DC01:"
  - strong: ONLINE (10.10.10.10)
  - text: "CORE-SW01:"
  - strong: 5-PORT UP
  - text: "CLOCK: RUNNING POWER:"
  - strong: 1.14 kW
  - text: "TEMP:"
  - strong: 21.4 °C
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | import * as path from 'path';
  3   | import * as fs from 'fs';
  4   | 
  5   | const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
  6   | const VISUAL_QA_DIR = path.join(process.cwd(), 'artifacts', 'visual-qa');
  7   | 
  8   | // Ensure directories exist
  9   | if (!fs.existsSync(ARTIFACTS_DIR)) {
  10  |   fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  11  | }
  12  | if (!fs.existsSync(VISUAL_QA_DIR)) {
  13  |   fs.mkdirSync(VISUAL_QA_DIR, { recursive: true });
  14  | }
  15  | 
  16  | const VIEWPORT = { width: 1440, height: 900 };
  17  | 
  18  | async function switchLanguage(page: Page, targetLang: 'en' | 'ar') {
  19  |   const currentDir = await page.locator('html').getAttribute('dir');
  20  |   const targetDir = targetLang === 'ar' ? 'rtl' : 'ltr';
  21  | 
  22  |   if (currentDir !== targetDir) {
  23  |     const langBtn = page.getByTestId('lang-toggle-btn').first();
  24  |     await expect(langBtn).toBeVisible({ timeout: 5000 });
  25  |     await langBtn.click();
  26  |     await page.waitForFunction(
  27  |       (expected) => document.documentElement.getAttribute('dir') === expected,
  28  |       targetDir
  29  |     );
  30  |   }
  31  | }
  32  | 
  33  | async function navigateToWorld(page: Page, worldId: string) {
  34  |   await page.goto(`/#${worldId}`, { waitUntil: 'domcontentloaded' });
  35  |   await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  36  |   await page.waitForTimeout(500); // Allow React state to initialize
  37  | }
  38  | 
  39  | async function saveScreenshot(page: Page, name: string) {
  40  |   await page.screenshot({ path: path.join(ARTIFACTS_DIR, name), fullPage: false });
  41  |   await page.screenshot({ path: path.join(VISUAL_QA_DIR, name), fullPage: false });
  42  |   console.log(`Captured screenshot: ${name}`);
  43  | }
  44  | 
  45  | test.describe('Active Directory & Kerberos Complete E2E Integration Suite', () => {
  46  | 
  47  |   test('E2E AD & Kerberos Scenarios', async ({ page }) => {
  48  |     test.setTimeout(180000);
  49  |     page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack || err.message));
  50  |     page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });
  51  | 
  52  |     await page.setViewportSize(VIEWPORT);
  53  |     await navigateToWorld(page, 'range');
  54  |     await switchLanguage(page, 'en');
  55  | 
  56  |     // ==========================================
  57  |     // 1 — SARA.FINANCE LOGIN
  58  |     // ==========================================
  59  |     // Navigate to FIN-WS01
  60  |     const finWsBtn = page.getByTestId('nav-device-FIN-WS01');
  61  |     await expect(finWsBtn).toBeVisible();
  62  |     await finWsBtn.click();
  63  | 
  64  |     // Click Sessions tab
  65  |     const sessTab = page.getByTestId('tab-sessions-inspector');
> 66  |     await expect(sessTab).toBeVisible();
      |                           ^ Error: expect(locator).toBeVisible() failed
  67  |     await sessTab.click();
  68  | 
  69  |     // Fill in credentials for sara.finance
  70  |     const usernameInput = page.getByTestId('domain-username-input');
  71  |     const passwordInput = page.getByTestId('domain-password-input');
  72  |     const loginBtn = page.getByTestId('domain-login-btn');
  73  | 
  74  |     await usernameInput.fill('sara.finance');
  75  |     await passwordInput.fill('P@ssword123!');
  76  |     await loginBtn.click();
  77  | 
  78  |     // Expect successful logon (logged-in-user is visible with sara.finance)
  79  |     const loggedInUser = page.getByTestId('logged-in-user');
  80  |     await expect(loggedInUser).toBeVisible({ timeout: 10000 });
  81  |     await expect(loggedInUser).toContainText('sara.finance');
  82  | 
  83  |     // Select Kerberos tab and verify TGT
  84  |     const kerberosTab = page.getByTestId('tab-kerberos-inspector');
  85  |     await expect(kerberosTab).toBeVisible();
  86  |     await kerberosTab.click();
  87  | 
  88  |     const ticketList = page.getByTestId('kerberos-ticket-list');
  89  |     await expect(ticketList).toContainText('TGT');
  90  |     await expect(ticketList).toContainText('sara.finance@NEXORA.LOCAL');
  91  | 
  92  |     // Capture TGT issued screenshot
  93  |     await saveScreenshot(page, 'kerberos-tgt-issued.png');
  94  | 
  95  |     // ==========================================
  96  |     // 2 — FINANCE SHARE ACCESS
  97  |     // ==========================================
  98  |     // Select FILE01 device
  99  |     const file01Btn = page.getByTestId('nav-device-FILE01');
  100 |     await expect(file01Btn).toBeVisible();
  101 |     await file01Btn.click();
  102 | 
  103 |     // On Network & CLI tab, click "Connect as Sara" for Finance share
  104 |     const connectAsSaraBtn = page.locator('button:has-text("Connect as Sara")').first();
  105 |     await expect(connectAsSaraBtn).toBeVisible();
  106 |     await connectAsSaraBtn.click();
  107 | 
  108 |     // Select FIN-WS01 and view Kerberos tab
  109 |     await finWsBtn.click();
  110 |     await kerberosTab.click();
  111 | 
  112 |     // Verify TGS is cached for cifs/FILE01
  113 |     await expect(ticketList).toContainText('TGS');
  114 |     await expect(ticketList).toContainText('cifs/FILE01');
  115 | 
  116 |     // Save screenshots
  117 |     await saveScreenshot(page, 'kerberos-tgs-cifs-file01.png');
  118 |     await saveScreenshot(page, 'finance-share-authorized.png');
  119 | 
  120 |     // ==========================================
  121 |     // 3 — HR AUTHENTICATION VS AUTHORIZATION
  122 |     // ==========================================
  123 |     // Select Sessions tab and log off Sara
  124 |     await sessTab.click();
  125 |     const logoffBtn = page.getByTestId('domain-logoff-btn');
  126 |     await expect(logoffBtn).toBeVisible();
  127 |     await logoffBtn.click();
  128 | 
  129 |     // Login as omar.hr
  130 |     await usernameInput.fill('omar.hr');
  131 |     await passwordInput.fill('P@ssword123!');
  132 |     await loginBtn.click();
  133 | 
  134 |     // Verify logon succeeds
  135 |     await expect(loggedInUser).toBeVisible();
  136 |     await expect(loggedInUser).toContainText('omar.hr');
  137 | 
  138 |     // Select FILE01 and connect as Omar (HR) to Finance share -> ACCESS_DENIED
  139 |     await file01Btn.click();
  140 |     const connectAsOmarBtn = page.locator('button:has-text("Connect as Omar")').first();
  141 |     await expect(connectAsOmarBtn).toBeVisible();
  142 |     await connectAsOmarBtn.click();
  143 | 
  144 |     // Save screenshot for Access Denied
  145 |     await saveScreenshot(page, 'finance-share-access-denied.png');
  146 | 
  147 |     // ==========================================
  148 |     // 4 — DC CABLE FAILURE
  149 |     // ==========================================
  150 |     // Log off Omar on FIN-WS01
  151 |     await finWsBtn.click();
  152 |     await sessTab.click();
  153 |     await logoffBtn.click();
  154 | 
  155 |     // Disconnect DC01 cable
  156 |     const dcCableBtn = page.getByTestId('cable-CAB-SRV-DC01');
  157 |     await expect(dcCableBtn).toBeVisible();
  158 |     await dcCableBtn.click();
  159 | 
  160 |     const disconnectBtn = page.getByTestId('cable-disconnect-btn');
  161 |     await expect(disconnectBtn).toBeVisible();
  162 |     await disconnectBtn.click();
  163 | 
  164 |     // Return to FIN-WS01 and attempt logon as sara.finance
  165 |     await finWsBtn.click();
  166 |     await sessTab.click();
```