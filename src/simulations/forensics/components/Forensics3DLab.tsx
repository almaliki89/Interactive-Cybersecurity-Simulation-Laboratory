import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useForensicsStore } from '../../../stores/forensicsStore';
import { useSimulationStore } from '../../../stores/simulationStore';
import {
  ShieldCheck,
  HardDrive,
  Cpu,
  Laptop,
  Usb,
  Lock,
  Eye,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from 'lucide-react';

export const Forensics3DLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const evidence = useForensicsStore((s) => s.evidence);
  const selectedEvidenceId = useForensicsStore((s) => s.selectedEvidenceId);
  const setSelectedEvidenceId = useForensicsStore((s) => s.setSelectedEvidenceId);

  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'bench' | 'writeblocker' | 'hdd' | 'ram'>('bench');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [hoveredItemName, setHoveredItemName] = useState<string | null>(null);

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
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 8);
    cameraRef.current = camera;

    // 2. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
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
    } catch {
      return;
    }

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 18;
    controls.target.set(0, 0.8, 0);

    // 4. Lighting & Studio Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.8);
    keyLight.position.set(4, 8, 5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const cyanRim = new THREE.PointLight(0x06b6d4, 1.5, 10);
    cyanRim.position.set(-4, 3, -2);
    scene.add(cyanRim);

    // 5. Forensic ESD Workbench
    const benchGeo = new THREE.BoxGeometry(10, 0.4, 5);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.8,
    });
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.y = 0.2;
    benchMesh.receiveShadow = !isSoftwareGl;
    scene.add(benchMesh);

    // Anti-static ESD Mat (Blue Rubber with grounding grid)
    const matGeo = new THREE.PlaneGeometry(8.5, 4);
    const mCanvas = document.createElement('canvas');
    mCanvas.width = 512;
    mCanvas.height = 256;
    const mCtx = mCanvas.getContext('2d')!;
    mCtx.fillStyle = '#0369a1';
    mCtx.fillRect(0, 0, 512, 256);
    mCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    mCtx.lineWidth = 1;
    for (let x = 0; x < 512; x += 32) {
      mCtx.beginPath();
      mCtx.moveTo(x, 0);
      mCtx.lineTo(x, 256);
      mCtx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      mCtx.beginPath();
      mCtx.moveTo(0, y);
      mCtx.lineTo(512, y);
      mCtx.stroke();
    }
    mCtx.fillStyle = '#f8fafc';
    mCtx.font = 'bold 14px monospace';
    mCtx.fillText('FORENSIC LAB ESD BENCH — ISO/IEC 27037 CHAIN OF CUSTODY', 24, 30);

    const matTex = new THREE.CanvasTexture(mCanvas);
    matTex.colorSpace = THREE.SRGBColorSpace;
    const matRubber = new THREE.MeshStandardMaterial({
      map: matTex,
      roughness: 0.6,
      metalness: 0.1,
    });
    const esdMat = new THREE.Mesh(matGeo, matRubber);
    esdMat.rotation.x = -Math.PI / 2;
    esdMat.position.y = 0.41;
    scene.add(esdMat);

    interactiveObjectsRef.current = [];

    // 6. Forensic Hardware Write-Blocker (Tableau T8u Bridge Model)
    const wbGroup = new THREE.Group();
    wbGroup.position.set(-2.8, 0.55, 0);
    wbGroup.userData = {
      id: 'write_blocker',
      nameAr: 'جهاز الحظر الجنائي للكتلة (Hardware Write-Blocker)',
      nameEn: 'Hardware Write-Blocker Bridge (Tableau T8u)',
    };

    // Chassis
    const wbGeo = new THREE.BoxGeometry(1.6, 0.35, 1.1);
    const wbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const wbBody = new THREE.Mesh(wbGeo, wbMat);
    wbBody.castShadow = !isSoftwareGl;
    wbGroup.add(wbBody);

    // Write-Protect LED (Green)
    const ledGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-0.5, 0.18, 0.3);
    wbGroup.add(led);

    // Host USB-C Port
    const portGeo = new THREE.BoxGeometry(0.2, 0.08, 0.05);
    const portMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 });
    const port = new THREE.Mesh(portGeo, portMat);
    port.position.set(0, 0, 0.55);
    wbGroup.add(port);

    scene.add(wbGroup);
    interactiveObjectsRef.current.push(wbGroup);

    // 7. Evidence Item 1: Suspect Laptop (ThinkPad style)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(2.4, 0.55, 0.3);
    const laptopEvidence = evidence.find((e) => e.type === 'PROCESS_SNAPSHOT' || e.type === 'DISK_IMAGE') || evidence[0];
    laptopGroup.userData = {
      evidenceId: laptopEvidence?.id || 'EVD-001',
      nameAr: 'حاسوب المشتبه به المحرز (Suspect Workstation)',
      nameEn: 'Suspect Workstation Endpoint',
    };

    // Laptop Base
    const baseGeo = new THREE.BoxGeometry(1.5, 0.08, 1.1);
    const lapMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4, metalness: 0.7 });
    const lapBase = new THREE.Mesh(baseGeo, lapMat);
    lapBase.castShadow = !isSoftwareGl;
    laptopGroup.add(lapBase);

    // Laptop Screen (Opened at 115 degrees)
    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, 0.04, -0.55);
    screenGroup.rotation.x = -Math.PI * 0.32;

    const lidGeo = new THREE.BoxGeometry(1.5, 1.05, 0.05);
    const lid = new THREE.Mesh(lidGeo, lapMat);
    lid.position.y = 0.525;
    screenGroup.add(lid);

    // Screen LCD face
    const lcdGeo = new THREE.PlaneGeometry(1.4, 0.95);
    const lcdMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const lcd = new THREE.Mesh(lcdGeo, lcdMat);
    lcd.position.set(0, 0.525, 0.026);
    screenGroup.add(lcd);

    laptopGroup.add(screenGroup);

    // Red Tamper-Evident Seal Strip across side
    const sealGeo = new THREE.BoxGeometry(0.02, 0.09, 0.4);
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
    });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.set(0.76, 0.04, 0);
    laptopGroup.add(seal);

    scene.add(laptopGroup);
    interactiveObjectsRef.current.push(laptopGroup);

    // 8. Evidence Item 2: Enterprise 3.5" Hard Drive
    const hddGroup = new THREE.Group();
    hddGroup.position.set(0, 0.5, -0.5);
    const hddEvidence = evidence.find((e) => e.type === 'DISK_IMAGE') || evidence[1] || evidence[0];
    hddGroup.userData = {
      evidenceId: hddEvidence?.id || 'EVD-002',
      nameAr: 'قرص صلب محرز 3.5 بوصة (Seagate Exos 16TB)',
      nameEn: 'Seized 3.5" Enterprise Hard Drive',
    };

    // Aluminum Casing
    const hddGeo = new THREE.BoxGeometry(1.1, 0.22, 1.5);
    const hddMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.15 });
    const hddMesh = new THREE.Mesh(hddGeo, hddMat);
    hddMesh.castShadow = !isSoftwareGl;
    hddGroup.add(hddMesh);

    // Drive Label with SHA-256 Stamp
    const lblGeo = new THREE.PlaneGeometry(0.95, 1.25);
    const lCanvas = document.createElement('canvas');
    lCanvas.width = 256;
    lCanvas.height = 340;
    const lCtx = lCanvas.getContext('2d')!;
    lCtx.fillStyle = '#ffffff';
    lCtx.fillRect(0, 0, 256, 340);
    lCtx.fillStyle = '#0f172a';
    lCtx.font = 'bold 16px sans-serif';
    lCtx.fillText('ENTERPRISE STORAGE', 20, 30);
    lCtx.font = '12px monospace';
    lCtx.fillText('MODEL: ST16000NM001G', 20, 55);
    lCtx.fillText('CAPACITY: 16TB SATA 6Gb/s', 20, 75);
    lCtx.fillStyle = '#ef4444';
    lCtx.fillRect(20, 95, 216, 40);
    lCtx.fillStyle = '#ffffff';
    lCtx.font = 'bold 12px monospace';
    lCtx.fillText('EVIDENCE #EVD-002', 30, 120);

    // Barcode lines
    lCtx.fillStyle = '#000000';
    for (let bx = 20; bx < 236; bx += Math.random() > 0.4 ? 4 : 8) {
      lCtx.fillRect(bx, 150, 2, 35);
    }

    lCtx.fillStyle = '#0369a1';
    lCtx.font = '10px monospace';
    lCtx.fillText('SHA-256 HASH VERIFIED', 20, 210);
    lCtx.fillText('e3b0c44298fc1c149afb...', 20, 230);

    const lblTex = new THREE.CanvasTexture(lCanvas);
    lblTex.colorSpace = THREE.SRGBColorSpace;
    const lblMat = new THREE.MeshBasicMaterial({ map: lblTex });
    const driveLabel = new THREE.Mesh(lblGeo, lblMat);
    driveLabel.rotation.x = -Math.PI / 2;
    driveLabel.position.y = 0.115;
    hddGroup.add(driveLabel);

    scene.add(hddGroup);
    interactiveObjectsRef.current.push(hddGroup);

    // 9. Evidence Item 3: RAM Memory Module (DDR4 DIMM)
    const ramGroup = new THREE.Group();
    ramGroup.position.set(-0.8, 0.45, 0.9);
    const ramEvidence = evidence.find((e) => e.type === 'MEMORY_IMAGE') || evidence[2] || evidence[0];
    ramGroup.userData = {
      evidenceId: ramEvidence?.id || 'EVD-003',
      nameAr: 'وحدة ذاكرة عشوائية (DDR4 32GB RAM DIMM)',
      nameEn: 'Volatile RAM Memory DIMM (DDR4)',
    };

    // Green PCB Board
    const pcbGeo = new THREE.BoxGeometry(1.3, 0.04, 0.35);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    ramGroup.add(pcb);

    // DRAM Chips (Black Rectangles)
    const chipGeo = new THREE.BoxGeometry(0.18, 0.03, 0.22);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 });
    [-0.45, -0.15, 0.15, 0.45].forEach((cx) => {
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(cx, 0.03, 0);
      ramGroup.add(chip);
    });

    // Gold Pin Edge
    const pinGeo = new THREE.BoxGeometry(1.25, 0.02, 0.06);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.95, roughness: 0.1 });
    const pins = new THREE.Mesh(pinGeo, pinMat);
    pins.position.set(0, 0, 0.16);
    ramGroup.add(pins);

    scene.add(ramGroup);
    interactiveObjectsRef.current.push(ramGroup);

    // 10. Evidence Item 4: USB Flash Drive
    const usbGroup = new THREE.Group();
    usbGroup.position.set(0.8, 0.45, 0.9);
    const usbEvidence = evidence.find((e) => e.type === 'FILE' || e.type === 'DISK_IMAGE') || evidence[3] || evidence[0];
    usbGroup.userData = {
      evidenceId: usbEvidence?.id || 'EVD-004',
      nameAr: 'ذاكرة فلاش USB مستخرجة من مسرح الحادث',
      nameEn: 'USB Flash Drive Artifact',
    };

    const usbBodyGeo = new THREE.BoxGeometry(0.5, 0.1, 0.22);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.3, metalness: 0.6 });
    const usbBody = new THREE.Mesh(usbBodyGeo, usbMat);
    usbGroup.add(usbBody);

    const plugGeo = new THREE.BoxGeometry(0.2, 0.07, 0.18);
    const plugMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 });
    const plug = new THREE.Mesh(plugGeo, plugMat);
    plug.position.x = -0.32;
    usbGroup.add(plug);

    scene.add(usbGroup);
    interactiveObjectsRef.current.push(usbGroup);

    // 11. Raycasting Pointer Handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
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
          setHoveredItemName(isAr ? root.userData.nameAr : root.userData.nameEn);
          return;
        }
      }
      setHoveredItemName(null);
    };

    const handlePointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (hits.length > 0) {
        let root: THREE.Object3D | null = hits[0].object;
        while (root && !root.userData?.evidenceId && root.parent) {
          root = root.parent;
        }
        if (root?.userData?.evidenceId) {
          setSelectedEvidenceId(root.userData.evidenceId);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 12. Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 13. Render Loop with Smooth Camera Damping
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

      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 0.8, 0);

      switch (cameraPreset) {
        case 'writeblocker':
          targetPos.set(-2.8, 1.8, 1.8);
          targetLook.set(-2.8, 0.55, 0);
          break;
        case 'hdd':
          targetPos.set(0, 1.8, 0.8);
          targetLook.set(0, 0.5, -0.5);
          break;
        case 'ram':
          targetPos.set(-0.8, 1.4, 1.8);
          targetLook.set(-0.8, 0.45, 0.9);
          break;
        case 'bench':
        default:
          targetPos.set(0, 5, 8);
          targetLook.set(0, 0.8, 0);
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
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [cameraPreset, evidence, isAr, setSelectedEvidenceId]);

  const selectedEvidence = evidence.find((e) => e.id === selectedEvidenceId) || evidence[0];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Banner */}
      <div className="absolute top-3 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white backdrop-blur-md shadow-lg pointer-events-none">
        <FileCheck className="w-4 h-4 text-emerald-400" />
        <span className="font-bold">{isAr ? 'مختبر الأدلة الجنائية الرقمية 3D' : '3D Digital Forensics Evidence Bench'}</span>
        <span className="text-[10px] font-mono text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded bg-emerald-950/60">
          CHAIN_OF_CUSTODY_SEALED
        </span>
      </div>

      {/* Hovered / Selected Item Tooltip */}
      {(hoveredItemName || selectedEvidence) && (
        <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/50 backdrop-blur-md shadow-xl text-xs text-slate-200">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-white block">
              {hoveredItemName || (selectedEvidence?.metadata?.description as string) || selectedEvidence?.id}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              HASH: SHA-256 VERIFIED  |  WRITE-BLOCK: ACTIVE
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
          {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isControlsCollapsed ? (isAr ? 'إظهار أدوات الفحص 3D' : 'Show 3D Controls') : (isAr ? 'إخفاء أدوات الفحص' : 'Hide Controls')}</span>
        </button>

        <div className="w-full p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera Focus Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              {isAr ? 'تركيز المنظور:' : 'FOCUS:'}
            </span>

            <button
              onClick={() => setCameraPreset('bench')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'bench'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'طاولة الفحص الشاملة' : 'Full Bench'}
            </button>

            <button
              onClick={() => setCameraPreset('writeblocker')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'writeblocker'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'جهاز الحظر الجنائي' : 'Write-Blocker'}
            </button>

            <button
              onClick={() => setCameraPreset('hdd')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'hdd'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'القرص الصلب 3.5"' : 'Hard Drive'}
            </button>

            <button
              onClick={() => setCameraPreset('ram')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'ram'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الذاكرة العشوائية' : 'RAM Module'}
            </button>
          </div>

          {/* Quick Integrity Info */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isAr ? 'سلامة الأدلة: متطابقة 100%' : 'Evidence Integrity: 100%'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">{evidence.length} ARTIFACTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
