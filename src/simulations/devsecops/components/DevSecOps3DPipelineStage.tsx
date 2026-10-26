import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useSimulationStore } from '../../../stores/simulationStore';
import {
  Workflow,
  ShieldCheck,
  Box,
  Key,
  Layers,
  FileCode,
  CheckCircle2,
  Lock,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DevSecOps3DPipelineStageProps {
  onSelectGate?: (gateName: string) => void;
}

export const DevSecOps3DPipelineStage: React.FC<DevSecOps3DPipelineStageProps> = ({
  onSelectGate,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'pipeline' | 'sast' | 'signing' | 'deploy'>('pipeline');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [selectedGate, setSelectedGate] = useState<{
    id: string;
    nameAr: string;
    nameEn: string;
    stage: string;
    status: string;
    controls: string;
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

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 18);
    cameraRef.current = camera;

    // 2. WebGL Renderer
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

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.target.set(0, 0.5, 0);

    // 4. Lighting & Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xa855f7, 0x020617, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xf5f3ff, 1.4);
    dirLight.position.set(6, 14, 8);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const purplePoint = new THREE.PointLight(0xa855f7, 2, 20);
    purplePoint.position.set(0, 4, 0);
    scene.add(purplePoint);

    // 5. Floor Grid
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const fCanvas = document.createElement('canvas');
    fCanvas.width = 256;
    fCanvas.height = 256;
    const fCtx = fCanvas.getContext('2d')!;
    fCtx.fillStyle = '#020617';
    fCtx.fillRect(0, 0, 256, 256);
    fCtx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
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

    // Helper: Build a Pipeline Stage Station
    const createPipelineGate = (
      nameAr: string,
      nameEn: string,
      stepNum: number,
      x: number,
      z: number,
      colorHex: number,
      controlsInfo: string
    ) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(x, 0.2, z);
      gateGroup.userData = {
        id: `gate_${stepNum}`,
        nameAr,
        nameEn,
        stage: `STAGE_${stepNum}`,
        status: 'PASSED_GUARDRAIL',
        controls: controlsInfo,
      };

      // Conveyor Pedestal
      const slabGeo = new THREE.BoxGeometry(2.6, 0.25, 3.2);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.85,
        roughness: 0.25,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = !isSoftwareGl;
      gateGroup.add(slab);

      // Neon Portal Arch (Security Gate)
      const archMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
      });

      // Arch Posts
      const postGeo = new THREE.BoxGeometry(0.15, 1.8, 0.15);
      [-1.1, 1.1].forEach((px) => {
        const post = new THREE.Mesh(postGeo, archMat);
        post.position.set(px, 0.9, 0);
        gateGroup.add(post);
      });

      // Arch Top Beam
      const beamGeo = new THREE.BoxGeometry(2.35, 0.15, 0.15);
      const beam = new THREE.Mesh(beamGeo, archMat);
      beam.position.set(0, 1.8, 0);
      gateGroup.add(beam);

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
      lCtx.font = 'bold 24px monospace';
      lCtx.fillText(`STEP ${stepNum}: ${nameEn.toUpperCase()}`, 20, 50);
      lCtx.fillStyle = '#a855f7';
      lCtx.font = '18px monospace';
      lCtx.fillText(`STATUS: ENFORCED | SHIFT-LEFT`, 20, 90);

      const lTex = new THREE.CanvasTexture(lCanvas);
      lTex.colorSpace = THREE.SRGBColorSpace;
      const lMat = new THREE.MeshBasicMaterial({ map: lTex });
      const lblMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.65), lMat);
      lblMesh.rotation.x = -Math.PI / 2;
      lblMesh.position.set(0, 0.13, -1.2);
      gateGroup.add(lblMesh);

      scene.add(gateGroup);
      interactiveObjectsRef.current.push(gateGroup);
      return gateGroup;
    };

    // 6. Build the 5 Continuous Supply Chain Stages:
    // Stage 1: Commit & Signed Code
    const g1 = createPipelineGate('1. التزام الكود والتوقيع الرقمي', 'Git Commit & GPG Signature', 1, -8, 0, 0x3b82f6, 'GPG Signature Verified + Secret Scanning Pre-commit Hook');

    // Stage 2: SAST Static Scanner
    const g2 = createPipelineGate('2. فحص الكود المصدري SAST', 'Semgrep SAST Quality Gate', 2, -4, 0, 0xa855f7, 'Semgrep Ruleset (0 SQLi, 0 XSS, 0 Insecure Deserialization)');

    // Stage 3: SCA & Dependency SBOM
    const g3 = createPipelineGate('3. فحص التبعيات وقائمة SBOM', 'SCA Audit & CycloneDX SBOM', 3, 0, 0, 0x10b981, 'Trivy SCA scan + SLSA Level 3 Provenance attestation');

    // Stage 4: IaC Terraform Security
    const g4 = createPipelineGate('4. أمن البنية التحتية ككود IaC', 'Checkov Terraform IaC Gate', 4, 4, 0, 0xf59e0b, 'Checkov HCL analysis + OPA policy enforcement');

    // Stage 5: Container Build & Cosign Signing
    const g5 = createPipelineGate('5. توقيع الحاوية والنشر النهائي', 'Cosign Signing & Cluster Deploy', 5, 8, 0, 0x06b6d4, 'Cosign keyless signature + Rekor transparency log proof');

    // 7. Conveyor Track Connecting the Stages
    const trackGeo = new THREE.BoxGeometry(18, 0.1, 0.6);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0.25, 0);
    scene.add(track);

    // Glowing Laser Scanning Ray at SAST Gate
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.8, 8);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.8 });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(-4, 0.9, 0);
    scene.add(laser);

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
          setSelectedGate({
            id: root.userData.id,
            nameAr: root.userData.nameAr,
            nameEn: root.userData.nameEn,
            stage: root.userData.stage,
            status: root.userData.status,
            controls: root.userData.controls,
          });
          onSelectGate?.(root.userData.nameEn);
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

      // Oscillate SAST Laser
      laser.position.z = Math.sin(clock.getElapsedTime() * 4) * 0.8;

      // Smooth Camera Transitions
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 0.5, 0);

      switch (cameraPreset) {
        case 'sast':
          targetPos.set(-4, 3.5, 4.5);
          targetLook.set(-4, 0.8, 0);
          break;
        case 'signing':
          targetPos.set(0, 3.5, 4.5);
          targetLook.set(0, 0.8, 0);
          break;
        case 'deploy':
          targetPos.set(8, 3.5, 4.5);
          targetLook.set(8, 0.8, 0);
          break;
        case 'pipeline':
        default:
          targetPos.set(0, 10, 18);
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
  }, [cameraPreset, onSelectGate]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Banner */}
      <div className="absolute top-3 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white backdrop-blur-md shadow-lg pointer-events-none">
        <Workflow className="w-4 h-4 text-purple-400" />
        <span className="font-bold">{isAr ? 'خط الإنتاج الآمن 3D (Shift-Left CI/CD Pipeline)' : '3D DevSecOps CI/CD Pipeline'}</span>
        <span className="text-[10px] font-mono text-purple-400 border border-purple-800 px-1.5 py-0.5 rounded bg-purple-950/60">
          SLSA_LEVEL_3_ENFORCED
        </span>
      </div>

      {/* Selected Gate Card */}
      {selectedGate && (
        <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-purple-500/50 backdrop-blur-md shadow-xl text-xs text-slate-200">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <div>
            <span className="font-bold text-white block">
              {isAr ? selectedGate.nameAr : selectedGate.nameEn}
            </span>
            <span className="text-[10px] font-mono text-purple-400">
              {selectedGate.controls}
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
          {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-purple-400" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-400" />}
          <span>{isControlsCollapsed ? (isAr ? 'إظهار أدوات خط الإنتاج 3D' : 'Show 3D Controls') : (isAr ? 'إخفاء أدوات خط الإنتاج' : 'Hide Controls')}</span>
        </button>

        <div className="w-full p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              {isAr ? 'محطة الفحص:' : 'GATE:'}
            </span>

            <button
              onClick={() => setCameraPreset('pipeline')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'pipeline'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الخط كاملاً' : 'Full Pipeline'}
            </button>

            <button
              onClick={() => setCameraPreset('sast')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'sast'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'بوابة SAST' : 'SAST Scanner'}
            </button>

            <button
              onClick={() => setCameraPreset('signing')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'signing'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'جرد SBOM' : 'SBOM & SCA'}
            </button>

            <button
              onClick={() => setCameraPreset('deploy')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'deploy'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'النشر والتوقيع' : 'Cosign & Deploy'}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isAr ? 'البوابات الأمنية: 5/5 مجتازة' : 'Gates: 5/5 Passing'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-purple-400 font-bold">SLSA L3 ATTESTATION</span>
          </div>
        </div>
      </div>
    </div>
  );
};
