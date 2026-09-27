/**
 * OMEGA ULTRA REALITY V1.1 — Photorealistic Enterprise Digital Twin Canvas
 * High-performance Three.js WebGL viewport orchestrating DigitalTwinScene,
 * physical cable networks, authentic hardware assets, and synchronized RealityEngine state.
 */

import React, { useEffect, useRef } from 'react';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';
import { DigitalTwinScene } from './scene/DigitalTwinScene';

export const DigitalTwinCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<DigitalTwinScene | null>(null);

  const selectedDeviceId = useDigitalTwinStore((s) => s.selectedDeviceId);
  const cameraMode = useDigitalTwinStore((s) => s.cameraMode);
  const selectedRoomId = useDigitalTwinStore((s) => s.selectedRoomId);
  const cables = useDigitalTwinStore((s) => s.cables);

  // Initialize scene on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new DigitalTwinScene(containerRef.current);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Synchronize camera view mode changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateView(cameraMode, selectedRoomId, selectedDeviceId);
    }
  }, [cameraMode, selectedRoomId, selectedDeviceId]);

  // Synchronize cable network topology updates (plug/unplug)
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateCables();
    }
  }, [cables]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-crosshair select-none bg-slate-950 overflow-hidden"
      data-testid="digital-twin-3d-view"
    />
  );
};
