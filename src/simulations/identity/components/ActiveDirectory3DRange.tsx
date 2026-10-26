import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useSimulationStore } from '../../../stores/simulationStore';
import {
  FolderTree,
  Server,
  Key,
  ShieldAlert,
  ShieldCheck,
  Users,
  Lock,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ActiveDirectory3DRange: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'tier0' | 'tier1' | 'kerberos'>('overview');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [selectedAdItem, setSelectedAdItem] = useState<{
    id: string;
    nameAr: string;
    nameEn: string;
    role: string;
    tier: string;
    security: string;
  } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const interactiveObjectsRef = useRef<THREE.Object3D[]>([]);

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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 11, 17);
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
    controls.minDistance = 4;
    controls.maxDistance = 32;
    controls.target.set(0, 0.5, 0);

    // 3. Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    dirLight.position.set(6, 14, 8);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const goldPoint = new THREE.PointLight(0xeab308, 2.2, 18);
    goldPoint.position.set(0, 3, -3);
    scene.add(goldPoint);

    // 4. Horizon Floor Grid
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const fCanvas = document.createElement('canvas');
    fCanvas.width = 256;
    fCanvas.height = 256;
    const fCtx = fCanvas.getContext('2d')!;
    fCtx.fillStyle = '#020617';
    fCtx.fillRect(0, 0, 256, 256);
    fCtx.strokeStyle = 'rgba(234, 179, 8, 0.15)';
    fCtx.lineWidth = 1;
    fCtx.strokeRect(0, 0, 256, 256);

    const floorTex = new THREE.CanvasTexture(fCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(12, 12);
    floorTex.colorSpace = THREE.SRGBColorSpace;

    const floorMat = new THREE.MeshBasicMaterial({ map: floorTex });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.05;
    scene.add(floorMesh);

    interactiveObjectsRef.current = [];

    // Helper: Build an AD Tier Platform
    const createTierPlatform = (
      nameAr: string,
      nameEn: string,
      tierCode: string,
      x: number,
      z: number,
      colorHex: number
    ) => {
      const tierGroup = new THREE.Group();
      tierGroup.position.set(x, 0.2, z);

      const slabGeo = new THREE.BoxGeometry(6.2, 0.25, 4.8);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.85,
        roughness: 0.25,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = !isSoftwareGl;
      tierGroup.add(slab);

      const edgeGeo = new THREE.EdgesGeometry(slabGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
      tierGroup.add(new THREE.LineSegments(edgeGeo, edgeMat));

      // Label Banner
      const lCanvas = document.createElement('canvas');
      lCanvas.width = 512;
      lCanvas.height = 128;
      const lCtx = lCanvas.getContext('2d')!;
      lCtx.fillStyle = '#020617';
      lCtx.fillRect(0, 0, 512, 128);
      lCtx.strokeStyle = '#' + colorHex.toString(16).padStart(6, '0');
      lCtx.lineWidth = 4;
      lCtx.strokeRect(2, 2, 508, 124);
      lCtx.fillStyle = '#f8fafc';
      lCtx.font = 'bold 26px monospace';
      lCtx.fillText(nameEn.toUpperCase(), 20, 50);
      lCtx.fillStyle = '#eab308';
      lCtx.font = '18px monospace';
      lCtx.fillText(`TIER: ${tierCode} | FOREST: corp.nexora.local`, 20, 90);

      const lTex = new THREE.CanvasTexture(lCanvas);
      lTex.colorSpace = THREE.SRGBColorSpace;
      const lMat = new THREE.MeshBasicMaterial({ map: lTex });
      const lblMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.8), lMat);
      lblMesh.rotation.x = -Math.PI / 2;
      lblMesh.position.set(0, 0.13, -1.8);
      tierGroup.add(lblMesh);

      scene.add(tierGroup);
      return tierGroup;
    };

    // 5. Tier 0: Control Plane (Domain Controllers & Kerberos KDC)
    const tier0 = createTierPlatform('المستوى الصفري: خوادم الدومين Tier-0', 'Tier 0: Domain Controllers', 'TIER_0', 0, -2.5, 0xeab308);

    // Primary Domain Controller (DC01)
    const dc01Group = new THREE.Group();
    dc01Group.position.set(-1.4, 1.0, 0.2);
    dc01Group.userData = {
      id: 'dc01_root',
      nameAr: 'خادم الدومين الرئيسي (DC01.corp.nexora.local)',
      nameEn: 'Root Domain Controller (DC01.corp.nexora.local)',
      role: 'FSMO Role Owner & Schema Master',
      tier: 'TIER-0',
      security: 'LDAP Signing + Channel Binding Enforced',
    };
    const dcGeo = new THREE.BoxGeometry(0.85, 1.4, 0.85);
    const dcMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    dc01Group.add(new THREE.Mesh(dcGeo, dcMat));
    tier0.add(dc01Group);
    interactiveObjectsRef.current.push(dc01Group);

    // Kerberos KDC (Key Distribution Center) Golden Token Core
    const kdcGroup = new THREE.Group();
    kdcGroup.position.set(1.4, 1.1, 0.2);
    kdcGroup.userData = {
      id: 'kerberos_kdc',
      nameAr: 'مركز توزيع المفاتيح Kerberos KDC (krbtgt)',
      nameEn: 'Kerberos KDC Ticket Granting Service (krbtgt)',
      role: 'Authentication & Ticket Granting Service',
      tier: 'TIER-0',
      security: 'AES-256 Kerberos Encryption Only (RC4 Disabled)',
    };
    const kdcGeo = new THREE.OctahedronGeometry(0.65, 0);
    const kdcMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xca8a04,
      emissiveIntensity: 0.6,
      metalness: 0.95,
      roughness: 0.1,
    });
    const kdcMesh = new THREE.Mesh(kdcGeo, kdcMat);
    kdcGroup.add(kdcMesh);

    // KDC Rotating Golden Ring
    const kRingGeo = new THREE.TorusGeometry(0.85, 0.04, 8, 24);
    const kRingMat = new THREE.MeshBasicMaterial({ color: 0xfde047, wireframe: true });
    const kdcRing = new THREE.Mesh(kRingGeo, kRingMat);
    kdcGroup.add(kdcRing);

    tier0.add(kdcGroup);
    interactiveObjectsRef.current.push(kdcGroup);

    // 6. Tier 1: Member Servers (File & App Servers)
    const tier1 = createTierPlatform('المستوى الأول: خوادم الأعضاء Tier-1', 'Tier 1: Member Servers', 'TIER_1', -6.5, 3.5, 0x06b6d4);

    // File Server FS01
    const fsGroup = new THREE.Group();
    fsGroup.position.set(-1.2, 0.8, 0.2);
    fsGroup.userData = {
      id: 'fs01_server',
      nameAr: 'خادم الملفات المؤسسي (FS01.corp.nexora.local)',
      nameEn: 'Enterprise File Server (FS01 with SMB Signing)',
      role: 'Shared Storage & GPO SYSVOL Replication',
      tier: 'TIER-1',
      security: 'SMBv3 Encryption Required',
    };
    const srvGeo = new THREE.BoxGeometry(0.8, 1.1, 0.8);
    const srvMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.2 });
    fsGroup.add(new THREE.Mesh(srvGeo, srvMat));
    tier1.add(fsGroup);
    interactiveObjectsRef.current.push(fsGroup);

    // Web App Server WEB01 (gMSA Account)
    const webGroup = new THREE.Group();
    webGroup.position.set(1.2, 0.8, 0.2);
    webGroup.userData = {
      id: 'web01_gmsa',
      nameAr: 'خادم التطبيقات (WEB01 - Group Managed Service Account)',
      nameEn: 'Internal App Server (WEB01 with Kerberos Constrained Delegation)',
      role: 'Intranet Portal & IIS',
      tier: 'TIER-1',
      security: 'gMSA 128-bit Managed Auto-Rotating Password',
    };
    webGroup.add(new THREE.Mesh(srvGeo, srvMat));
    tier1.add(webGroup);
    interactiveObjectsRef.current.push(webGroup);

    // 7. Tier 2: End-User Workstations (Client Tier)
    const tier2 = createTierPlatform('المستوى الثاني: أجهزة المستخدمين Tier-2', 'Tier 2: Workstations', 'TIER_2', 6.5, 3.5, 0x10b981);

    [-1.2, 1.2].forEach((wx, wIdx) => {
      const wsGroup = new THREE.Group();
      wsGroup.position.set(wx, 0.6, 0.2);
      wsGroup.userData = {
        id: `ws_client_${wIdx}`,
        nameAr: `محطة عمل المستخدم (WS-CLIENT-0${wIdx + 1})`,
        nameEn: `Domain-Joined Workstation (WS-CLIENT-0${wIdx + 1})`,
        role: 'Windows 11 Enterprise with Credential Guard',
        tier: 'TIER-2',
        security: 'LAPS Enabled + Cached Logons Limited to 1',
      };
      const wsGeo = new THREE.BoxGeometry(0.7, 0.55, 0.7);
      const wsMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.7, roughness: 0.3 });
      wsGroup.add(new THREE.Mesh(wsGeo, wsMat));
      tier2.add(wsGroup);
      interactiveObjectsRef.current.push(wsGroup);
    });

    // 8. Catenary Kerberos Ticket Channels
    const createKerberosChannels = () => {
      const linesGroup = new THREE.Group();
      const pKdc = new THREE.Vector3(0, 1.2, -2.5);
      const pT1 = new THREE.Vector3(-4.5, 0.8, 2.5);
      const pT2 = new THREE.Vector3(4.5, 0.8, 2.5);

      const c1 = new THREE.QuadraticBezierCurve3(pKdc, new THREE.Vector3(-2, 2.2, 0), pT1);
      const c2 = new THREE.QuadraticBezierCurve3(pKdc, new THREE.Vector3(2, 2.2, 0), pT2);

      const lineMat = new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.6 });
      linesGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 20, 0.04, 8, false), lineMat));
      linesGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 20, 0.04, 8, false), lineMat));

      scene.add(linesGroup);
    };

    createKerberosChannels();

    // 9. Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (hits.length > 0) {
        let root: THREE.Object3D | null = hits[0].object;
        while (root && !root.userData?.nameEn && root.parent) {
          root = root.parent;
        }
        if (root?.userData?.nameEn) {
          setSelectedAdItem({
            id: root.userData.id,
            nameAr: root.userData.nameAr,
            nameEn: root.userData.nameEn,
            role: root.userData.role,
            tier: root.userData.tier,
            security: root.userData.security,
          });
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 10. Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. Render Loop
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

      // Rotate KDC crystal & ring
      kdcMesh.rotation.y += delta * 0.8;
      kdcRing.rotation.x += delta * 0.5;

      // Smooth Camera Transitions
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 0.5, 0);

      switch (cameraPreset) {
        case 'tier0':
          targetPos.set(0, 4.5, 2.5);
          targetLook.set(0, 1.0, -2.5);
          break;
        case 'tier1':
          targetPos.set(-6.5, 4.5, 8.5);
          targetLook.set(-6.5, 0.8, 3.5);
          break;
        case 'kerberos':
          targetPos.set(1.4, 2.5, 2.8);
          targetLook.set(1.4, 1.1, 0.2);
          break;
        case 'overview':
        default:
          targetPos.set(0, 11, 17);
          targetLook.set(0, 0.5, 0);
          break;
      }

      camera.position.lerp(targetPos, Math.min(1, delta * 4));
      controls.target.lerp(targetLook, Math.min(1, delta * 4));

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

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
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Banner */}
      <div className="absolute top-3 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white backdrop-blur-md shadow-lg pointer-events-none">
        <Server className="w-4 h-4 text-amber-400" />
        <span className="font-bold">{isAr ? 'بيئة نطاق Active Directory ثلاثية الأبعاد' : '3D Active Directory Forest Range'}</span>
        <span className="text-[10px] font-mono text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded bg-amber-950/60">
          TIERED_ADMIN_ACTIVE
        </span>
      </div>

      {/* Selected Node Card */}
      {selectedAdItem && (
        <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/50 backdrop-blur-md shadow-xl text-xs text-slate-200">
          <Key className="w-4 h-4 text-amber-400" />
          <div>
            <span className="font-bold text-white block">
              {isAr ? selectedAdItem.nameAr : selectedAdItem.nameEn}
            </span>
            <span className="text-[10px] font-mono text-amber-400">
              TIER: {selectedAdItem.tier}  |  {selectedAdItem.security}
            </span>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 w-[94vw] max-w-[800px] flex flex-col items-center ${
          isControlsCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        <button
          onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
          className="px-3 py-1 rounded-t-lg bg-slate-900/95 border-t border-x border-slate-800 text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 shadow-md backdrop-blur-md transition-colors"
        >
          {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isControlsCollapsed ? (isAr ? 'إظهار أدوات الدومين 3D' : 'Show 3D Controls') : (isAr ? 'إخفاء أدوات الدومين' : 'Hide Controls')}</span>
        </button>

        <div className="w-full p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              {isAr ? 'منظور الغابة:' : 'CAMERA:'}
            </span>

            <button
              onClick={() => setCameraPreset('overview')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'overview'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الغابة كاملة' : 'Full Forest'}
            </button>

            <button
              onClick={() => setCameraPreset('tier0')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'tier0'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'خوادم Tier 0' : 'Tier 0 DCs'}
            </button>

            <button
              onClick={() => setCameraPreset('tier1')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'tier1'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'خوادم Tier 1' : 'Tier 1 Servers'}
            </button>

            <button
              onClick={() => setCameraPreset('kerberos')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'kerberos'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'محرك Kerberos' : 'Kerberos KDC'}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isAr ? 'هيكل الصلاحيات: 3-Tier Model' : 'Tier Model: Enforced'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">2 DCS / 4 CLIENTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
