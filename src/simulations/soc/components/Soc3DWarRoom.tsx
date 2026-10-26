import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useSocStore } from '../../../stores/socStore';
import { useSimulationStore } from '../../../stores/simulationStore';
import { TriagedAlertResult } from '../logic/triage';
import {
  Monitor,
  Maximize2,
  Eye,
  ShieldAlert,
  Layers,
  Activity,
  Compass,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Soc3DWarRoomProps {
  alerts: any[];
  triagedAlerts: TriagedAlertResult[];
  onSelectAlert?: (alertId: string) => void;
}

export const Soc3DWarRoom: React.FC<Soc3DWarRoomProps> = ({
  alerts,
  triagedAlerts,
  onSelectAlert,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const setSelectedAlertId = useSocStore((s) => s.setSelectedAlertId);
  const selectedAlertId = useSocStore((s) => s.selectedAlertId);

  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'videowall' | 'triage' | 'siem'>('overview');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // References for render loop & cleanup
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const videoWallTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const interactiveObjectsRef = useRef<THREE.Object3D[]>([]);

  // Update dynamic Canvas texture on Video Wall when alerts change
  const updateVideoWallCanvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Grid overlay
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Title Banner
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('NEXORA GLOBAL DEFENSE — LIVE THREAT WALL', 40, 50);

      // Status metrics
      ctx.font = '16px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`ACTIVE ALERTS: ${alerts.length}  |  CRITICAL: ${alerts.filter((a) => a.severity === 'CRITICAL').length}  |  HIGH: ${alerts.filter((a) => a.severity === 'HIGH').length}`, 40, 85);

      // Alert Cards Grid (top 4 alerts)
      const topAlerts = alerts.slice(0, 4);
      topAlerts.forEach((alert, idx) => {
        const cardX = 40 + (idx % 2) * 460;
        const cardY = 120 + Math.floor(idx / 2) * 160;

        ctx.fillStyle = alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        ctx.strokeStyle = alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 440, 140, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = alert.severity === 'CRITICAL' ? '#fca5a5' : '#fcd34d';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`[${alert.severity}] ${alert.ruleName || alert.id}`, cardX + 15, cardY + 35);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px sans-serif';
        const desc = alert.description || 'Suspicious network vector detected by ingestion pipeline.';
        ctx.fillText(desc.slice(0, 45) + (desc.length > 45 ? '...' : ''), cardX + 15, cardY + 70);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px monospace';
        ctx.fillText(`Entities: ${alert.entities?.users?.join(', ') || 'System'} | ${alert.entities?.hosts?.join(', ') || 'Internal'}`, cardX + 15, cardY + 105);
      });

      // Bottom pulse line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, h - 30);
      ctx.lineTo(w - 40, h - 30);
      ctx.stroke();
    },
    [alerts]
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 8, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 25;
    controls.target.set(0, 2, 0);

    // 3. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    dirLight.position.set(5, 12, 6);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 30;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    // Blue rim accent light
    const rimLight = new THREE.PointLight(0x06b6d4, 2.5, 20);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // Red alert strobe light
    const alertLight = new THREE.PointLight(0xf43f5e, 1.8, 15);
    alertLight.position.set(6, 4, -4);
    scene.add(alertLight);

    // 4. Room Architecture & Floor
    const floorGeo = new THREE.PlaneGeometry(28, 28);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256;
    floorCanvas.height = 256;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#040d21';
    fCtx.fillRect(0, 0, 256, 256);
    fCtx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    fCtx.lineWidth = 1;
    fCtx.strokeRect(0, 0, 256, 256);
    fCtx.fillStyle = 'rgba(14, 165, 233, 0.05)';
    fCtx.fillRect(10, 10, 236, 236);

    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(14, 14);
    floorTexture.colorSpace = THREE.SRGBColorSpace;

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.35,
      metalness: 0.7,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // 5. Massive Curved Video Wall at the Front
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 1024;
    wallCanvas.height = 512;
    updateVideoWallCanvas(wallCanvas);

    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.colorSpace = THREE.SRGBColorSpace;
    videoWallTextureRef.current = wallTexture;

    const curveRadius = 14;
    const curveAngle = Math.PI * 0.45;
    const wallGeo = new THREE.CylinderGeometry(
      curveRadius,
      curveRadius,
      5.2,
      32,
      1,
      true,
      -curveAngle / 2 + Math.PI,
      curveAngle
    );

    const wallMat = new THREE.MeshBasicMaterial({
      map: wallTexture,
      side: THREE.BackSide,
    });
    const videoWall = new THREE.Mesh(wallGeo, wallMat);
    videoWall.position.set(0, 3.2, -10.5);
    scene.add(videoWall);

    // Video Wall Frame Outer Bezel
    const frameGeo = new THREE.CylinderGeometry(
      curveRadius + 0.08,
      curveRadius + 0.08,
      5.5,
      32,
      1,
      true,
      -curveAngle / 2 + Math.PI,
      curveAngle
    );
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.BackSide,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 3.2, -10.5);
    scene.add(frameMesh);

    // 6. Interactive Analyst Pods (Composite 3D Groups)
    interactiveObjectsRef.current = [];
    const stations = [
      { id: 'TIER_1_POD', nameAr: 'منصة الفرز الأولي (Tier 1 Triage)', nameEn: 'Tier 1 Triage Console', pos: [-4, 0, -2], color: 0x06b6d4 },
      { id: 'TIER_2_POD', nameAr: 'منصة الاستجابة للحوادث (Tier 2 IR)', nameEn: 'Tier 2 IR Console', pos: [0, 0, -1], color: 0x10b981 },
      { id: 'TIER_3_POD', nameAr: 'منصة صيد التهديدات (Tier 3 Hunting)', nameEn: 'Tier 3 Threat Hunt Console', pos: [4, 0, -2], color: 0x8b5cf6 },
    ];

    stations.forEach((st) => {
      const podGroup = new THREE.Group();
      podGroup.position.set(st.pos[0], st.pos[1], st.pos[2]);
      podGroup.userData = { stationId: st.id, nameAr: st.nameAr, nameEn: st.nameEn };

      // 1) Curved Desk
      const deskShape = new THREE.Shape();
      deskShape.absarc(0, 0, 2.2, 0, Math.PI, false);
      const deskGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.1, 16, 1, false, Math.PI * 0.1, Math.PI * 0.8);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.8,
      });
      const deskMesh = new THREE.Mesh(deskGeo, deskMat);
      deskMesh.position.y = 1.1;
      deskMesh.castShadow = !isSoftwareGl;
      podGroup.add(deskMesh);

      // 2) Desk Legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
      [-1.2, 1.2].forEach((lx) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.55, -0.6);
        podGroup.add(leg);
      });

      // 3) Multi-Monitor Array (3 Curved Displays)
      [-0.7, 0, 0.7].forEach((mx, mIdx) => {
        const monGroup = new THREE.Group();
        monGroup.position.set(mx, 1.5, -0.8 + Math.abs(mx) * 0.15);
        monGroup.rotation.y = -mx * 0.35;

        // Screen bezel
        const monBezelGeo = new THREE.BoxGeometry(0.65, 0.42, 0.03);
        const monBezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
        const bezel = new THREE.Mesh(monBezelGeo, monBezelMat);
        monGroup.add(bezel);

        // Screen face
        const monFaceGeo = new THREE.PlaneGeometry(0.6, 0.38);
        const monFaceMat = new THREE.MeshBasicMaterial({
          color: mIdx === 1 ? st.color : 0x0284c7,
        });
        const face = new THREE.Mesh(monFaceGeo, monFaceMat);
        face.position.z = 0.016;
        monGroup.add(face);

        // Stand
        const standGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
        const stand = new THREE.Mesh(standGeo, legMat);
        stand.position.y = -0.22;
        monGroup.add(stand);

        podGroup.add(monGroup);
      });

      // 4) Executive Mesh Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.4);

      // Seat
      const seatGeo = new THREE.BoxGeometry(0.55, 0.08, 0.55);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.7 });
      const seat = new THREE.Mesh(seatGeo, chairMat);
      seat.position.y = 0.65;
      chairGroup.add(seat);

      // Backrest
      const backGeo = new THREE.BoxGeometry(0.52, 0.65, 0.06);
      const back = new THREE.Mesh(backGeo, chairMat);
      back.position.set(0, 1.05, 0.25);
      chairGroup.add(back);

      // Stem & Base
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8);
      const stem = new THREE.Mesh(stemGeo, legMat);
      stem.position.y = 0.325;
      chairGroup.add(stem);

      podGroup.add(chairGroup);

      // 5) Glowing Status Beacon Tower
      const beaconGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 12);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: st.color,
        emissive: st.color,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(1.6, 0.9, -0.6);
      podGroup.add(beacon);

      scene.add(podGroup);
      interactiveObjectsRef.current.push(podGroup);
    });

    // 7. Back Row: 42U SIEM Ingestion Server Blades
    [-6, -4.5, 4.5, 6].forEach((rx) => {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(rx, 1.8, 4);

      // Frame
      const rFrameGeo = new THREE.BoxGeometry(1.0, 3.6, 0.9);
      const rFrameMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.85, roughness: 0.25 });
      const rackFrame = new THREE.Mesh(rFrameGeo, rFrameMat);
      rackGroup.add(rackFrame);

      // Server Blade Face with LED strips
      const bladeGeo = new THREE.PlaneGeometry(0.85, 3.3);
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 128;
      bCanvas.height = 512;
      const bCtx = bCanvas.getContext('2d')!;
      bCtx.fillStyle = '#0f172a';
      bCtx.fillRect(0, 0, 128, 512);

      // draw horizontal blades & LEDs
      for (let y = 10; y < 500; y += 22) {
        bCtx.fillStyle = '#1e293b';
        bCtx.fillRect(8, y, 112, 18);
        bCtx.fillStyle = Math.random() > 0.3 ? '#10b981' : '#06b6d4';
        bCtx.fillRect(14, y + 6, 6, 6);
        bCtx.fillRect(24, y + 6, 6, 6);
      }

      const bladeTex = new THREE.CanvasTexture(bCanvas);
      const bladeMat = new THREE.MeshBasicMaterial({ map: bladeTex });
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.z = -0.46;
      bladeMesh.rotation.y = Math.PI;
      rackGroup.add(bladeMesh);

      scene.add(rackGroup);
    });

    // 8. Raycasting for Pod Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.stationId && obj.parent) {
          obj = obj.parent;
        }

        if (obj?.userData?.stationId) {
          const stId = obj.userData.stationId;
          setSelectedStation(stId);

          // Select corresponding alert in store
          if (alerts.length > 0) {
            const matched = alerts[0];
            setSelectedAlertId(matched.id);
            onSelectAlert?.(matched.id);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = clock.getDelta();
      controls.update();

      // Camera preset smooth transition
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 2, 0);

      switch (cameraPreset) {
        case 'videowall':
          targetPos.set(0, 3.5, -4);
          targetLook.set(0, 3.2, -10);
          break;
        case 'triage':
          targetPos.set(-4, 2.5, 1);
          targetLook.set(-4, 1.2, -2);
          break;
        case 'siem':
          targetPos.set(0, 3, 0);
          targetLook.set(0, 2, 4);
          break;
        case 'overview':
        default:
          targetPos.set(0, 8, 14);
          targetLook.set(0, 2, 0);
          break;
      }

      camera.position.lerp(targetPos, Math.min(1, delta * 4));
      controls.target.lerp(targetLook, Math.min(1, delta * 4));

      // Subtle beacon light pulsing
      alertLight.intensity = 1.4 + Math.sin(clock.getElapsedTime() * 3) * 0.8;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [cameraPreset, updateVideoWallCanvas, alerts, onSelectAlert, setSelectedAlertId]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Header Badge */}
      <div className="absolute top-3 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white backdrop-blur-md shadow-lg pointer-events-none">
        <Activity className="w-4 h-4 text-cyan-400" />
        <span className="font-bold">{isAr ? 'غرفة عمليات الأمن السيبراني 3D' : '3D Cyber Operations Center'}</span>
        <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded bg-cyan-950/60">
          ACTIVE_RANGE
        </span>
      </div>

      {/* Selected Console Indicator Card */}
      {selectedStation && (
        <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/50 backdrop-blur-md shadow-xl text-xs text-slate-200">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="font-bold text-white block">
              {selectedStation === 'TIER_1_POD'
                ? isAr ? 'منصة الفرز الأولي (Tier 1 Triage)' : 'Tier 1 Triage Console'
                : selectedStation === 'TIER_2_POD'
                ? isAr ? 'منصة الاستجابة للحوادث (Tier 2 IR)' : 'Tier 2 IR Console'
                : isAr ? 'منصة صيد التهديدات (Tier 3 Hunting)' : 'Tier 3 Threat Hunt Console'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">STATUS: ONLINE / ANALYST_ACTIVE</span>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Following Three.js Skills Specification) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 w-[94vw] max-w-[800px] flex flex-col items-center ${
          isControlsCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
          className="px-3 py-1 rounded-t-lg bg-slate-900/95 border-t border-x border-slate-800 text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 shadow-md backdrop-blur-md transition-colors"
        >
          {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isControlsCollapsed ? (isAr ? 'إظهار لوحة التحكم 3D' : 'Show 3D Controls') : (isAr ? 'إخفاء لوحة التحكم' : 'Hide Controls')}</span>
        </button>

        {/* Dock Body */}
        <div className="w-full p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera View Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              {isAr ? 'منظور الكاميرا:' : 'CAMERA:'}
            </span>

            <button
              onClick={() => setCameraPreset('overview')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'overview'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'نظرة شاملة' : 'Overview'}
            </button>

            <button
              onClick={() => setCameraPreset('videowall')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'videowall'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'شاشة التهديدات' : 'Threat Wall'}
            </button>

            <button
              onClick={() => setCameraPreset('triage')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'triage'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'منصة الفرز' : 'Triage Pod'}
            </button>

            <button
              onClick={() => setCameraPreset('siem')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'siem'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'خوادم SIEM' : 'SIEM Ingest'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? 'حالة المنظومة: مؤمنة' : 'Telemetry Feed: Active'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">{alerts.length} ALERTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
