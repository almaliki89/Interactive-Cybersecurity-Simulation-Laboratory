import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { useSimulationStore } from '../../../stores/simulationStore';
import {
  Crosshair,
  ShieldAlert,
  Flame,
  Terminal,
  Search,
  Eye,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const Threat3DMatrixStage: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const hunts = useThreatHuntingStore((s) => s.hunts);
  const activeHuntId = useThreatHuntingStore((s) => s.activeHuntId);
  const setActiveHuntId = useThreatHuntingStore((s) => s.setActiveHuntId);
  const setActiveTab = useThreatHuntingStore((s) => s.setActiveTab);

  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'killchain' | 'initial' | 'lateral' | 'c2'>('killchain');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [selectedThreatNode, setSelectedThreatNode] = useState<{
    id: string;
    technique: string;
    nameAr: string;
    nameEn: string;
    tactic: string;
    evidence: string;
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

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 16);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 30;
    controls.target.set(0, 1, 0);

    // 4. Lighting & Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xf43f5e, 0x020617, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffe4e6, 1.4);
    dirLight.position.set(5, 14, 7);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const crimsonPoint = new THREE.PointLight(0xe11d48, 2.5, 20);
    crimsonPoint.position.set(-6, 3, 0);
    scene.add(crimsonPoint);

    // 5. Tactical Threat Matrix Grid Floor
    const gridGeo = new THREE.PlaneGeometry(36, 36);
    const gCanvas = document.createElement('canvas');
    gCanvas.width = 256;
    gCanvas.height = 256;
    const gCtx = gCanvas.getContext('2d')!;
    gCtx.fillStyle = '#020617';
    gCtx.fillRect(0, 0, 256, 256);
    gCtx.strokeStyle = 'rgba(225, 29, 72, 0.15)';
    gCtx.lineWidth = 1;
    gCtx.strokeRect(0, 0, 256, 256);

    const gridTex = new THREE.CanvasTexture(gCanvas);
    gridTex.wrapS = THREE.RepeatWrapping;
    gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set(12, 12);
    gridTex.colorSpace = THREE.SRGBColorSpace;

    const gridMat = new THREE.MeshBasicMaterial({ map: gridTex });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -0.05;
    scene.add(gridMesh);

    interactiveObjectsRef.current = [];

    // Helper: Build a Kill Chain Phase Platform
    const createThreatStage = (
      nameAr: string,
      nameEn: string,
      tactic: string,
      x: number,
      z: number,
      colorHex: number
    ) => {
      const stageGroup = new THREE.Group();
      stageGroup.position.set(x, 0.2, z);

      const slabGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.2, 24);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.85,
        roughness: 0.25,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = !isSoftwareGl;
      stageGroup.add(slab);

      const edgeGeo = new THREE.EdgesGeometry(slabGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
      stageGroup.add(new THREE.LineSegments(edgeGeo, edgeMat));

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
      lCtx.fillStyle = '#f43f5e';
      lCtx.font = '18px monospace';
      lCtx.fillText(`TACTIC: ${tactic} | MITRE ATT&CK`, 20, 90);

      const lTex = new THREE.CanvasTexture(lCanvas);
      lTex.colorSpace = THREE.SRGBColorSpace;
      const lMat = new THREE.MeshBasicMaterial({ map: lTex });
      const lblMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), lMat);
      lblMesh.rotation.x = -Math.PI / 2;
      lblMesh.position.set(0, 0.12, -1.2);
      stageGroup.add(lblMesh);

      scene.add(stageGroup);
      return stageGroup;
    };

    // 6. Kill Chain Nodes:
    // A. Adversary / C2 Hub (Far Left)
    const c2Stage = createThreatStage('الخصم ومركز التحكم C2', 'Adversary C2 Server', 'Command & Control (TA0011)', -7, 0, 0xe11d48);

    const c2Node = new THREE.Group();
    c2Node.position.set(0, 1.2, 0);
    c2Node.userData = {
      id: 'apt_c2',
      technique: 'T1071.001 - Web Protocols',
      nameAr: 'خادم التحكم الخبيث APT29 Cobalt Strike TeamServer',
      nameEn: 'APT29 Cobalt Strike C2 TeamServer',
      tactic: 'TA0011 - Command and Control',
      evidence: 'Periodic HTTPS Beaconing on Port 443 with Jitter 20%',
    };
    const c2Geo = new THREE.IcosahedronGeometry(0.7, 0);
    const c2Mat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0x9f1239,
      emissiveIntensity: 0.7,
      metalness: 0.9,
      roughness: 0.1,
    });
    c2Node.add(new THREE.Mesh(c2Geo, c2Mat));
    c2Stage.add(c2Node);
    interactiveObjectsRef.current.push(c2Node);

    // B. Initial Foothold / Phishing Endpoint (Center-Left)
    const footholdStage = createThreatStage('نقطة الاختراق الأولى Foothold', 'Compromised Workstation', 'Initial Access (TA0001)', -2.2, 2.5, 0xf59e0b);

    const wsNode = new THREE.Group();
    wsNode.position.set(0, 0.9, 0);
    wsNode.userData = {
      id: 'foothold_ws',
      technique: 'T1566.001 - Spearphishing Attachment',
      nameAr: 'حاسوب الضحية المخترق (WS-FINANCE-01)',
      nameEn: 'Compromised Finance Workstation (WS-FINANCE-01)',
      tactic: 'TA0001 - Initial Access',
      evidence: 'Malicious Invoice.docm spawned powershell.exe -enc',
    };
    const wsGeo = new THREE.BoxGeometry(0.8, 0.7, 0.8);
    const wsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    wsNode.add(new THREE.Mesh(wsGeo, wsMat));
    footholdStage.add(wsNode);
    interactiveObjectsRef.current.push(wsNode);

    // C. Lateral Movement & Domain Controller (Center-Right)
    const lateralStage = createThreatStage('الحركة الجانبية وخادم الدومين', 'Domain Controller Target', 'Lateral Movement (TA0008)', 2.5, -2.5, 0x8b5cf6);

    const dcNode = new THREE.Group();
    dcNode.position.set(0, 1.2, 0);
    dcNode.userData = {
      id: 'lateral_dc',
      technique: 'T1021.002 - SMB/Windows Admin Shares',
      nameAr: 'خادم الدومين المستهدف بالحركة الجانبية (DC01)',
      nameEn: 'Targeted Domain Controller (DC01.corp.nexora.local)',
      tactic: 'TA0008 - Lateral Movement',
      evidence: 'PsExec service creation & Kerberos Golden Ticket injection',
    };
    const dcGeo = new THREE.BoxGeometry(0.9, 1.3, 0.9);
    const dcMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, metalness: 0.9, roughness: 0.2 });
    dcNode.add(new THREE.Mesh(dcGeo, dcMat));
    lateralStage.add(dcNode);
    interactiveObjectsRef.current.push(dcNode);

    // D. Data Staging & Exfiltration (Far Right)
    const exfilStage = createThreatStage('تسريب البيانات الحساسة', 'Data Exfiltration Node', 'Exfiltration (TA0010)', 7, 0, 0x06b6d4);

    const exfilNode = new THREE.Group();
    exfilNode.position.set(0, 1.0, 0);
    exfilNode.userData = {
      id: 'exfil_node',
      technique: 'T1048.003 - Exfiltration Over Alternative Protocol',
      nameAr: 'تسريب قاعدة بيانات العملاء عبر DNS Tunneling',
      nameEn: 'Customer Database Exfiltration via Encrypted DNS',
      tactic: 'TA0010 - Exfiltration',
      evidence: 'High-frequency TXT record lookups to *.ns1.threatdomain.xyz',
    };
    const exGeo = new THREE.DodecahedronGeometry(0.65, 0);
    const exMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      metalness: 0.85,
    });
    exfilNode.add(new THREE.Mesh(exGeo, exMat));
    exfilStage.add(exfilNode);
    interactiveObjectsRef.current.push(exfilNode);

    // 7. Glowing Catenary Attack Trajectory Tubes
    const createAttackVectors = () => {
      const vecGroup = new THREE.Group();

      const p1 = new THREE.Vector3(-7, 1.2, 0);
      const p2 = new THREE.Vector3(-2.2, 0.9, 2.5);
      const p3 = new THREE.Vector3(2.5, 1.2, -2.5);
      const p4 = new THREE.Vector3(7, 1.0, 0);

      const c1 = new THREE.QuadraticBezierCurve3(p1, new THREE.Vector3(-4.5, 2.4, 1.5), p2);
      const c2 = new THREE.QuadraticBezierCurve3(p2, new THREE.Vector3(0, 2.8, 0), p3);
      const c3 = new THREE.QuadraticBezierCurve3(p3, new THREE.Vector3(4.5, 2.4, -1.5), p4);

      const redTubeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.7 });

      vecGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 20, 0.04, 8, false), redTubeMat));
      vecGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 20, 0.04, 8, false), redTubeMat));
      vecGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c3, 20, 0.04, 8, false), redTubeMat));

      scene.add(vecGroup);
    };

    createAttackVectors();

    // 8. Raycaster
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
          setSelectedThreatNode({
            id: root.userData.id,
            technique: root.userData.technique,
            nameAr: root.userData.nameAr,
            nameEn: root.userData.nameEn,
            tactic: root.userData.tactic,
            evidence: root.userData.evidence,
          });
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Resize
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

      // Rotate C2 crystal & Exfil diamond
      c2Node.rotation.y += delta * 0.9;
      exfilNode.rotation.y -= delta * 0.7;

      // Camera preset transitions
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 1, 0);

      switch (cameraPreset) {
        case 'initial':
          targetPos.set(-2.2, 4.5, 7.5);
          targetLook.set(-2.2, 0.9, 2.5);
          break;
        case 'lateral':
          targetPos.set(2.5, 4.5, 2.5);
          targetLook.set(2.5, 1.2, -2.5);
          break;
        case 'c2':
          targetPos.set(-7, 4.5, 5);
          targetLook.set(-7, 1.2, 0);
          break;
        case 'killchain':
        default:
          targetPos.set(0, 10, 16);
          targetLook.set(0, 1, 0);
          break;
      }

      camera.position.damp(targetPos, 3, delta);
      controls.target.damp(targetLook, 3, delta);

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
        <Crosshair className="w-4 h-4 text-rose-500" />
        <span className="font-bold">{isAr ? 'مصفوفة صيد التهديدات 3D (MITRE ATT&CK Graph)' : '3D Threat Hunting Attack Graph'}</span>
        <span className="text-[10px] font-mono text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded bg-rose-950/60">
          KILL_CHAIN_ACTIVE
        </span>
      </div>

      {/* Selected Node Card */}
      {selectedThreatNode && (
        <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-rose-500/50 backdrop-blur-md shadow-xl text-xs text-slate-200">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <div>
            <span className="font-bold text-white block">
              {isAr ? selectedThreatNode.nameAr : selectedThreatNode.nameEn}
            </span>
            <span className="text-[10px] font-mono text-rose-400">
              {selectedThreatNode.technique}  |  {selectedThreatNode.evidence}
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
          {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-rose-400" /> : <ChevronDown className="w-3.5 h-3.5 text-rose-400" />}
          <span>{isControlsCollapsed ? (isAr ? 'إظهار أدوات الصيد 3D' : 'Show 3D Controls') : (isAr ? 'إخفاء أدوات الصيد' : 'Hide Controls')}</span>
        </button>

        <div className="w-full p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              {isAr ? 'منظور سلسلة القتل:' : 'CAMERA:'}
            </span>

            <button
              onClick={() => setCameraPreset('killchain')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'killchain'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'السلسلة كاملة' : 'Full Chain'}
            </button>

            <button
              onClick={() => setCameraPreset('c2')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'c2'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'مركز التحكم C2' : 'C2 Node'}
            </button>

            <button
              onClick={() => setCameraPreset('initial')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'initial'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'نقطة الاختراق' : 'Foothold'}
            </button>

            <button
              onClick={() => setCameraPreset('lateral')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'lateral'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الحركة الجانبية' : 'Lateral Hop'}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{isAr ? 'مسار الهجوم: نشط' : 'Kill Chain: Active'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400 font-bold">4 MITRE HOPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
