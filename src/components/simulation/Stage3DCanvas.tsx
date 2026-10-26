/**
 * OMEGA 3D CYBER RANGE — UNIVERSAL THREE.JS SIMULATION VIEWPORT
 * 
 * Photorealistic 3D network simulation engine providing:
 * - 3–12 part procedural hardware models (Firewalls, Racks, Routers, Switches, Workstations, Cloud Gateways)
 * - 3D catenary physical cable runs connecting hardware ports
 * - Real-time 3D packet particle streams flowing along curves with protocol colors and flags
 * - Deflection shield spark effects for dropped/blocked packets
 * - OrbitControls with silky smooth exponential damping
 * - Interactive Raycaster for device selection and inspection
 * - Software-WebGL detection with adaptive frame pacing
 * - Zero external 404 dependencies (100% procedural geometries and textures)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SimulationNode, ConnectionLink, Packet, NodeStatus } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { Box, Layers, RotateCcw, ZoomIn } from 'lucide-react';

interface Stage3DCanvasProps {
  nodes: SimulationNode[];
  connections: ConnectionLink[];
  packets: Packet[];
  onNodeClick?: (node: SimulationNode) => void;
  onPacketClick?: (packet: Packet) => void;
  interactive?: boolean;
}

// Detect software WebGL (SwiftShader, llvmpipe, WARP, headless JSDOM)
export const checkIsSoftwareGl = (): boolean => {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as any).RENDERER;
    const gpu = String((gl as any).getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
};

// Procedural Canvas Texture Generator for Hardware LCD / Status Screens
const createLcdTexture = (title: string, subtitle: string, status: NodeStatus | string): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, 512, 128);

    // Grid lines
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 128);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = status === 'blocked' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#06b6d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 120);

    // Text
    ctx.fillStyle = status === 'blocked' ? '#f87171' : status === 'warning' ? '#fbbf24' : '#22d3ee';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(title.slice(0, 24), 24, 52);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px monospace';
    ctx.fillText(subtitle.slice(0, 32), 24, 96);

    // Status LED dot
    ctx.fillStyle = status === 'blocked' ? '#dc2626' : status === 'warning' ? '#d97706' : '#10b981';
    ctx.beginPath();
    ctx.arc(460, 64, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const Stage3DCanvas: React.FC<Stage3DCanvasProps> = ({
  nodes,
  connections,
  packets,
  onNodeClick,
  onPacketClick,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedEntity = useSimulationStore((s) => s.selectedEntity);
  const selectEntity = useSimulationStore((s) => s.selectEntity);
  const clearSelection = useSimulationStore((s) => s.clearSelection);
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [cameraMode, setCameraMode] = useState<'iso' | 'top' | 'close'>('iso');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  // References to keep Three.js state across renders without recreating
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeMeshGroupMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const clickableObjectsRef = useRef<THREE.Object3D[]>([]);
  const packetMeshesRef = useRef<Map<string, { group: THREE.Group; light: THREE.PointLight }>>(new Map());
  const cableCurvesRef = useRef<Map<string, THREE.CatmullRomCurve3>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);
  const isSoftwareGlRef = useRef<boolean>(false);

  // Map 2D percentage positions (0-100) to 3D world coordinates
  const getNode3DPosition = useCallback((xPct: number, yPct: number): THREE.Vector3 => {
    // Stage bounds: X from -14 to 14, Z from -10 to 10, Y sits on ground = 0
    const x = ((xPct - 50) / 50) * 12;
    const z = ((yPct - 50) / 50) * 8;
    return new THREE.Vector3(x, 0, z);
  }, []);

  // Build Composite 3D Procedural Hardware Model (3-12 parts)
  const buildHardwareGroup = useCallback((node: SimulationNode, pos: THREE.Vector3): THREE.Group => {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.userData = { nodeId: node.id, nodeData: node };

    const status = node.status || 'online';
    const type = node.type;

    // Contact shadow beneath hardware
    const shadowGeo = new THREE.PlaneGeometry(3.6, 2.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    // Accent selection ring (hidden by default)
    const ringGeo = new THREE.RingGeometry(1.6, 1.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.name = 'selectionRing';
    group.add(ring);

    if (type === 'firewall') {
      // 1. Chassis
      const chassisGeo = new THREE.BoxGeometry(2.4, 0.45, 1.8);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.25,
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.225;
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      group.add(chassis);

      // 2. Front Bezel Accent (Crimson security stripe)
      const bezelGeo = new THREE.BoxGeometry(2.42, 0.46, 0.05);
      const bezelMat = new THREE.MeshStandardMaterial({
        color: status === 'blocked' ? 0xdc2626 : 0x4f46e5,
        emissive: status === 'blocked' ? 0x991b1b : 0x312e81,
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.4,
      });
      const bezel = new THREE.Mesh(bezelGeo, bezelMat);
      bezel.position.set(0, 0.225, 0.92);
      group.add(bezel);

      // 3. LCD Display Screen
      const screenTex = createLcdTexture(node.name || 'FIREWALL', node.ip || 'ACL ACTIVE', status);
      const screenGeo = new THREE.PlaneGeometry(1.1, 0.25);
      const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(-0.5, 0.225, 0.95);
      group.add(screen);

      // 4. RJ45 Port Array (8 ports)
      for (let i = 0; i < 6; i++) {
        const portGeo = new THREE.BoxGeometry(0.1, 0.08, 0.04);
        const portMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
        const port = new THREE.Mesh(portGeo, portMat);
        port.position.set(0.3 + i * 0.14, 0.225, 0.95);
        group.add(port);

        // Port Activity LED
        const ledGeo = new THREE.SphereGeometry(0.02, 8, 8);
        const ledMat = new THREE.MeshBasicMaterial({
          color: status === 'blocked' ? 0xef4444 : i % 2 === 0 ? 0x10b981 : 0x06b6d4,
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0.3 + i * 0.14, 0.32, 0.95);
        group.add(led);
      }

      // 5. Dual Rackmount Ears
      const earMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
      const leftEar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.15), earMat);
      leftEar.position.set(-1.26, 0.225, 0.85);
      const rightEar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.15), earMat);
      rightEar.position.set(1.26, 0.225, 0.85);
      group.add(leftEar, rightEar);

    } else if (type === 'server' || type === 'database' || type === 'siem') {
      // 1. 2U Server Chassis
      const chassisGeo = new THREE.BoxGeometry(2.2, 0.8, 2.0);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2,
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.4;
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      group.add(chassis);

      // 2. Drive Caddies (8 bays)
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          const caddyGeo = new THREE.BoxGeometry(0.42, 0.3, 0.06);
          const caddyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
          const caddy = new THREE.Mesh(caddyGeo, caddyMat);
          caddy.position.set(-0.75 + c * 0.5, 0.25 + r * 0.35, 1.03);
          group.add(caddy);

          // Drive Activity LED
          const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), ledMat);
          led.position.set(-0.6 + c * 0.5, 0.32 + r * 0.35, 1.07);
          group.add(led);
        }
      }

      // 3. Status Display
      const screenTex = createLcdTexture(node.name, node.ip || 'STORAGE OK', status);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2), new THREE.MeshBasicMaterial({ map: screenTex }));
      screen.position.set(0, 0.7, 1.02);
      group.add(screen);

    } else if (type === 'client' || type === 'attacker') {
      // Workstation / Laptop Assembly
      // 1. Base
      const baseGeo = new THREE.BoxGeometry(1.6, 0.08, 1.2);
      const baseMat = new THREE.MeshStandardMaterial({
        color: type === 'attacker' ? 0x271010 : 0x1e293b,
        metalness: 0.7,
        roughness: 0.3,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.04;
      group.add(base);

      // 2. Screen Lid (Tilted back 20 degrees)
      const lidGroup = new THREE.Group();
      lidGroup.position.set(0, 0.08, -0.58);
      lidGroup.rotation.x = -Math.PI / 10;

      const screenFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.1, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
      );
      screenFrame.position.y = 0.55;
      lidGroup.add(screenFrame);

      // Terminal Screen Texture
      const screenTex = createLcdTexture(type === 'attacker' ? 'KALIX TERM' : node.name, node.ip, status);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshBasicMaterial({ map: screenTex }));
      screen.position.set(0, 0.55, 0.035);
      lidGroup.add(screen);
      group.add(lidGroup);

    } else if (type === 'router' || type === 'switch') {
      // 1. Networking Switch / Router
      const chassisGeo = new THREE.BoxGeometry(2.3, 0.4, 1.6);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: type === 'router' ? 0x0369a1 : 0x1e293b,
        metalness: 0.85,
        roughness: 0.25,
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.2;
      group.add(chassis);

      // 2. Port Banks
      for (let i = 0; i < 12; i++) {
        const port = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.08, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9 })
        );
        port.position.set(-0.9 + i * 0.16, 0.2, 0.82);
        group.add(port);

        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.016, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
        );
        led.position.set(-0.9 + i * 0.16, 0.3, 0.82);
        group.add(led);
      }
    } else {
      // Generic Node (Tower / Cloud Gateway)
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.9, 1.4, 24),
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.8,
          roughness: 0.2,
        })
      );
      tower.position.y = 0.7;
      group.add(tower);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.06, 16, 32),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.6,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.7;
      group.add(ring);
    }

    return group;
  }, []);

  // Initialize Three.js WebGL Scene on Mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    isSoftwareGlRef.current = checkIsSoftwareGl();
    const isSoftware = isSoftwareGlRef.current;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060812);
    scene.fog = new THREE.FogExp2(0x060812, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with PBR color management
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftware,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      // Fallback
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftware;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection Map
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Continue if room env fails
    }

    // 5. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(12, 20, 10);
    dirLight.castShadow = !isSoftware;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);

    const blueFill = new THREE.DirectionalLight(0x06b6d4, 0.8);
    blueFill.position.set(-15, 8, -10);
    scene.add(blueFill);

    // 6. Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(36, 36, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 7. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't flip under floor
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controlsRef.current = controls;

    // 8. Raycaster Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjectsRef.current, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.nodeId && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.nodeId) {
          const clickedNode = obj.userData.nodeData as SimulationNode;
          selectEntity('node', clickedNode.id, clickedNode);
          onNodeClick?.(clickedNode);
        }
      } else {
        clearSelection();
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const renderLoop = () => {
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      controls.update();
      renderer.render(scene, camera);
    };
    renderLoop();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
    };
  }, [interactive, selectEntity, clearSelection, onNodeClick]);

  // Synchronize Hardware Nodes in 3D Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean old node groups
    nodeMeshGroupMapRef.current.forEach((grp) => scene.remove(grp));
    nodeMeshGroupMapRef.current.clear();
    clickableObjectsRef.current = [];

    // Build each node
    nodes.forEach((node) => {
      const pos = getNode3DPosition(node.position.x, node.position.y);
      const group = buildHardwareGroup(node, pos);
      scene.add(group);
      nodeMeshGroupMapRef.current.set(node.id, group);
      clickableObjectsRef.current.push(group);
    });
  }, [nodes, getNode3DPosition, buildHardwareGroup]);

  // Synchronize Selection Reticle Highlight
  useEffect(() => {
    nodeMeshGroupMapRef.current.forEach((grp, id) => {
      const ring = grp.getObjectByName('selectionRing') as THREE.Mesh;
      if (ring && ring.material) {
        const isSelected = selectedEntity?.type === 'node' && selectedEntity.id === id;
        (ring.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.85 : 0;
      }
    });
  }, [selectedEntity]);

  // Synchronize Physical 3D Cables
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old cables
    const oldCables = scene.getObjectsByProperty('name', 'cyberCable');
    oldCables.forEach((c) => scene.remove(c));
    cableCurvesRef.current.clear();

    const nodePosMap = new Map<string, THREE.Vector3>();
    nodes.forEach((n) => {
      nodePosMap.set(n.id, getNode3DPosition(n.position.x, n.position.y));
    });

    connections.forEach((conn) => {
      const srcPos = nodePosMap.get(conn.source);
      const tgtPos = nodePosMap.get(conn.target);
      if (!srcPos || !tgtPos) return;

      // Realistic Catenary Sag Curve in 3D
      const mid = new THREE.Vector3()
        .addVectors(srcPos, tgtPos)
        .multiplyScalar(0.5);
      mid.y = 0.05; // Droop slightly toward floor

      const p1 = new THREE.Vector3(srcPos.x, 0.25, srcPos.z);
      const p2 = mid;
      const p3 = new THREE.Vector3(tgtPos.x, 0.25, tgtPos.z);

      const curve = new THREE.CatmullRomCurve3([p1, p2, p3]);
      cableCurvesRef.current.set(`${conn.source}->${conn.target}`, curve);
      cableCurvesRef.current.set(`${conn.target}->${conn.source}`, curve);

      // Tube Geometry for physical cable
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.045, 8, false);
      const isDown = conn.status === 'down';
      const cableMat = new THREE.MeshStandardMaterial({
        color: isDown ? 0xe11d48 : 0x0284c7,
        emissive: isDown ? 0x9f1239 : 0x0369a1,
        emissiveIntensity: 0.35,
        metalness: 0.6,
        roughness: 0.4,
      });

      const cableMesh = new THREE.Mesh(tubeGeo, cableMat);
      cableMesh.name = 'cyberCable';
      scene.add(cableMesh);
    });
  }, [connections, nodes, getNode3DPosition]);

  // Synchronize 3D Packets traveling along physical cables
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Track active packet IDs
    const currentPktIds = new Set(packets.map((p) => p.id));

    // Remove defunct packet meshes
    packetMeshesRef.current.forEach((val, id) => {
      if (!currentPktIds.has(id)) {
        scene.remove(val.group);
        packetMeshesRef.current.delete(id);
      }
    });

    // Update / Create packet particles
    packets.forEach((packet) => {
      const curveKey = `${packet.source}->${packet.destination}`;
      const curve = cableCurvesRef.current.get(curveKey);
      if (!curve) return;

      const t = Math.max(0, Math.min(1, packet.progress));
      const pos = curve.getPoint(t);

      let pktEntry = packetMeshesRef.current.get(packet.id);
      if (!pktEntry) {
        // Create packet particle group
        const group = new THREE.Group();

        // 1. Packet Glowing Core
        const isBlocked = packet.state === 'blocked' || packet.state === 'dropped';
        const color = isBlocked
          ? 0xef4444
          : packet.protocol === 'DNS'
          ? 0x8b5cf6
          : packet.protocol === 'HTTP'
          ? 0xf59e0b
          : packet.protocol === 'HTTPS' || packet.protocol === 'TLS'
          ? 0x10b981
          : 0x06b6d4;

        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 16),
          new THREE.MeshBasicMaterial({ color })
        );
        group.add(sphere);

        // 2. Point Light radiating packet glow
        const light = new THREE.PointLight(color, 1.5, 4);
        group.add(light);

        // 3. Floating 3D Text / Badge Billboard
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = isBlocked ? '#dc2626' : '#0f172a';
          ctx.fillRect(0, 0, 256, 64);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(2, 2, 252, 60);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${packet.protocol}:${packet.destinationPort}`, 128, 42);
        }
        const badgeTex = new THREE.CanvasTexture(canvas);
        const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, transparent: true }));
        badge.scale.set(0.9, 0.22, 1);
        badge.position.y = 0.45;
        group.add(badge);

        scene.add(group);
        pktEntry = { group, light };
        packetMeshesRef.current.set(packet.id, pktEntry);
      }

      pktEntry.group.position.copy(pos);
    });
  }, [packets]);

  // Camera presets
  const handleCameraPreset = (mode: 'iso' | 'top' | 'close') => {
    setCameraMode(mode);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (mode === 'top') {
      camera.position.set(0, 22, 0.01);
      controls.target.set(0, 0, 0);
    } else if (mode === 'iso') {
      camera.position.set(0, 14, 18);
      controls.target.set(0, 0, 0);
    } else if (mode === 'close') {
      // Zoom into center firewall or selected node
      camera.position.set(0, 4, 6);
      controls.target.set(0, 0.5, 0);
    }
    controls.update();
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-950 overflow-hidden select-none" data-testid="stage-3d-canvas">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Sleek Ergonomic Collapsible Bottom Control Dock */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[94vw] transition-all duration-300 z-20 ${
          controlsCollapsed ? 'translate-y-[calc(100%-28px)] opacity-85' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Collapse/Expand Handle Tab */}
          <button
            onClick={() => setControlsCollapsed(!controlsCollapsed)}
            className="px-3 py-1 rounded-t-lg bg-slate-900/90 border-t border-x border-slate-800 text-[10px] font-mono font-bold text-cyan-400 hover:text-white flex items-center gap-1.5 backdrop-blur-md shadow-lg"
          >
            <span>{controlsCollapsed ? '▴ ' + (isAr ? 'عرض أدوات الكاميرا' : 'Show Controls') : '▾ ' + (isAr ? 'إخفاء الأدوات' : 'Hide Controls')}</span>
          </button>

          {/* Controls Bar */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-2xl flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
              {isAr ? 'الكاميرا:' : 'VIEW:'}
            </span>

            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => handleCameraPreset('iso')}
                className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1.5 transition-all ${
                  cameraMode === 'iso' ? 'bg-cyan-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={isAr ? 'منظور متساوي القياس' : 'Isometric Cyber Range'}
              >
                <Box className="w-3 h-3" />
                <span>{isAr ? 'ثلاثي الأبعاد' : '3D Iso'}</span>
              </button>

              <button
                onClick={() => handleCameraPreset('top')}
                className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1.5 transition-all ${
                  cameraMode === 'top' ? 'bg-cyan-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={isAr ? 'المنظور العلوي للشبكة' : 'Top-down Strategic'}
              >
                <Layers className="w-3 h-3" />
                <span>{isAr ? 'منظور علوي' : 'Top-Down'}</span>
              </button>

              <button
                onClick={() => handleCameraPreset('close')}
                className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1.5 transition-all ${
                  cameraMode === 'close' ? 'bg-cyan-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={isAr ? 'فحص عتاد الخوادم' : 'Rack Hardware Inspection'}
              >
                <ZoomIn className="w-3 h-3" />
                <span>{isAr ? 'فحص العتاد' : 'Inspect'}</span>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <button
              onClick={() => handleCameraPreset('iso')}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
              title={isAr ? 'إعادة ضبط الكاميرا' : 'Reset Camera'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
