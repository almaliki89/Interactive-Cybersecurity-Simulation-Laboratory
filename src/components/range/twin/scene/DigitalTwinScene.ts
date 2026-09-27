/**
 * OMEGA ULTRA REALITY V1.1 — Master Digital Twin 3D Scene
 * High-performance orchestrator for Rooms, Hardware, Dynamic Cabling, Lighting & Controls.
 */

import * as THREE from 'three';
import { CameraController } from './CameraController';
import { createEnvironmentLighting, LightingRig } from './EnvironmentLighting';
import { createRoomShell } from './RoomShell';
import { createServerRoom, ServerRoomResult } from './ServerRoom';
import { createOfficeRoom, OfficeRoomResult } from './OfficeRoom';
import { CableRenderer } from '../network/CableRenderer';
import { LinkStateVisualizer, LedRegistration } from '../network/LinkStateVisualizer';
import { useDigitalTwinStore } from '../../../../engine/reality/digitalTwinStore';
import { globalRealityEngine } from '../../../../engine/reality/RealityEngine';
import { globalSimulationRuntime } from '../../../../engine/runtime/SimulationRuntime';
import { WorkstationScreenState } from '../assets/MonitorAsset';

export class DigitalTwinScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private cameraController: CameraController;
  private lighting: LightingRig;
  private roomShell: THREE.Group;
  private serverRoom: ServerRoomResult;
  private officeRoom: OfficeRoomResult;
  private cableRenderer: CableRenderer;
  private ledVisualizer: LinkStateVisualizer;

  private allInteractiveObjects: THREE.Object3D[] = [];
  private allLedRegistry: Map<string, LedRegistration[]> = new Map();
  private allAnchors: Map<string, THREE.Vector3> = new Map();

  private animationFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private pointer: THREE.Vector2 = new THREE.Vector2();

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 2. Three.js Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080e);
    this.scene.fog = new THREE.FogExp2(0x06080e, 0.022);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 3. Camera & Controller
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.cameraController = new CameraController(camera);
    this.cameraController.attachControls(this.renderer.domElement);

    // 4. Lighting Rig
    this.lighting = createEnvironmentLighting(this.scene);

    // 5. Architectural Room Shell
    this.roomShell = createRoomShell(this.scene);

    // 6. Server Room & Office Sectors
    this.serverRoom = createServerRoom();
    this.scene.add(this.serverRoom.group);

    this.officeRoom = createOfficeRoom();
    this.scene.add(this.officeRoom.group);

    // Merge interactive objects, leds, and port anchors
    this.allInteractiveObjects.push(
      ...this.serverRoom.interactiveObjects,
      ...this.officeRoom.interactiveObjects
    );

    this.serverRoom.ledRegistry.forEach((leds, id) => this.allLedRegistry.set(id, leds));
    this.officeRoom.ledRegistry.forEach((leds, id) => this.allLedRegistry.set(id, leds));

    this.serverRoom.anchorPositions.forEach((pos, key) => this.allAnchors.set(key, pos));
    this.officeRoom.anchorPositions.forEach((pos, key) => this.allAnchors.set(key, pos));

    // 7. Dynamic Cable Network & LED Visualizer
    this.cableRenderer = new CableRenderer();
    this.scene.add(this.cableRenderer.group);
    this.ledVisualizer = new LinkStateVisualizer();

    // Initial cable build
    const initialCables = useDigitalTwinStore.getState().cables;
    this.cableRenderer.renderCables(initialCables, this.allAnchors);
    this.allInteractiveObjects.push(...this.cableRenderer.interactiveCables);

    // 8. Event Listeners
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('resize', this.handleResize);

    // 9. Start Render Loop
    this.startLoop();
  }

  public updateView(
    mode: ReturnType<typeof useDigitalTwinStore.getState>['cameraMode'],
    roomId: ReturnType<typeof useDigitalTwinStore.getState>['selectedRoomId'],
    selectedDeviceId: string | null
  ): void {
    this.cameraController.setView(mode, roomId, selectedDeviceId);
  }

  public updateCables(): void {
    const cables = useDigitalTwinStore.getState().cables;
    this.cableRenderer.renderCables(cables, this.allAnchors);

    // Re-index interactive cables
    this.allInteractiveObjects = [
      ...this.serverRoom.interactiveObjects,
      ...this.officeRoom.interactiveObjects,
      ...this.cableRenderer.interactiveCables,
    ];
  }

  private handlePointerDown = (event: MouseEvent): void => {
    // Only raycast on primary left-click without significant dragging
    if (event.button !== 0) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.cameraController.camera);
    const intersects = this.raycaster.intersectObjects(this.allInteractiveObjects, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      while (hitObj && !hitObj.userData.deviceId && !hitObj.userData.cableId) {
        hitObj = hitObj.parent;
      }

      if (hitObj?.userData.deviceId) {
        useDigitalTwinStore.getState().selectDevice(hitObj.userData.deviceId);
      } else if (hitObj?.userData.cableId) {
        useDigitalTwinStore.getState().selectCable(hitObj.userData.cableId);
      }
    }
  };

  private handleResize = (): void => {
    if (!this.container) return;
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;
    this.cameraController.camera.aspect = w / h;
    this.cameraController.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private startLoop = (): void => {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // 1. Camera interpolation
      this.cameraController.update(delta);

      // 2. Server Rack Fan Blades Rotation
      this.serverRoom.rack.fanBlades.forEach((blade) => {
        blade.rotation.y += delta * 12;
      });

      // 3. Hardware LEDs synchronization
      const currentDevices = useDigitalTwinStore.getState().devices;
      this.ledVisualizer.updateLeds(this.allLedRegistry, currentDevices, elapsed);

      // 4. Dynamic Monitor Screen Texture (derived from RealityEngine WindowsMachine and DigitalTwin state)
      const finDevice = currentDevices['FIN-WS01'];
      const finMachine = globalRealityEngine.registry.getMachine('FIN-WS01');
      const vTime = globalSimulationRuntime.clock.getVirtualTime();

      const isOnline = finDevice ? finDevice.powerStatus === 'ONLINE' : (finMachine ? finMachine.status === 'ONLINE' : false);
      const activeSessions = finMachine ? finMachine.getActiveSessions() : [];
      const primarySession = activeSessions.length > 0 ? activeSessions[0] : null;
      const runningProcesses = finMachine ? finMachine.getRunningProcesses() : [];
      const interfaces = finDevice?.interfaces || [];
      const activeNics = interfaces.filter((nic) => nic.status === 'UP');
      const networkStatus = activeNics.length > 0 ? 'CONNECTED' as const : 'DISCONNECTED' as const;

      const screenState: WorkstationScreenState = {
        powerStatus: isOnline ? 'ONLINE' : 'OFFLINE',
        hostname: finMachine ? finMachine.hostname : (finDevice?.id || 'FIN-WS01'),
        domain: finMachine ? finMachine.domain : 'NEXORA.LOCAL',
        ipAddress: finMachine ? finMachine.ipAddress : (interfaces[0]?.ip || '10.10.30.15'),
        loggedOnUser: primarySession ? primarySession.userName : null,
        sessionCount: activeSessions.length,
        processCount: runningProcesses.length,
        networkStatus,
        activeInterfaceCount: activeNics.length,
        virtualTime: vTime,
      };

      this.officeRoom.workstation.monitor.updateScreenState(screenState);

      // 5. Cable Photon Pulse on active links
      const cables = useDigitalTwinStore.getState().cables;
      const activeCables = Object.values(cables)
        .filter((c) => c.status === 'CONNECTED')
        .map((c) => c.id);
      this.cableRenderer.updateCablePulse(elapsed, activeCables);

      // Render Scene
      this.renderer.render(this.scene, this.cameraController.camera);
    };

    animate();
  };

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.cameraController.dispose();
    this.renderer.dispose();
    this.scene.clear();
  }
}
