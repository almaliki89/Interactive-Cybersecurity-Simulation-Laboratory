/**
 * OMEGA ULTRA REALITY V1.1 — Link State & Activity LED Visualizer
 * Real-time hardware telemetry illumination and pulse synchronization.
 */

import * as THREE from 'three';
import { DigitalTwinDevice } from '../../../../engine/reality/digitalTwinTypes';

export interface LedRegistration {
  mesh: THREE.Mesh;
  type: 'power' | 'activity' | 'network' | 'storage';
}

export class LinkStateVisualizer {
  private ledMaterials = {
    green: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.2,
      roughness: 0.3,
    }),
    amber: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.3,
    }),
    red: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.9,
      roughness: 0.3,
    }),
    off: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x000000,
      roughness: 0.9,
    }),
  };

  public updateLeds(
    ledRegistry: Map<string, LedRegistration[]>,
    devices: Record<string, DigitalTwinDevice>,
    elapsed: number
  ): void {
    ledRegistry.forEach((leds, deviceId) => {
      const dev = devices[deviceId];
      const isOnline = dev ? dev.powerStatus === 'ONLINE' : true;

      leds.forEach(({ mesh, type }) => {
        if (!isOnline) {
          mesh.material = this.ledMaterials.off;
          return;
        }

        if (type === 'power') {
          mesh.material = this.ledMaterials.green;
        } else if (type === 'storage') {
          // Rapid authentic SAS/SATA seek blinks
          const blink = Math.sin(elapsed * 26 + deviceId.charCodeAt(0) * 1.5) > 0.25;
          mesh.material = blink ? this.ledMaterials.amber : this.ledMaterials.off;
        } else if (type === 'network') {
          // Asynchronous packet traffic pulse
          const pulse = Math.sin(elapsed * 16 + mesh.id * 0.7) > 0.1;
          mesh.material = pulse ? this.ledMaterials.green : this.ledMaterials.off;
        } else if (type === 'activity') {
          const pulse = Math.sin(elapsed * 8 + deviceId.charCodeAt(deviceId.length - 1)) > 0;
          mesh.material = pulse ? this.ledMaterials.amber : this.ledMaterials.green;
        }
      });
    });
  }
}
