/**
 * OMEGA ULTRA REALITY V1.1.1 — 32" Enterprise 4K Monitor Asset
 * Realistic slim bezel, metal stand, cable routing, and dynamic desktop screen texture
 * backed directly by RealityEngine / WindowsMachine and DigitalTwin derived state.
 */

import * as THREE from 'three';

export interface WorkstationScreenState {
  powerStatus: 'ONLINE' | 'OFFLINE';
  hostname: string;
  domain: string;
  ipAddress: string;
  loggedOnUser: string | null;
  sessionCount: number;
  processCount: number;
  networkStatus: 'CONNECTED' | 'DISCONNECTED';
  activeInterfaceCount: number;
  virtualTime: number;
}

export interface MonitorAssetResult {
  group: THREE.Group;
  screenMaterial: THREE.MeshStandardMaterial;
  powerLed: THREE.Mesh;
  updateScreenState: (state: WorkstationScreenState) => void;
}

export function createMonitorAsset(): MonitorAssetResult {
  const group = new THREE.Group();

  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x090c10,
    metalness: 0.9,
    roughness: 0.25,
  });

  const standMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.95,
    roughness: 0.2,
  });

  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 2.0,
  });

  // Base Plate (Solid die-cast aluminum)
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.22), standMat);
  base.position.set(0, 0.007, 0);
  base.receiveShadow = true;
  group.add(base);

  // Vertical Upright Pillar with Cable Routing Hole
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.38, 16), standMat);
  pillar.position.set(0, 0.19, -0.06);
  pillar.castShadow = true;
  group.add(pillar);

  // Articulating Tilt/Swivel VESA Bracket
  const vesa = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.025), standMat);
  vesa.position.set(0, 0.36, -0.04);
  group.add(vesa);

  // Monitor Chassis & Bezel (16:9 32" aspect ratio)
  const monitorWidth = 0.88;
  const monitorHeight = 0.52;
  const monitorDepth = 0.035;

  const enclosure = new THREE.Mesh(new THREE.BoxGeometry(monitorWidth, monitorHeight, monitorDepth), bezelMat);
  enclosure.position.set(0, 0.36, 0);
  enclosure.castShadow = true;
  group.add(enclosure);

  // Power LED on Bottom Right Bezel
  const powerLed = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 6), ledGreenMat);
  powerLed.position.set(monitorWidth / 2 - 0.03, 0.36 - monitorHeight / 2 + 0.008, 0.019);
  group.add(powerLed);

  // 2D Canvas for Live Screen Rendering
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext('2d');

  // Cache last state to avoid redundant canvas rerenders
  let lastStateKey = '';

  const renderCanvasScreen = (state: WorkstationScreenState) => {
    if (!ctx) return;

    // 1. OFFLINE -> Black / No-signal screen
    if (state.powerStatus === 'OFFLINE') {
      ctx.fillStyle = '#020305';
      ctx.fillRect(0, 0, 1024, 576);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('NO SIGNAL — ENTERING STANDBY', 335, 275);
      ctx.font = '13px monospace';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`DP-1 [DISCONNECTED] // POWER OFF`, 390, 310);
      return;
    }

    // 2. ONLINE BUT NO ACTIVE LOGGED ON USER -> Enterprise Lock Screen
    if (!state.loggedOnUser) {
      // Modern corporate lockscreen background
      const lockGrad = ctx.createLinearGradient(0, 0, 1024, 576);
      lockGrad.addColorStop(0, '#040d1a');
      lockGrad.addColorStop(0.5, '#071527');
      lockGrad.addColorStop(1, '#020611');
      ctx.fillStyle = lockGrad;
      ctx.fillRect(0, 0, 1024, 576);

      // Subtle geometric circuit lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(100, 0); ctx.lineTo(100, 576);
      ctx.moveTo(924, 0); ctx.lineTo(924, 576);
      ctx.moveTo(0, 288); ctx.lineTo(1024, 288);
      ctx.stroke();

      // Top branding banner
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`NEXORA ENTERPRISE ZERO-TRUST WORKSTATION`, 330, 48);

      // Virtual Clock (derived from virtualTime)
      const totalSeconds = Math.floor(state.virtualTime / 1000);
      const hours = String(8 + Math.floor(totalSeconds / 3600) % 24).padStart(2, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(`${hours}:${minutes}`, 430, 200);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`SIMULATION VIRTUAL TIME: T+${state.virtualTime}ms`, 365, 235);

      // Lock Screen Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(362, 270, 300, 190);
      ctx.strokeRect(362, 270, 300, 190);

      // User avatar placeholder icon
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(512, 320, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('🔒', 500, 328);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Press Ctrl+Alt+Delete to sign in', 400, 380);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText(`Host: ${state.hostname}.${state.domain}`, 405, 410);
      ctx.fillText(`IP: ${state.ipAddress} [${state.networkStatus}]`, 405, 430);

      // Bottom Bar
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 532, 1024, 44);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`NETWORK: ${state.networkStatus}`, 32, 558);
      ctx.fillText(`PROCS: ${state.processCount}`, 220, 558);
      ctx.fillText(`SESSIONS: 0 ACTIVE`, 360, 558);
      ctx.fillText(`NEXORA IT SECURITY POLICY ENFORCED`, 710, 558);
      return;
    }

    // 3. ONLINE + ACTIVE SESSION -> Full Live Enterprise Desktop
    // Gradient Wallpaper
    const grad = ctx.createLinearGradient(0, 0, 1024, 576);
    grad.addColorStop(0, '#06162a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 576);

    // Subtle Grid Background
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, 576);
      ctx.stroke();
    }
    for (let y = 0; y < 576; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Corporate Security Banner Watermark
    ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`NEXORA SECURE WORKSPACE // ${state.hostname}`, 60, 75);

    // PowerShell Terminal Window
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.fillRect(60, 100, 580, 380);
    ctx.strokeRect(60, 100, 580, 380);

    // Terminal Titlebar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(60, 100, 580, 32);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(`Administrator: Windows PowerShell (Session active)`, 75, 122);

    // Live Terminal Commands and Reality State
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText(`PS C:\\Users\\${state.loggedOnUser}> whoami`, 80, 165);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${state.domain}\\${state.loggedOnUser}`, 80, 190);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PS C:\\Users\\${state.loggedOnUser}> Get-NetIPAddress -InterfaceAlias "Ethernet*"`, 80, 230);
    ctx.fillStyle = state.networkStatus === 'CONNECTED' ? '#4ade80' : '#f87171';
    ctx.fillText(
      `IPAddress: ${state.ipAddress} | LinkStatus: ${state.networkStatus}`,
      80,
      255
    );

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PS C:\\Users\\${state.loggedOnUser}> Get-Process | Measure-Object`, 80, 295);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Count    : ${state.processCount} Running Processes`, 80, 320);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PS C:\\Users\\${state.loggedOnUser}> quser`, 80, 360);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`USERNAME              SESSIONNAME        ID  STATE   IDLE TIME`, 80, 385);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`${state.loggedOnUser.padEnd(21)}console            1   Active          .`, 80, 405);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PS C:\\Users\\${state.loggedOnUser}> _`, 80, 445);

    // Mini Performance & Security Agent Window on Right
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(660, 100, 300, 380);
    ctx.strokeRect(660, 100, 300, 380);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(660, 100, 300, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('EDR Sentinel Agent — Realtime', 675, 122);

    ctx.fillStyle = '#4ade80';
    ctx.font = '12px monospace';
    ctx.fillText('● SYSTEM: ONLINE', 680, 160);
    ctx.fillText(
      state.networkStatus === 'CONNECTED' ? '● LINK LAYER: UP' : '▲ LINK LAYER: DOWN (UNPLUGGED)',
      680,
      185
    );
    ctx.fillText('● SECURITY LOGS: ACTIVE', 680, 210);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`HOST: ${state.hostname}`, 680, 250);
    ctx.fillText(`DOMAIN: ${state.domain}`, 680, 275);
    ctx.fillText(`IP: ${state.ipAddress}`, 680, 300);
    ctx.fillText(`INTERFACES: ${state.activeInterfaceCount} ACTIVE`, 680, 325);
    ctx.fillText(`SESSIONS: ${state.sessionCount} RUNNING`, 680, 350);
    ctx.fillText(`V-TIME: T+${state.virtualTime}ms`, 680, 375);

    // Windows Taskbar
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 528, 1024, 48);
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, 528);
    ctx.lineTo(1024, 528);
    ctx.stroke();

    // Start Button
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(16, 536, 32, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('❖', 23, 558);

    // Active User on Taskbar
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(`${state.loggedOnUser} @ ${state.hostname}`, 64, 556);

    // Virtual Clock on Taskbar
    const totalSecs = Math.floor(state.virtualTime / 1000);
    const h = String(8 + Math.floor(totalSecs / 3600) % 24).padStart(2, '0');
    const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const s = String(totalSecs % 60).padStart(2, '0');

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px sans-serif';
    ctx.fillText(`${h}:${m}:${s}`, 930, 550);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText(`T+${state.virtualTime}ms`, 930, 566);
  };

  // Initial draw
  const defaultInitState: WorkstationScreenState = {
    powerStatus: 'ONLINE',
    hostname: 'FIN-WS01',
    domain: 'NEXORA.LOCAL',
    ipAddress: '10.10.30.15',
    loggedOnUser: null,
    sessionCount: 0,
    processCount: 6,
    networkStatus: 'CONNECTED',
    activeInterfaceCount: 1,
    virtualTime: 0,
  };

  renderCanvasScreen(defaultInitState);
  const screenTexture = new THREE.CanvasTexture(canvas);
  screenTexture.generateMipmaps = true;

  const screenMaterial = new THREE.MeshStandardMaterial({
    map: screenTexture,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.45,
    roughness: 0.35,
  });

  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(monitorWidth - 0.02, monitorHeight - 0.02),
    screenMaterial
  );
  screenMesh.position.set(0, 0.36, 0.018);
  group.add(screenMesh);

  const updateScreenState = (state: WorkstationScreenState) => {
    // Check if state changed to avoid canvas repaint overhead
    const key = `${state.powerStatus}-${state.hostname}-${state.loggedOnUser}-${state.sessionCount}-${state.processCount}-${state.networkStatus}-${state.virtualTime}`;
    if (key === lastStateKey) return;
    lastStateKey = key;

    renderCanvasScreen(state);
    screenTexture.needsUpdate = true;
    screenMaterial.emissiveIntensity = state.powerStatus === 'ONLINE' ? 0.45 : 0.02;
  };

  return { group, screenMaterial, powerLed, updateScreenState };
}
