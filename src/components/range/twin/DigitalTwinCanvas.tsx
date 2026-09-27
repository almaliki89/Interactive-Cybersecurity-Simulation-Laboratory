/**
 * OMEGA ULTRA REALITY — Photorealistic 3D Digital Twin Canvas
 * Three.js WebGL rendering of NEXORA Headquarters, Server Room, RACK-01, and Workstations.
 * Fully synchronized with DigitalTwinStore and RealityEngine state.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';

export const DigitalTwinCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDeviceId = useDigitalTwinStore((s) => s.selectedDeviceId);
  const cameraMode = useDigitalTwinStore((s) => s.cameraMode);
  const selectedRoomId = useDigitalTwinStore((s) => s.selectedRoomId);
  const devices = useDigitalTwinStore((s) => s.devices);
  const selectDevice = useDigitalTwinStore((s) => s.selectDevice);

  // References to keep loop synchronized
  const cameraTargetPos = useRef(new THREE.Vector3(0, 14, 20));
  const cameraLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentCameraPos = useRef(new THREE.Vector3(0, 14, 20));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const deviceMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const interactiveObjectsRef = useRef<THREE.Object3D[]>([]);
  const fanBladesRef = useRef<THREE.Mesh[]>([]);
  const ledMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[]>>(new Map());
  const monitorScreenMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Sync camera targets based on cameraMode and selected device
  useEffect(() => {
    if (cameraMode === 'building') {
      cameraTargetPos.current.set(0, 12, 17);
      cameraLookAt.current.set(0, 0, 0);
    } else if (cameraMode === 'room') {
      if (selectedRoomId === 'server-room') {
        cameraTargetPos.current.set(-3.5, 3.2, 5.0);
        cameraLookAt.current.set(-3.5, 1.8, 0);
      } else if (selectedRoomId === 'finance-dept') {
        cameraTargetPos.current.set(4.2, 2.5, 4.0);
        cameraLookAt.current.set(4.2, 1.2, 0);
      } else {
        cameraTargetPos.current.set(0, 5, 8);
        cameraLookAt.current.set(0, 1, 0);
      }
    } else if (cameraMode === 'rack') {
      // Facing RACK-01
      cameraTargetPos.current.set(-3.5, 2.1, 2.8);
      cameraLookAt.current.set(-3.5, 1.9, 0);
    } else if (cameraMode === 'workstation') {
      // Facing FIN-WS01 desk
      cameraTargetPos.current.set(4.2, 1.45, 1.8);
      cameraLookAt.current.set(4.2, 1.2, 0);
    } else if (cameraMode === 'device') {
      if (selectedDeviceId === 'DC01') {
        cameraTargetPos.current.set(-3.5, 2.45, 1.2);
        cameraLookAt.current.set(-3.5, 2.4, 0);
      } else if (selectedDeviceId === 'FILE01') {
        cameraTargetPos.current.set(-3.5, 2.05, 1.2);
        cameraLookAt.current.set(-3.5, 2.0, 0);
      } else if (selectedDeviceId === 'CORE-SW01') {
        cameraTargetPos.current.set(-3.5, 2.8, 1.1);
        cameraLookAt.current.set(-3.5, 2.75, 0);
      } else if (selectedDeviceId === 'FW-01') {
        cameraTargetPos.current.set(-3.5, 3.0, 1.1);
        cameraLookAt.current.set(-3.5, 2.95, 0);
      } else if (selectedDeviceId === 'FIN-WS01') {
        cameraTargetPos.current.set(4.2, 1.45, 1.6);
        cameraLookAt.current.set(4.2, 1.2, 0);
      } else {
        cameraTargetPos.current.set(-3.5, 2.1, 2.5);
        cameraLookAt.current.set(-3.5, 1.9, 0);
      }
    }
  }, [cameraMode, selectedDeviceId, selectedRoomId]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.025);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.copy(cameraTargetPos.current);
    currentCameraPos.current.copy(cameraTargetPos.current);
    currentLookAt.current.copy(cameraLookAt.current);
    camera.lookAt(currentLookAt.current);

    // 3. Lighting (PBR Studio & Architectural)
    const ambientLight = new THREE.AmbientLight(0x232936, 1.4);
    scene.add(ambientLight);

    // Server Room overhead lighting (cool daylight 5500K LED linear bar)
    const serverRoomLight = new THREE.SpotLight(0xdbeafe, 8.5);
    serverRoomLight.position.set(-3.5, 5.0, 2.5);
    serverRoomLight.target.position.set(-3.5, 1.5, 0);
    serverRoomLight.angle = Math.PI / 3;
    serverRoomLight.penumbra = 0.6;
    serverRoomLight.castShadow = true;
    serverRoomLight.shadow.mapSize.width = 1024;
    serverRoomLight.shadow.mapSize.height = 1024;
    scene.add(serverRoomLight);
    scene.add(serverRoomLight.target);

    // Office overhead lighting (warm neutral 4000K)
    const officeLight = new THREE.SpotLight(0xfef3c7, 6.0);
    officeLight.position.set(4.2, 4.5, 2.0);
    officeLight.target.position.set(4.2, 1.0, 0);
    officeLight.angle = Math.PI / 3.2;
    officeLight.penumbra = 0.5;
    officeLight.castShadow = true;
    scene.add(officeLight);
    scene.add(officeLight.target);

    // Subtle blue architectural rim light from hallway
    const rimLight = new THREE.DirectionalLight(0x0284c7, 1.2);
    rimLight.position.set(0, 8, -6);
    scene.add(rimLight);

    // 4. Materials Palette
    const materials = {
      rackFrame: new THREE.MeshStandardMaterial({
        color: 0x14171d,
        metalness: 0.85,
        roughness: 0.45,
      }),
      rackRail: new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
        roughness: 0.35,
      }),
      serverChassis: new THREE.MeshStandardMaterial({
        color: 0x1e2530,
        metalness: 0.75,
        roughness: 0.4,
      }),
      serverBezel: new THREE.MeshStandardMaterial({
        color: 0x0f131a,
        metalness: 0.6,
        roughness: 0.6,
      }),
      driveCaddy: new THREE.MeshStandardMaterial({
        color: 0x2b3342,
        metalness: 0.8,
        roughness: 0.3,
      }),
      switchFaceplate: new THREE.MeshStandardMaterial({
        color: 0x1a212d,
        metalness: 0.8,
        roughness: 0.4,
      }),
      firewallFaceplate: new THREE.MeshStandardMaterial({
        color: 0x241e24, // Subtle deep enterprise maroon/charcoal
        metalness: 0.85,
        roughness: 0.35,
      }),
      goldPortPins: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 1.0,
        roughness: 0.2,
      }),
      deskWood: new THREE.MeshStandardMaterial({
        color: 0x3b2f2f,
        roughness: 0.7,
        metalness: 0.1,
      }),
      deskLegs: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.3,
      }),
      monitorBezel: new THREE.MeshStandardMaterial({
        color: 0x0a0c10,
        metalness: 0.9,
        roughness: 0.3,
      }),
      serverFloor: new THREE.MeshStandardMaterial({
        color: 0x090d14,
        roughness: 0.35,
        metalness: 0.3,
      }),
      officeFloor: new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.85,
        metalness: 0.1,
      }),
      wallMat: new THREE.MeshStandardMaterial({
        color: 0x0b0f17,
        roughness: 0.9,
        metalness: 0.05,
      }),
      glassDoor: new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.85,
        transparent: true,
        opacity: 0.3,
      }),
      ledGreen: new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 1.8,
        roughness: 0.3,
      }),
      ledAmber: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.6,
        roughness: 0.3,
      }),
      ledOff: new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        emissive: 0x000000,
        roughness: 0.9,
      }),
    };

    // Monitor screen texture showing realistic simulated desktop
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 288;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Desktop wallpaper (deep navy gradient)
      const grad = ctx.createLinearGradient(0, 0, 512, 288);
      grad.addColorStop(0, '#09182b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 288);

      // Enterprise watermark
      ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('NEXORA ENTERPRISE // FIN-WS01', 50, 80);

      // Simulated open Command Prompt / PowerShell window
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(40, 100, 320, 140);
      ctx.strokeRect(40, 100, 320, 140);

      // Window titlebar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 100, 320, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('Administrator: Windows PowerShell', 50, 114);

      // Terminal text
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText('PS C:\\Users\\sara.finance> whoami', 50, 136);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('NEXORA\\sara.finance', 50, 152);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('PS C:\\Users\\sara.finance> Get-Process | Measure', 50, 172);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('Count: 48 | Status: Optimal', 50, 188);

      // Taskbar at bottom
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 264, 512, 24);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(8, 268, 16, 16); // Start icon
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText('10:10 AM | NEXORA.LOCAL', 380, 280);
    }
    const screenTexture = new THREE.CanvasTexture(canvas);
    const monitorScreenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.45,
      roughness: 0.4,
    });
    monitorScreenMaterialRef.current = monitorScreenMat;

    // Reset interactive objects collection
    interactiveObjectsRef.current = [];
    deviceMeshesRef.current.clear();
    fanBladesRef.current = [];
    ledMeshesRef.current.clear();

    // ==========================================
    // 5. BUILDING & ARCHITECTURAL FLOORPLAN
    // ==========================================
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    // Floor - Server Room Sector (Raised Tile Floor)
    const serverFloorGeo = new THREE.BoxGeometry(7, 0.2, 8);
    const serverFloorMesh = new THREE.Mesh(serverFloorGeo, materials.serverFloor);
    serverFloorMesh.position.set(-3.5, -0.1, 0);
    serverFloorMesh.receiveShadow = true;
    buildingGroup.add(serverFloorMesh);

    // Floor - Finance / Office Sector
    const officeFloorGeo = new THREE.BoxGeometry(8, 0.2, 8);
    const officeFloorMesh = new THREE.Mesh(officeFloorGeo, materials.officeFloor);
    officeFloorMesh.position.set(4.0, -0.1, 0);
    officeFloorMesh.receiveShadow = true;
    buildingGroup.add(officeFloorMesh);

    // Back Perimeter Wall
    const backWallGeo = new THREE.BoxGeometry(16, 4.5, 0.2);
    const backWall = new THREE.Mesh(backWallGeo, materials.wallMat);
    backWall.position.set(0.5, 2.15, -4.0);
    backWall.receiveShadow = true;
    buildingGroup.add(backWall);

    // Room Divider Wall with Glass Observation Panel
    const dividerWallGeo = new THREE.BoxGeometry(0.2, 4.5, 8);
    const dividerWall = new THREE.Mesh(dividerWallGeo, materials.wallMat);
    dividerWall.position.set(0, 2.15, 0);
    dividerWall.receiveShadow = true;
    buildingGroup.add(dividerWall);

    // Glass Window in Partition Wall
    const glassWindowGeo = new THREE.BoxGeometry(0.25, 2.2, 4);
    const glassWindow = new THREE.Mesh(glassWindowGeo, materials.glassDoor);
    glassWindow.position.set(0, 2.2, 0);
    buildingGroup.add(glassWindow);

    // ==========================================
    // 6. SERVER ROOM: RACK-01 (42U ENCLOSURE)
    // ==========================================
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-3.5, 0, 0);
    scene.add(rackGroup);

    // 4 Corner Vertical Posts (42U steel uprights)
    const postGeo = new THREE.BoxGeometry(0.06, 3.8, 0.06);
    const postPositions = [
      [-0.45, 1.9, -0.55],
      [0.45, 1.9, -0.55],
      [-0.45, 1.9, 0.55],
      [0.45, 1.9, 0.55],
    ];
    postPositions.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(postGeo, materials.rackFrame);
      post.castShadow = true;
      post.receiveShadow = true;
      rackGroup.add(post);
    });

    // Top Roof & Exhaust Grille
    const roofGeo = new THREE.BoxGeometry(0.96, 0.08, 1.16);
    const roof = new THREE.Mesh(roofGeo, materials.rackFrame);
    roof.position.set(0, 3.84, 0);
    rackGroup.add(roof);

    // Base Plinth
    const baseGeo = new THREE.BoxGeometry(0.96, 0.1, 1.16);
    const base = new THREE.Mesh(baseGeo, materials.rackFrame);
    base.position.set(0, 0.05, 0);
    rackGroup.add(base);

    // Side Perforated Steel Panels
    const sidePanelGeo = new THREE.BoxGeometry(0.02, 3.6, 1.1);
    const leftSide = new THREE.Mesh(sidePanelGeo, materials.rackFrame);
    leftSide.position.set(-0.46, 1.9, 0);
    rackGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sidePanelGeo, materials.rackFrame);
    rightSide.position.set(0.46, 1.9, 0);
    rackGroup.add(rightSide);

    // Front Tempered Glass Door (Slightly ajar or transparent)
    const frontDoorGeo = new THREE.BoxGeometry(0.92, 3.65, 0.02);
    const frontDoor = new THREE.Mesh(frontDoorGeo, materials.glassDoor);
    frontDoor.position.set(0, 1.9, 0.58);
    rackGroup.add(frontDoor);

    // Vertical 19" Mounting Rails with RU scale markers
    const railGeo = new THREE.BoxGeometry(0.04, 3.6, 0.04);
    const leftRail = new THREE.Mesh(railGeo, materials.rackRail);
    leftRail.position.set(-0.32, 1.9, 0.48);
    rackGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, materials.rackRail);
    rightRail.position.set(0.32, 1.9, 0.48);
    rackGroup.add(rightRail);

    // Top Exhaust Fans in Rack Roof
    for (let f = -1; f <= 1; f += 2) {
      const fanHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), materials.rackFrame);
      fanHousing.position.set(f * 0.22, 3.88, 0);
      rackGroup.add(fanHousing);

      const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 0.03), materials.rackRail);
      fanBlade.position.copy(fanHousing.position);
      fanBladesRef.current.push(fanBlade);
      rackGroup.add(fanBlade);
    }

    // Helper to calculate Y position from Rack Unit (1U ~ 0.075m, RU 1 at bottom)
    const ruToY = (ru: number, heightU: number) => {
      const ruHeight = 0.075;
      const baseOffset = 0.25;
      return baseOffset + (ru - 1) * ruHeight + (heightU * ruHeight) / 2;
    };

    // ==========================================
    // 7. RACK HARDWARE DEVICES (DC01, FILE01, CORE-SW01, FW-01, PDU)
    // ==========================================

    // Helper: Register device group for interactive click / hover
    const registerDeviceGroup = (group: THREE.Group, devId: string) => {
      group.userData = { isDevice: true, deviceId: devId };
      group.traverse((child) => {
        child.userData = { isDevice: true, deviceId: devId };
        if (child instanceof THREE.Mesh) {
          interactiveObjectsRef.current.push(child);
        }
      });
      deviceMeshesRef.current.set(devId, group);
      rackGroup.add(group);
    };

    // --- A. FIREWALL (FW-01: RU 38, 1U) ---
    const fwGroup = new THREE.Group();
    fwGroup.position.set(0, ruToY(38, 1), 0.1);
    const fwChassis = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.065, 0.75), materials.firewallFaceplate);
    fwChassis.castShadow = true;
    fwGroup.add(fwChassis);

    // Status LED & Logo Emblem on Firewall
    const fwLed = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), materials.ledGreen);
    fwLed.position.set(-0.28, 0.01, 0.38);
    fwGroup.add(fwLed);
    ledMeshesRef.current.set('FW-01', [{ mesh: fwLed, type: 'power' }]);

    // Management & RJ45 Ingress Ports
    for (let p = 0; p < 8; p++) {
      const portHole = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.018, 0.02), materials.rackFrame);
      portHole.position.set(-0.18 + p * 0.035, 0, 0.38);
      fwGroup.add(portHole);
    }
    registerDeviceGroup(fwGroup, 'FW-01');

    // --- B. CORE SWITCH (CORE-SW01: RU 36, 1U 48-Port) ---
    const swGroup = new THREE.Group();
    swGroup.position.set(0, ruToY(36, 1), 0.1);
    const swChassis = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.065, 0.72), materials.switchFaceplate);
    swChassis.castShadow = true;
    swGroup.add(swChassis);

    // 48-port RJ45 Bank (2 rows of 24 ports)
    const swLeds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];
    const swPowerLed = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 8), materials.ledGreen);
    swPowerLed.position.set(-0.3, 0.012, 0.365);
    swGroup.add(swPowerLed);
    swLeds.push({ mesh: swPowerLed, type: 'power' });

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 24; col++) {
        const portCavity = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.013, 0.015), materials.rackFrame);
        portCavity.position.set(-0.24 + col * 0.019, row === 0 ? 0.012 : -0.012, 0.365);
        swGroup.add(portCavity);

        // Individual Link LED above each port
        const portLed = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.003, 0.003), materials.ledGreen);
        portLed.position.set(-0.24 + col * 0.019, (row === 0 ? 0.012 : -0.012) + 0.01, 0.366);
        swGroup.add(portLed);
        swLeds.push({ mesh: portLed, type: 'network' });
      }
    }
    ledMeshesRef.current.set('CORE-SW01', swLeds);
    registerDeviceGroup(swGroup, 'CORE-SW01');

    // --- C. DOMAIN CONTROLLER (DC01: RU 30-31, 2U Server) ---
    const dcGroup = new THREE.Group();
    dcGroup.position.set(0, ruToY(30, 2), 0.1);
    const dcChassis = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.8), materials.serverChassis);
    dcChassis.castShadow = true;
    dcGroup.add(dcChassis);

    // Front Drive Bay Array (8x 2.5" SAS caddies)
    const dcLeds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];
    for (let d = 0; d < 8; d++) {
      const caddy = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.09, 0.02), materials.driveCaddy);
      caddy.position.set(-0.25 + d * 0.072, -0.01, 0.405);
      dcGroup.add(caddy);

      // Caddy activity LED
      const caddyLed = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), materials.ledAmber);
      caddyLed.position.set(-0.25 + d * 0.072, 0.025, 0.416);
      dcGroup.add(caddyLed);
      dcLeds.push({ mesh: caddyLed, type: 'storage' });
    }

    // Power & NIC Status LEDs on Left Server Ear
    const dcPowerLed = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), materials.ledGreen);
    dcPowerLed.position.set(-0.31, 0.04, 0.41);
    dcGroup.add(dcPowerLed);
    dcLeds.push({ mesh: dcPowerLed, type: 'power' });

    const dcNicLed = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 8), materials.ledGreen);
    dcNicLed.position.set(-0.31, 0.02, 0.41);
    dcGroup.add(dcNicLed);
    dcLeds.push({ mesh: dcNicLed, type: 'network' });

    ledMeshesRef.current.set('DC01', dcLeds);
    registerDeviceGroup(dcGroup, 'DC01');

    // --- D. FILE SERVER (FILE01: RU 26-27, 2U 12-Bay Storage Server) ---
    const flGroup = new THREE.Group();
    flGroup.position.set(0, ruToY(26, 2), 0.1);
    const flChassis = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.8), materials.serverChassis);
    flChassis.castShadow = true;
    flGroup.add(flChassis);

    // Front 12-Bay 3.5" Storage Caddies (3 rows of 4 bays)
    const flLeds: { mesh: THREE.Mesh; type: 'power' | 'activity' | 'network' | 'storage' }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const bay = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.038, 0.02), materials.driveCaddy);
        bay.position.set(-0.22 + c * 0.145, 0.04 - r * 0.042, 0.405);
        flGroup.add(bay);

        // Drive Activity LED
        const bayLed = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.003), materials.ledAmber);
        bayLed.position.set(-0.27 + c * 0.145, 0.04 - r * 0.042, 0.416);
        flGroup.add(bayLed);
        flLeds.push({ mesh: bayLed, type: 'storage' });
      }
    }

    const flPowerLed = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), materials.ledGreen);
    flPowerLed.position.set(0.31, 0.04, 0.41);
    flGroup.add(flPowerLed);
    flLeds.push({ mesh: flPowerLed, type: 'power' });

    ledMeshesRef.current.set('FILE01', flLeds);
    registerDeviceGroup(flGroup, 'FILE01');

    // --- E. UPS & PDU POWER UNITS (RU 1 to 4) ---
    const pduGroup = new THREE.Group();
    pduGroup.position.set(0, ruToY(1, 2), 0.1);
    const pduChassis = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.13, 0.65), materials.rackFrame);
    pduGroup.add(pduChassis);
    // Digital Display screen on PDU
    const pduDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.01), materials.ledGreen);
    pduDisplay.position.set(0, 0, 0.33);
    pduGroup.add(pduDisplay);
    registerDeviceGroup(pduGroup, 'PDU-01');

    const upsGroup = new THREE.Group();
    upsGroup.position.set(0, ruToY(3, 2), 0.1);
    const upsChassis = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.13, 0.7), materials.serverChassis);
    upsGroup.add(upsChassis);
    registerDeviceGroup(upsGroup, 'UPS-01');

    // ==========================================
    // 8. OFFICE ROOM: WORKSTATION (FIN-WS01)
    // ==========================================
    const wsRoomGroup = new THREE.Group();
    wsRoomGroup.position.set(4.2, 0, 0);
    scene.add(wsRoomGroup);

    // Ergonomic Executive Desk
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 1.0), materials.deskWood);
    deskTop.position.set(0, 0.85, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    wsRoomGroup.add(deskTop);

    // Steel Legs
    const legGeo = new THREE.BoxGeometry(0.06, 0.85, 0.8);
    const leftLeg = new THREE.Mesh(legGeo, materials.deskLegs);
    leftLeg.position.set(-0.9, 0.425, 0);
    wsRoomGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, materials.deskLegs);
    rightLeg.position.set(0.9, 0.425, 0);
    wsRoomGroup.add(rightLeg);

    // FIN-WS01 Device Group (Tower + Monitor + Peripherals)
    const wsGroup = new THREE.Group();
    wsGroup.position.set(0, 0, 0);

    // Tower PC sitting on desk right side
    const towerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.48), materials.serverChassis);
    towerMesh.position.set(0.72, 1.1, 0.1);
    towerMesh.castShadow = true;
    wsGroup.add(towerMesh);

    // Tower Power LED
    const towerPowerLed = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 8), materials.ledGreen);
    towerPowerLed.position.set(0.72, 1.28, 0.35);
    wsGroup.add(towerPowerLed);
    ledMeshesRef.current.set('FIN-WS01', [{ mesh: towerPowerLed, type: 'power' }]);

    // 32" Curved 4K Monitor Stand
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.2), materials.monitorBezel);
    monitorStand.position.set(0, 0.89, 0);
    wsGroup.add(monitorStand);

    const monitorPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 12), materials.monitorBezel);
    monitorPillar.position.set(0, 1.05, -0.05);
    wsGroup.add(monitorPillar);

    // Monitor Bezel & Frame
    const monitorBezelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.52, 0.03), materials.monitorBezel);
    monitorBezelMesh.position.set(0, 1.26, 0);
    monitorBezelMesh.castShadow = true;
    wsGroup.add(monitorBezelMesh);

    // Monitor Active Screen
    const monitorScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.49), monitorScreenMat);
    monitorScreenMesh.position.set(0, 1.26, 0.016);
    wsGroup.add(monitorScreenMesh);

    // Keyboard & Mouse
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.015, 0.15), materials.monitorBezel);
    keyboard.position.set(0, 0.89, 0.28);
    wsGroup.add(keyboard);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.1), materials.monitorBezel);
    mouse.position.set(0.35, 0.89, 0.28);
    wsGroup.add(mouse);

    // Register FIN-WS01
    registerDeviceGroup(wsGroup, 'FIN-WS01');

    // ==========================================
    // 9. RAYCASTING INTERACTION (Click & Hover)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mousePos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;
        while (currentObj && !currentObj.userData.deviceId) {
          currentObj = currentObj.parent;
        }
        if (currentObj && currentObj.userData.deviceId) {
          selectDevice(currentObj.userData.deviceId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Window Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 10. ANIMATION & RENDER LOOP
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Smooth Camera Damping (Lerp)
      currentCameraPos.current.lerp(cameraTargetPos.current, 0.06);
      currentLookAt.current.lerp(cameraLookAt.current, 0.06);
      camera.position.copy(currentCameraPos.current);
      camera.lookAt(currentLookAt.current);

      // 2. Rack Fan Rotations (Only if Rack is powered on)
      fanBladesRef.current.forEach((blade) => {
        blade.rotation.y += delta * 12;
      });

      // 3. LED States & Blinks synchronized with device power
      const currentDevices = useDigitalTwinStore.getState().devices;

      ledMeshesRef.current.forEach((ledList, devId) => {
        const devState = currentDevices[devId];
        const isOnline = devState ? devState.powerStatus === 'ONLINE' : true;

        ledList.forEach(({ mesh, type }) => {
          if (!isOnline) {
            mesh.material = materials.ledOff;
          } else {
            if (type === 'power') {
              mesh.material = materials.ledGreen;
            } else if (type === 'storage' || type === 'activity') {
              // Rapid authentic disk activity blinking
              const blink = Math.sin(elapsed * 24 + devId.charCodeAt(0)) > 0.2;
              mesh.material = blink ? materials.ledAmber : materials.ledOff;
            } else if (type === 'network') {
              // Regular packet pulse
              const pulse = Math.sin(elapsed * 14 + devId.charCodeAt(devId.length - 1)) > 0;
              mesh.material = pulse ? materials.ledGreen : materials.ledOff;
            }
          }
        });
      });

      // 4. Workstation Monitor illumination when FIN-WS01 is ONLINE vs OFFLINE
      if (monitorScreenMaterialRef.current) {
        const finState = currentDevices['FIN-WS01'];
        const isFinOnline = finState ? finState.powerStatus === 'ONLINE' : true;
        monitorScreenMaterialRef.current.emissiveIntensity = isFinOnline ? 0.45 : 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-crosshair select-none bg-slate-950 overflow-hidden"
      data-testid="digital-twin-viewport"
    />
  );
};
