/**
 * OMEGA ULTRA REALITY V1.1 — Server Rack 42U Asset
 * Authentic EIA-310 19-inch rack enclosure with RU markings, rails, and exhaust fans.
 */

import * as THREE from 'three';

export interface RackAssetResult {
  group: THREE.Group;
  fanBlades: THREE.Mesh[];
  ruToY: (ru: number, heightU: number) => number;
}

export function createRackAsset(): RackAssetResult {
  const group = new THREE.Group();
  group.position.set(-3.5, 0, 0);

  const fanBlades: THREE.Mesh[] = [];

  // PBR Materials
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x11141a,
    metalness: 0.85,
    roughness: 0.45,
  });

  const railMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.9,
    roughness: 0.35,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.28,
  });

  // 4 Corner Vertical Posts (42U steel uprights)
  const postGeo = new THREE.BoxGeometry(0.06, 3.8, 0.06);
  const postPositions = [
    [-0.45, 1.9, -0.55],
    [0.45, 1.9, -0.55],
    [-0.45, 1.9, 0.55],
    [0.45, 1.9, 0.55],
  ];
  postPositions.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(postGeo, frameMat);
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);
  });

  // Top Roof & Exhaust Grille
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 1.16), frameMat);
  roof.position.set(0, 3.84, 0);
  group.add(roof);

  // Base Plinth
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.1, 1.16), frameMat);
  base.position.set(0, 0.05, 0);
  group.add(base);

  // Side Perforated Steel Panels
  const sideGeo = new THREE.BoxGeometry(0.02, 3.6, 1.1);
  const leftSide = new THREE.Mesh(sideGeo, frameMat);
  leftSide.position.set(-0.46, 1.9, 0);
  group.add(leftSide);

  const rightSide = new THREE.Mesh(sideGeo, frameMat);
  rightSide.position.set(0.46, 1.9, 0);
  group.add(rightSide);

  // Front Tempered Glass Door
  const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(0.92, 3.65, 0.02), glassMat);
  frontDoor.position.set(0, 1.9, 0.58);
  group.add(frontDoor);

  // Front Vertical 19" Mounting Rails with RU scale markers
  const railGeo = new THREE.BoxGeometry(0.04, 3.6, 0.04);
  const leftRailFront = new THREE.Mesh(railGeo, railMat);
  leftRailFront.position.set(-0.32, 1.9, 0.48);
  group.add(leftRailFront);

  const rightRailFront = new THREE.Mesh(railGeo, railMat);
  rightRailFront.position.set(0.32, 1.9, 0.48);
  group.add(rightRailFront);

  // Rear Vertical Mounting Rails
  const leftRailRear = new THREE.Mesh(railGeo, railMat);
  leftRailRear.position.set(-0.32, 1.9, -0.48);
  group.add(leftRailRear);

  const rightRailRear = new THREE.Mesh(railGeo, railMat);
  rightRailRear.position.set(0.32, 1.9, -0.48);
  group.add(rightRailRear);

  // Top Exhaust Fans
  for (let f = -1; f <= 1; f += 2) {
    const fanHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), frameMat);
    fanHousing.position.set(f * 0.22, 3.88, 0);
    group.add(fanHousing);

    const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 0.03), railMat);
    fanBlade.position.copy(fanHousing.position);
    fanBlades.push(fanBlade);
    group.add(fanBlade);
  }

  // RU to Y Calculation helper (1U = 0.075m, RU 1 at bottom offset 0.25m)
  const ruToY = (ru: number, heightU: number): number => {
    const ruHeight = 0.075;
    const baseOffset = 0.25;
    return baseOffset + (ru - 1) * ruHeight + (heightU * ruHeight) / 2;
  };

  return {
    group,
    fanBlades,
    ruToY,
  };
}
