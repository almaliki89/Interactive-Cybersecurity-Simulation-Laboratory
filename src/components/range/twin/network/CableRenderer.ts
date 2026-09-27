/**
 * OMEGA ULTRA REALITY V1.1 — First-Class Physical Cable Simulation & 3D Renderer
 * Realistic catenary bezier curves, strain relief boots, and disconnect droop physics.
 */

import * as THREE from 'three';
import { CableState, CableColor } from '../../../../engine/reality/digitalTwinTypes';

const CABLE_COLOR_MAP: Record<CableColor, number> = {
  blue: 0x2563eb,
  yellow: 0xeab308,
  aqua: 0x06b6d4,
  red: 0xef4444,
  purple: 0xa855f7,
  gray: 0x64748b,
};

export interface CableRenderItem {
  cable: CableState;
  mesh: THREE.Mesh;
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
}

export class CableRenderer {
  public group: THREE.Group = new THREE.Group();
  public interactiveCables: THREE.Object3D[] = [];
  private cableMeshes: Map<string, THREE.Mesh> = new Map();

  constructor() {
    this.group.name = 'PhysicalCableNetwork';
  }

  public renderCables(
    cables: Record<string, CableState>,
    anchorPositions: Map<string, THREE.Vector3>
  ): void {
    // Clear previous
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
    this.interactiveCables = [];
    this.cableMeshes.clear();

    Object.values(cables).forEach((cable) => {
      const start = anchorPositions.get(cable.sourcePort) || anchorPositions.get(cable.sourceDeviceId);
      const end = anchorPositions.get(cable.targetPort) || anchorPositions.get(cable.targetDeviceId);

      if (!start || !end) return;

      const hexColor = CABLE_COLOR_MAP[cable.colorLabel] || 0x2563eb;
      const isConnected = cable.status === 'CONNECTED';

      // Material with PBR sheen
      const cableMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.45,
        metalness: 0.25,
      });

      // Curve generation with catenary sag
      const curvePoints: THREE.Vector3[] = [];
      const p0 = start.clone();
      const p3 = end.clone();

      if (isConnected) {
        // Natural draped bezier curve with forward projection from ports
        const forwardOffset = 0.12;
        const p1 = p0.clone().add(new THREE.Vector3(0, -0.04, forwardOffset));
        const p2 = p3.clone().add(new THREE.Vector3(0, -0.04, forwardOffset));

        // Droop midpoint
        const midPoint = new THREE.Vector3()
          .addVectors(p0, p3)
          .multiplyScalar(0.5);
        const dist = p0.distanceTo(p3);
        const sagAmount = Math.min(0.18, 0.04 + dist * 0.08);
        midPoint.y -= sagAmount;
        midPoint.z += forwardOffset * 0.8;

        const curve = new THREE.CatmullRomCurve3([p0, p1, midPoint, p2, p3]);
        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.0045, 8, false);
        const mesh = new THREE.Mesh(tubeGeo, cableMat);
        mesh.castShadow = true;
        mesh.userData = { isCable: true, cableId: cable.id };
        this.group.add(mesh);
        this.interactiveCables.push(mesh);
        this.cableMeshes.set(cable.id, mesh);

        // Strain relief boots at both ends
        this.addBoot(p0, hexColor);
        this.addBoot(p3, hexColor);
      } else {
        // Disconnected: Target end drapes downward limply
        const p1 = p0.clone().add(new THREE.Vector3(0, -0.06, 0.08));
        const p2 = p0.clone().add(new THREE.Vector3(0, -0.35, 0.05));
        const pDown = p0.clone().add(new THREE.Vector3(0, -0.65, 0.02));

        const curve = new THREE.CatmullRomCurve3([p0, p1, p2, pDown]);
        const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.0045, 8, false);
        const mesh = new THREE.Mesh(tubeGeo, cableMat);
        mesh.castShadow = true;
        mesh.userData = { isCable: true, cableId: cable.id };
        this.group.add(mesh);
        this.interactiveCables.push(mesh);
        this.cableMeshes.set(cable.id, mesh);

        this.addBoot(p0, hexColor);
      }
    });
  }

  private addBoot(position: THREE.Vector3, color: number): void {
    const bootGeo = new THREE.CylinderGeometry(0.007, 0.005, 0.02, 8);
    const bootMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.1,
    });
    const boot = new THREE.Mesh(bootGeo, bootMat);
    boot.rotation.x = Math.PI / 2;
    boot.position.copy(position).add(new THREE.Vector3(0, 0, 0.01));
    this.group.add(boot);
  }

  public updateCablePulse(elapsed: number, activeCables: string[]): void {
    this.cableMeshes.forEach((mesh, cableId) => {
      const isActive = activeCables.includes(cableId);
      if (isActive && mesh.material instanceof THREE.MeshStandardMaterial) {
        // Subtle photon pulse along active cables
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 10);
        mesh.material.emissive.set(mesh.material.color);
        mesh.material.emissiveIntensity = 0.25 * pulse;
      } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.emissiveIntensity = 0;
      }
    });
  }
}
