/**
 * OMEGA ULTRA REALITY V1.1 — Camera Choreography & Controller
 * Smooth camera transitions between Building, Server Room, Rack Front, Rack Rear, and Workstation.
 */

import * as THREE from 'three';
import { CameraViewMode, RoomId } from '../../../../engine/reality/digitalTwinTypes';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public targetPos: THREE.Vector3 = new THREE.Vector3(0, 11, 16);
  public targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public currentPos: THREE.Vector3 = new THREE.Vector3(0, 11, 16);
  public currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  private isDragging: boolean = false;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;
  private spherical: THREE.Spherical = new THREE.Spherical();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentPos.copy(this.targetPos);
    this.currentLookAt.copy(this.targetLookAt);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }

  public setView(mode: CameraViewMode, roomId: RoomId, selectedDeviceId: string | null): void {
    if (mode === 'building') {
      this.targetPos.set(0, 11.5, 15.5);
      this.targetLookAt.set(0, 0, 0);
    } else if (mode === 'room') {
      if (roomId === 'server-room') {
        this.targetPos.set(-3.5, 2.9, 4.4);
        this.targetLookAt.set(-3.5, 1.8, 0);
      } else if (roomId === 'finance-dept') {
        this.targetPos.set(4.2, 2.3, 3.6);
        this.targetLookAt.set(4.2, 1.1, 0);
      } else {
        this.targetPos.set(0, 5, 8);
        this.targetLookAt.set(0, 1, 0);
      }
    } else if (mode === 'rack' || mode === 'rack-front') {
      // Direct front elevation of RACK-01
      this.targetPos.set(-3.5, 2.05, 2.5);
      this.targetLookAt.set(-3.5, 1.95, 0);
    } else if (mode === 'rack-rear') {
      // Direct rear elevation of RACK-01
      this.targetPos.set(-3.5, 2.05, -2.5);
      this.targetLookAt.set(-3.5, 1.95, 0);
    } else if (mode === 'workstation') {
      // Finance workstation desk close-up
      this.targetPos.set(4.2, 1.42, 1.55);
      this.targetLookAt.set(4.2, 1.22, 0);
    } else if (mode === 'device') {
      if (selectedDeviceId === 'PP-01') {
        this.targetPos.set(-3.5, 3.15, 1.05);
        this.targetLookAt.set(-3.5, 3.1, 0);
      } else if (selectedDeviceId === 'FW-01') {
        this.targetPos.set(-3.5, 2.98, 1.05);
        this.targetLookAt.set(-3.5, 2.95, 0);
      } else if (selectedDeviceId === 'CORE-SW01') {
        this.targetPos.set(-3.5, 2.82, 1.05);
        this.targetLookAt.set(-3.5, 2.78, 0);
      } else if (selectedDeviceId === 'DC01') {
        this.targetPos.set(-3.5, 2.45, 1.15);
        this.targetLookAt.set(-3.5, 2.4, 0);
      } else if (selectedDeviceId === 'FILE01') {
        this.targetPos.set(-3.5, 2.05, 1.15);
        this.targetLookAt.set(-3.5, 2.0, 0);
      } else if (selectedDeviceId === 'FIN-WS01') {
        this.targetPos.set(4.2, 1.42, 1.55);
        this.targetLookAt.set(4.2, 1.22, 0);
      } else if (selectedDeviceId === 'PDU-01' || selectedDeviceId === 'UPS-01') {
        this.targetPos.set(-3.5, 0.65, 1.25);
        this.targetLookAt.set(-3.5, 0.55, 0);
      } else {
        this.targetPos.set(-3.5, 2.05, 2.5);
        this.targetLookAt.set(-3.5, 1.95, 0);
      }
    }
  }

  public update(_delta?: number): void {
    // Smooth damp lerp towards target
    this.currentPos.lerp(this.targetPos, 0.08);
    this.currentLookAt.lerp(this.targetLookAt, 0.08);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }

  private boundOnPointerDown = (e: MouseEvent) => this.onPointerDown(e);
  private boundOnPointerMove = (e: MouseEvent) => this.onPointerMove(e);
  private boundOnPointerUp = () => this.onPointerUp();
  private boundOnWheel = (e: WheelEvent) => this.onWheel(e);
  private attachedElement: HTMLElement | null = null;

  public attachControls(domElement: HTMLElement): void {
    this.attachedElement = domElement;
    domElement.addEventListener('pointerdown', this.boundOnPointerDown);
    window.addEventListener('pointermove', this.boundOnPointerMove);
    window.addEventListener('pointerup', this.boundOnPointerUp);
    domElement.addEventListener('wheel', this.boundOnWheel, { passive: true });
  }

  public dispose(): void {
    if (this.attachedElement) {
      this.attachedElement.removeEventListener('pointerdown', this.boundOnPointerDown);
      this.attachedElement.removeEventListener('wheel', this.boundOnWheel);
    }
    window.removeEventListener('pointermove', this.boundOnPointerMove);
    window.removeEventListener('pointerup', this.boundOnPointerUp);
  }

  // Pointer drag orbit controls
  public onPointerDown(e: MouseEvent): void {
    if (e.button === 0 || e.button === 2) {
      this.isDragging = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    }
  }

  public onPointerMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.prevPointerX;
    const deltaY = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    // Orbit around targetLookAt
    const offset = new THREE.Vector3().subVectors(this.targetPos, this.targetLookAt);
    this.spherical.setFromVector3(offset);
    this.spherical.theta -= deltaX * 0.005;
    this.spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.spherical.phi - deltaY * 0.005));

    offset.setFromSpherical(this.spherical);
    this.targetPos.copy(this.targetLookAt).add(offset);
  }

  public onPointerUp(): void {
    this.isDragging = false;
  }

  public onWheel(e: WheelEvent): void {
    const zoomDelta = e.deltaY * 0.0025;
    const offset = new THREE.Vector3().subVectors(this.targetPos, this.targetLookAt);
    const len = offset.length();
    const newLen = Math.max(0.8, Math.min(22, len + zoomDelta));
    offset.setLength(newLen);
    this.targetPos.copy(this.targetLookAt).add(offset);
  }
}
