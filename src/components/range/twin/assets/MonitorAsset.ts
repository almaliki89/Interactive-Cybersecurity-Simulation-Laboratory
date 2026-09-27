/**
 * OMEGA ULTRA REALITY V1.1 — 32" Enterprise 4K Monitor Asset
 * Realistic slim bezel, metal stand, cable routing, and dynamic desktop screen texture.
 */

import * as THREE from 'three';

export interface MonitorAssetResult {
  group: THREE.Group;
  screenMaterial: THREE.MeshStandardMaterial;
  powerLed: THREE.Mesh;
  updateScreenState: (isOnline: boolean, username?: string, hostname?: string) => void;
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

  const renderCanvasScreen = (isOnline: boolean, username = 'sara.finance', hostname = 'FIN-WS01') => {
    if (!ctx) return;
    if (!isOnline) {
      // Monitor in power-save / sleep
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, 1024, 576);
      ctx.fillStyle = '#334155';
      ctx.font = '22px monospace';
      ctx.fillText('NO SIGNAL — ENTERING STANDBY', 330, 280);
      return;
    }

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
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 576);
      ctx.stroke();
    }
    for (let y = 0; y < 576; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Corporate Security Banner Watermark
    ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`NEXORA SECURE WORKSPACE // ${hostname}`, 60, 80);

    // PowerShell Terminal Window
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.fillRect(60, 110, 580, 360);
    ctx.strokeRect(60, 110, 580, 360);

    // Terminal Titlebar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(60, 110, 580, 32);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`Administrator: Windows PowerShell (pid 4120)`, 75, 132);

    // Terminal Commands
    ctx.fillStyle = '#38bdf8';
    ctx.font = '15px monospace';
    ctx.fillText(`PS C:\\Users\\${username}> whoami /all`, 80, 175);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`USER: NEXORA\\${username} | SID: S-1-5-21-99887766-2001`, 80, 205);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`GROUP: NEXORA\\Finance-Staff [Enabled]`, 80, 230);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PS C:\\Users\\${username}> Test-NetConnection -Port 445 FILE01`, 80, 275);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`TcpTestSucceeded : True (SMB port open to 10.10.10.12)`, 80, 305);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PS C:\\Users\\${username}> _`, 80, 350);

    // Mini Performance & Security Agent Window on Right
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(660, 110, 300, 360);
    ctx.strokeRect(660, 110, 300, 360);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(660, 110, 300, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('EDR Sentinel Agent — Realtime', 675, 132);

    ctx.fillStyle = '#4ade80';
    ctx.font = '12px monospace';
    ctx.fillText('● ENGINE: ACTIVE', 680, 170);
    ctx.fillText('● BEHAVIOR MONITOR: OK', 680, 195);
    ctx.fillText('● NETWORK FILTER: ENFORCED', 680, 220);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CPU LOAD: 6.4%', 680, 260);
    ctx.fillText('RAM: 5.2 / 16.0 GB (32%)', 680, 285);
    ctx.fillText('IP: 10.10.30.15', 680, 310);
    ctx.fillText('GATEWAY: 10.10.30.1', 680, 335);

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

    // Clock
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    ctx.fillText('10:42 AM', 930, 552);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('NEXORA HQ', 930, 568);
  };

  renderCanvasScreen(true);
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

  const updateScreenState = (isOnline: boolean, username?: string, hostname?: string) => {
    renderCanvasScreen(isOnline, username, hostname);
    screenTexture.needsUpdate = true;
    screenMaterial.emissiveIntensity = isOnline ? 0.45 : 0.02;
  };

  return { group, screenMaterial, powerLed, updateScreenState };
}
