import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useSimulationStore } from '../../../stores/simulationStore';
import {
  Cloud,
  Shield,
  Layers,
  Network,
  Lock,
  Database,
  Server,
  Eye,
  CheckCircle2,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Cloud3DArchitectureCanvasProps {
  blueprintId?: string;
  onSelectResource?: (resourceName: string) => void;
}

export const Cloud3DArchitectureCanvas: React.FC<Cloud3DArchitectureCanvasProps> = ({
  blueprintId = 'hub_spoke_tgw',
  onSelectResource,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'hub' | 'prod' | 'data'>('overview');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<{ id: string; nameAr: string; nameEn: string; type: string } | null>(null);

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
    camera.position.set(0, 12, 18);
    cameraRef.current = camera;

    // 2. WebGL Renderer
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
      renderer.toneMappingExposure = 1.15;
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
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.target.set(0, 0, 0);

    // 4. Lighting & Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    dirLight.position.set(6, 15, 8);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 2, 20);
    cyanPoint.position.set(0, 3, 0);
    scene.add(cyanPoint);

    // 5. Cloud Horizon Grid Floor
    const gridGeo = new THREE.PlaneGeometry(40, 40);
    const gCanvas = document.createElement('canvas');
    gCanvas.width = 256;
    gCanvas.height = 256;
    const gCtx = gCanvas.getContext('2d')!;
    gCtx.fillStyle = '#020617';
    gCtx.fillRect(0, 0, 256, 256);
    gCtx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    gCtx.lineWidth = 1;
    gCtx.strokeRect(0, 0, 256, 256);

    const gridTex = new THREE.CanvasTexture(gCanvas);
    gridTex.wrapS = THREE.RepeatWrapping;
    gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set(16, 16);
    gridTex.colorSpace = THREE.SRGBColorSpace;

    const gridMat = new THREE.MeshBasicMaterial({ map: gridTex });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -0.05;
    scene.add(gridMesh);

    interactiveObjectsRef.current = [];

    // Helper: Build a floating Isometric VPC Platform
    const createVpcPlatform = (
      nameAr: string,
      nameEn: string,
      cidr: string,
      x: number,
      z: number,
      colorHex: number
    ) => {
      const vpcGroup = new THREE.Group();
      vpcGroup.position.set(x, 0.2, z);

      // Base Slab
      const slabGeo = new THREE.BoxGeometry(6.5, 0.2, 5.5);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.8,
        roughness: 0.3,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = !isSoftwareGl;
      vpcGroup.add(slab);

      // Neon Boundary Edge
      const edgeGeo = new THREE.EdgesGeometry(slabGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
      const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
      vpcGroup.add(edgeLine);

      // Label Banner (Canvas)
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
      lCtx.font = 'bold 28px monospace';
      lCtx.fillText(nameEn.toUpperCase(), 20, 50);
      lCtx.fillStyle = '#38bdf8';
      lCtx.font = '20px monospace';
      lCtx.fillText(`CIDR: ${cidr} | REGION: me-central-1`, 20, 90);

      const lTex = new THREE.CanvasTexture(lCanvas);
      lTex.colorSpace = THREE.SRGBColorSpace;
      const lMat = new THREE.MeshBasicMaterial({ map: lTex });
      const lblMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.85), lMat);
      lblMesh.rotation.x = -Math.PI / 2;
      lblMesh.position.set(0, 0.11, -2.1);
      vpcGroup.add(lblMesh);

      scene.add(vpcGroup);
      return vpcGroup;
    };

    // 6. Build VPC Architecture Nodes:
    // A. Central Hub: Transit Gateway (TGW) Hub VPC
    const hubVpc = createVpcPlatform('شبكة الموزع المركزي Hub', 'Transit Hub VPC', '10.0.0.0/16', 0, 0, 0x06b6d4);

    // TGW Core Router (Rotating Octahedron Crystal)
    const tgwGroup = new THREE.Group();
    tgwGroup.position.set(0, 1.4, 0);
    tgwGroup.userData = {
      id: 'tgw_core',
      nameAr: 'الموزع المركزي Transit Gateway (TGW)',
      nameEn: 'AWS Transit Gateway Central Router',
      type: 'TGW',
    };

    const octGeo = new THREE.OctahedronGeometry(0.8, 0);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
    });
    const tgwCrystal = new THREE.Mesh(octGeo, octMat);
    tgwGroup.add(tgwCrystal);

    // Wireframe Cage around TGW
    const cageGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const cageMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.4 });
    const tgwCage = new THREE.Mesh(cageGeo, cageMat);
    tgwGroup.add(tgwCage);

    hubVpc.add(tgwGroup);
    interactiveObjectsRef.current.push(tgwGroup);

    // B. Spoke 1: Production Workloads (Left: Web & Compute Tier)
    const prodVpc = createVpcPlatform('شبكة الإنتاج Spoke-A', 'Production VPC', '10.1.0.0/16', -8, 0, 0x10b981);

    // ALB Load Balancer
    const albGroup = new THREE.Group();
    albGroup.position.set(-1.6, 0.7, 0);
    albGroup.userData = {
      id: 'prod_alb',
      nameAr: 'موزع الأحمال للتطبيقات (Application Load Balancer + WAF)',
      nameEn: 'Application Load Balancer (ALB + AWS WAF)',
      type: 'ALB',
    };
    const albGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const albMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 });
    const albMesh = new THREE.Mesh(albGeo, albMat);
    albGroup.add(albMesh);
    prodVpc.add(albGroup);
    interactiveObjectsRef.current.push(albGroup);

    // EC2 Compute Nodes
    [-0.5, 1.2].forEach((cz, cIdx) => {
      const ec2Group = new THREE.Group();
      ec2Group.position.set(1.4, 0.6, cz);
      ec2Group.userData = {
        id: `prod_ec2_${cIdx}`,
        nameAr: `خادم التطبيقات الافتراضي EC2 AppInstance #${cIdx + 1}`,
        nameEn: `Hardened EC2 Application Instance #${cIdx + 1}`,
        type: 'EC2',
      };
      const ec2Geo = new THREE.BoxGeometry(0.7, 0.6, 0.7);
      const ec2Mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
      const ec2Mesh = new THREE.Mesh(ec2Geo, ec2Mat);
      ec2Group.add(ec2Mesh);
      prodVpc.add(ec2Group);
      interactiveObjectsRef.current.push(ec2Group);
    });

    // C. Spoke 2: Data & Storage VPC (Right: RDS Database & S3 Bucket)
    const dataVpc = createVpcPlatform('شبكة البيانات Spoke-B', 'Data & Storage VPC', '10.2.0.0/16', 8, 0, 0x8b5cf6);

    // RDS Database Cylinder
    const rdsGroup = new THREE.Group();
    rdsGroup.position.set(-1.2, 0.7, 0);
    rdsGroup.userData = {
      id: 'rds_postgres',
      nameAr: 'قاعدة بيانات سحابية مشفرة (RDS PostgreSQL Multi-AZ)',
      nameEn: 'Encrypted RDS Multi-AZ PostgreSQL Cluster',
      type: 'RDS',
    };
    const rdsGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 16);
    const rdsMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.85, roughness: 0.25 });
    const rdsMesh = new THREE.Mesh(rdsGeo, rdsMat);
    rdsGroup.add(rdsMesh);
    dataVpc.add(rdsGroup);
    interactiveObjectsRef.current.push(rdsGroup);

    // S3 Storage Bucket
    const s3Group = new THREE.Group();
    s3Group.position.set(1.4, 0.7, 0);
    s3Group.userData = {
      id: 's3_bucket',
      nameAr: 'حاوية تخزين سحابية S3 مع تشفير KMS وحظر الوصول العام',
      nameEn: 'S3 Storage Bucket (SSE-KMS & Block Public Access)',
      type: 'S3',
    };
    const s3Geo = new THREE.CylinderGeometry(0.55, 0.45, 0.7, 16);
    const s3Mat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const s3Mesh = new THREE.Mesh(s3Geo, s3Mat);
    s3Group.add(s3Mesh);
    dataVpc.add(s3Group);
    interactiveObjectsRef.current.push(s3Group);

    // 7. Catenary Transit Peering Tubes & Particle Beams
    const createTransitTubes = () => {
      const tubesGroup = new THREE.Group();

      // Left Spoke to Hub Tube
      const p1 = new THREE.Vector3(-4.8, 0.6, 0);
      const pMid1 = new THREE.Vector3(-2.4, 1.8, 0);
      const p2 = new THREE.Vector3(0, 1.2, 0);
      const curve1 = new THREE.QuadraticBezierCurve3(p1, pMid1, p2);
      const tube1Geo = new THREE.TubeGeometry(curve1, 20, 0.04, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.7 });
      tubesGroup.add(new THREE.Mesh(tube1Geo, tubeMat));

      // Right Spoke to Hub Tube
      const p3 = new THREE.Vector3(4.8, 0.6, 0);
      const pMid2 = new THREE.Vector3(2.4, 1.8, 0);
      const curve2 = new THREE.QuadraticBezierCurve3(p3, pMid2, p2);
      const tube2Geo = new THREE.TubeGeometry(curve2, 20, 0.04, 8, false);
      tubesGroup.add(new THREE.Mesh(tube2Geo, tubeMat));

      scene.add(tubesGroup);
    };

    createTransitTubes();

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
          setSelectedNode({
            id: root.userData.id,
            nameAr: root.userData.nameAr,
            nameEn: root.userData.nameEn,
            type: root.userData.type,
          });
          onSelectResource?.(root.userData.nameEn);
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

      // Rotate TGW Crystal
      tgwCrystal.rotation.y += delta * 0.8;
      tgwCage.rotation.y -= delta * 0.4;

      // Smooth Camera Transitions
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, 0, 0);

      switch (cameraPreset) {
        case 'hub':
          targetPos.set(0, 5, 6);
          targetLook.set(0, 1.2, 0);
          break;
        case 'prod':
          targetPos.set(-8, 5, 6);
          targetLook.set(-8, 0.5, 0);
          break;
        case 'data':
          targetPos.set(8, 5, 6);
          targetLook.set(8, 0.5, 0);
          break;
        case 'overview':
        default:
          targetPos.set(0, 12, 18);
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
  }, [cameraPreset, onSelectResource]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Banner */}
      <div className="absolute top-3 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white backdrop-blur-md shadow-lg pointer-events-none">
        <Cloud className="w-4 h-4 text-cyan-400" />
        <span className="font-bold">{isAr ? 'المعمارية السحابية 3D (Hub & Spoke Mesh)' : '3D Cloud VPC Architecture'}</span>
        <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded bg-cyan-950/60">
          TRANSIT_ROUTING_ONLINE
        </span>
      </div>

      {/* Selected Node Card */}
      {selectedNode && (
        <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/50 backdrop-blur-md shadow-xl text-xs text-slate-200">
          <Shield className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="font-bold text-white block">
              {isAr ? selectedNode.nameAr : selectedNode.nameEn}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              POLICY: ZERO_TRUST_ENFORCED  |  ENCRYPTION: KMS_ACTIVE
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
          {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isControlsCollapsed ? (isAr ? 'إظهار أدوات المعمارية 3D' : 'Show 3D Controls') : (isAr ? 'إخفاء أدوات المعمارية' : 'Hide Controls')}</span>
        </button>

        <div className="w-full p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              {isAr ? 'المنظور المعماري:' : 'CAMERA:'}
            </span>

            <button
              onClick={() => setCameraPreset('overview')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'overview'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'المخطط الشامل' : 'Full Mesh'}
            </button>

            <button
              onClick={() => setCameraPreset('hub')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'hub'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الموزع TGW' : 'Transit Core'}
            </button>

            <button
              onClick={() => setCameraPreset('prod')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'prod'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'بيئة الإنتاج' : 'Prod VPC'}
            </button>

            <button
              onClick={() => setCameraPreset('data')}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                cameraPreset === 'data'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'مستودع البيانات' : 'Data VPC'}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isAr ? 'حالة التوجيه: Hub-and-Spoke' : 'Routing: Hub-and-Spoke'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">3 ISOLATED VPCS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
