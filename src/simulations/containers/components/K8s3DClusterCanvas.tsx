import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useSimulationStore } from '../../../stores/simulationStore';
import {
  Boxes,
  ShieldCheck,
  Server,
  Layers,
  Lock,
  Cpu,
  Flame,
  Network,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface K8s3DClusterCanvasProps {
  onSelectComponent?: (name: string) => void;
}

export const K8s3DClusterCanvas: React.FC<K8s3DClusterCanvasProps> = ({
  onSelectComponent,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'controlplane' | 'worker1' | 'worker2'>('overview');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [selectedK8sItem, setSelectedK8sItem] = useState<{
    id: string;
    nameAr: string;
    nameEn: string;
    type: string;
    pssProfile: string;
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
    camera.position.set(0, 11, 16);
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
    controls.maxDistance = 30;
    controls.target.set(0, 0, 0);

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.5);
    dirLight.position.set(5, 14, 7);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const emeraldPoint = new THREE.PointLight(0x10b981, 2, 20);
    emeraldPoint.position.set(0, 4, 0);
    scene.add(emeraldPoint);

    // 5. Cluster Hex Grid Floor
    const gridGeo = new THREE.PlaneGeometry(36, 36);
    const gCanvas = document.createElement('canvas');
    gCanvas.width = 256;
    gCanvas.height = 256;
    const gCtx = gCanvas.getContext('2d')!;
    gCtx.fillStyle = '#020617';
    gCtx.fillRect(0, 0, 256, 256);
    gCtx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
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

    // Helper: Create a K8s Node Platform
    const createK8sNodePlatform = (
      nameAr: string,
      nameEn: string,
      role: 'control-plane' | 'worker',
      x: number,
      z: number,
      colorHex: number
    ) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, 0.2, z);

      // Chassis Platform
      const slabGeo = new THREE.BoxGeometry(5.8, 0.25, 5.0);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.85,
        roughness: 0.25,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = !isSoftwareGl;
      nodeGroup.add(slab);

      // Neon Border
      const edgeGeo = new THREE.EdgesGeometry(slabGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
      nodeGroup.add(new THREE.LineSegments(edgeGeo, edgeMat));

      // Node Name Label
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
      lCtx.fillStyle = '#10b981';
      lCtx.font = '18px monospace';
      lCtx.fillText(`ROLE: ${role.toUpperCase()} | K8S v1.31.1`, 20, 90);

      const lTex = new THREE.CanvasTexture(lCanvas);
      lTex.colorSpace = THREE.SRGBColorSpace;
      const lMat = new THREE.MeshBasicMaterial({ map: lTex });
      const lblMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), lMat);
      lblMesh.rotation.x = -Math.PI / 2;
      lblMesh.position.set(0, 0.13, -1.9);
      nodeGroup.add(lblMesh);

      scene.add(nodeGroup);
      return nodeGroup;
    };

    // 6. Build K8s Cluster Nodes
    // A. Master Node: Control Plane
    const masterNode = createK8sNodePlatform('خادم التحكم الرئيسي Master Node', 'Control Plane Node', 'control-plane', 0, -2, 0x10b981);

    // Kube-apiserver Gateway
    const apiServerGroup = new THREE.Group();
    apiServerGroup.position.set(-1.4, 0.9, 0);
    apiServerGroup.userData = {
      id: 'kube_apiserver',
      nameAr: 'بوابة واجهة برمجة التطبيقات (kube-apiserver + TLS 1.3)',
      nameEn: 'kube-apiserver (Mutual TLS Authentication)',
      type: 'API_SERVER',
      pssProfile: 'RESTRICTED',
    };
    const apiGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.8, 16);
    const apiMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.15 });
    apiServerGroup.add(new THREE.Mesh(apiGeo, apiMat));
    masterNode.add(apiServerGroup);
    interactiveObjectsRef.current.push(apiServerGroup);

    // KMS-Encrypted etcd Datastore Crystal
    const etcdGroup = new THREE.Group();
    etcdGroup.position.set(1.4, 1.0, 0);
    etcdGroup.userData = {
      id: 'etcd_cluster',
      nameAr: 'قاعدة بيانات etcd مشفرة بحافظة KMS Envelope',
      nameEn: 'etcd Key-Value Store (KMS Envelope Encrypted)',
      type: 'ETCD',
      pssProfile: 'ENCRYPTED_AT_REST',
    };
    const etcdGeo = new THREE.DodecahedronGeometry(0.65, 0);
    const etcdMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const etcdMesh = new THREE.Mesh(etcdGeo, etcdMat);
    etcdGroup.add(etcdMesh);

    // Shield Ring around etcd
    const ringGeo = new THREE.TorusGeometry(0.9, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const etcdRing = new THREE.Mesh(ringGeo, ringMat);
    etcdRing.rotation.x = Math.PI / 3;
    etcdGroup.add(etcdRing);

    masterNode.add(etcdGroup);
    interactiveObjectsRef.current.push(etcdGroup);

    // B. Worker Node 1: Web & Ingress Workloads
    const worker1 = createK8sNodePlatform('خادم الحوسبة الأول Worker-01', 'Worker Node 01', 'worker', -6.5, 3.5, 0x06b6d4);

    // Hardened Pod 1 (Nginx Ingress)
    const pod1Group = new THREE.Group();
    pod1Group.position.set(-1.2, 0.7, 0.2);
    pod1Group.userData = {
      id: 'pod_ingress',
      nameAr: 'حاوية Ingress Pod (readOnlyRootFilesystem, drop ALL caps)',
      nameEn: 'Ingress Controller Pod (Hardened PSS Restricted)',
      type: 'POD',
      pssProfile: 'PSS_RESTRICTED',
    };
    const pGeo = new THREE.BoxGeometry(0.9, 0.7, 0.9);
    const pMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.25 });
    pod1Group.add(new THREE.Mesh(pGeo, pMat));
    worker1.add(pod1Group);
    interactiveObjectsRef.current.push(pod1Group);

    // Hardened Pod 2 (API Microservice)
    const pod2Group = new THREE.Group();
    pod2Group.position.set(1.2, 0.7, 0.2);
    pod2Group.userData = {
      id: 'pod_api',
      nameAr: 'حاوية API Service Pod (Non-Root User 10001, Seccomp Default)',
      nameEn: 'Core API Microservice Pod (Non-Root User 10001)',
      type: 'POD',
      pssProfile: 'PSS_RESTRICTED',
    };
    pod2Group.add(new THREE.Mesh(pGeo, pMat));
    worker1.add(pod2Group);
    interactiveObjectsRef.current.push(pod2Group);

    // C. Worker Node 2: Database & Backend
    const worker2 = createK8sNodePlatform('خادم الحوسبة الثاني Worker-02', 'Worker Node 02', 'worker', 6.5, 3.5, 0x8b5cf6);

    // Hardened Pod 3 (StatefulSet Redis/Postgres)
    const pod3Group = new THREE.Group();
    pod3Group.position.set(-1.2, 0.7, 0.2);
    pod3Group.userData = {
      id: 'pod_database',
      nameAr: 'حاوية StatefulSet Database Pod (NetworkPolicy Default Deny)',
      nameEn: 'StatefulSet Database Pod (Cilium mTLS Enforced)',
      type: 'POD',
      pssProfile: 'PSS_RESTRICTED',
    };
    const pDbMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: 0.8, roughness: 0.25 });
    pod3Group.add(new THREE.Mesh(pGeo, pDbMat));
    worker2.add(pod3Group);
    interactiveObjectsRef.current.push(pod3Group);

    // Falco eBPF Runtime Detection Sensor
    const falcoGroup = new THREE.Group();
    falcoGroup.position.set(1.2, 0.8, 0.2);
    falcoGroup.userData = {
      id: 'falco_daemon',
      nameAr: 'مستشعر الرصد الحي للنواة (Falco / Tetragon eBPF DaemonSet)',
      nameEn: 'Falco eBPF Kernel Threat Sensor (DaemonSet)',
      type: 'DAEMONSET',
      pssProfile: 'KERNEL_OBSERVABILITY',
    };
    const fGeo = new THREE.OctahedronGeometry(0.5, 0);
    const fMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xbe123c, emissiveIntensity: 0.6 });
    falcoGroup.add(new THREE.Mesh(fGeo, fMat));
    worker2.add(falcoGroup);
    interactiveObjectsRef.current.push(falcoGroup);

    // 7. Catenary Istio / Cilium mTLS Glowing Particle Tubes
    const createServiceMeshTubes = () => {
      const tubesGroup = new THREE.Group();
      const pMaster = new THREE.Vector3(0, 1.2, -2);
      const pW1 = new THREE.Vector3(-4.5, 0.8, 2.5);
      const pW2 = new THREE.Vector3(4.5, 0.8, 2.5);

      const curve1 = new THREE.QuadraticBezierCurve3(pMaster, new THREE.Vector3(-2, 2.2, 0), pW1);
      const curve2 = new THREE.QuadraticBezierCurve3(pMaster, new THREE.Vector3(2, 2.2, 0), pW2);

      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
      tubesGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve1, 20, 0.04, 8, false), tubeMat));
      tubesGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve2, 20, 0.04, 8, false), tubeMat));

      scene.add(tubesGroup);
    };

    createServiceMeshTubes();

    // 8. Raycasting
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
          setSelectedK8sItem({
            id: root.userData.id,
            nameAr: root.userData.nameAr,
            nameEn: root.userData.nameEn,
            type: root.userData.type,
            pssProfile: root.userData.pssProfile,
          });
          onSelectComponent?.(root.userData.nameEn);
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

      // Rotate etcd crystal and ring
      etcdMesh.rotation.y += delta * 0.7;
      etcdRing.rotation.z += delta * 0.5;

      // Smooth Camera Transitions
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 0, 0);

      switch (cameraPreset) {
        case 'controlplane':
          targetPos.set(0, 4.5, 3);
          targetLook.set(0, 1.0, -2);
          break;
        case 'worker1':
          targetPos.set(-6.5, 4.5, 8.5);
          targetLook.set(-6.5, 0.7, 3.5);
          break;
        case 'worker2':
          targetPos.set(6.5, 4.5, 8.5);
          targetLook.set(6.5, 0.7, 3.5);
          break;
        case 'overview':
        default:
          targetPos.set(0, 11, 16);
          targetLook.set(0, 0, 0);
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
  }, [cameraPreset, onSelectComponent]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Banner */}
      <div className="absolute top-3 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white backdrop-blur-md shadow-lg pointer-events-none">
        <Boxes className="w-4 h-4 text-emerald-400" />
        <span className="font-bold">{isAr ? 'عنقود كوبرنيتيس 3D (Kubernetes Hardened Cluster)' : '3D Hardened Kubernetes Cluster'}</span>
        <span className="text-[10px] font-mono text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded bg-emerald-950/60">
          PSS_RESTRICTED_ACTIVE
        </span>
      </div>

      {/* Selected Node Card */}
      {selectedK8sItem && (
        <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/50 backdrop-blur-md shadow-xl text-xs text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-white block">
              {isAr ? selectedK8sItem.nameAr : selectedK8sItem.nameEn}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              PROFILE: {selectedK8sItem.pssProfile}  |  STATUS: RUNNING
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
          <span>{isControlsCollapsed ? (isAr ? 'إظهار أدوات العنقود 3D' : 'Show 3D Controls') : (isAr ? 'إخفاء أدوات العنقود' : 'Hide Controls')}</span>
        </button>

        <div className="w-full p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              {isAr ? 'منظور العنقود:' : 'CAMERA:'}
            </span>

            <button
              onClick={() => setCameraPreset('overview')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'overview'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'العنقود كاملاً' : 'Full Cluster'}
            </button>

            <button
              onClick={() => setCameraPreset('controlplane')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'controlplane'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'خادم التحكم' : 'Control Plane'}
            </button>

            <button
              onClick={() => setCameraPreset('worker1')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'worker1'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'عقدة Worker 1' : 'Worker 01'}
            </button>

            <button
              onClick={() => setCameraPreset('worker2')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'worker2'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'عقدة Worker 2' : 'Worker 02'}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isAr ? 'سياسة PSS: Restricted' : 'PSS: Restricted'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">3 NODES / 4 PODS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
