import * as THREE from 'three';

export const CONSTELLATION_CENTER = new THREE.Vector3(0, 0, -92);
const RADIUS = 7;

const GROUP_COLORS = {
  code: new THREE.Color('#4df3e0'),
  cloud: new THREE.Color('#ff3d8b'),
  ai: new THREE.Color('#8e7cff'),
};

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function labelTexture(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 112;
  const g = c.getContext('2d');
  g.font = '600 54px "Instrument Sans Variable", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(7,11,31,0.9)';
  g.shadowBlur = 14;
  g.fillStyle = '#e8ecff';
  g.fillText(text, 256, 56);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: c.width / c.height };
}

export function createConstellation(skills) {
  const group = new THREE.Group();
  group.position.copy(CONSTELLATION_CENTER);
  const n = skills.length;
  const glow = glowTexture();

  const nodes = [];
  const hitMeshes = [];
  const positions = [];

  skills.forEach((skill, i) => {
    // Esfera de Fibonacci: reparto uniforme sin polos marcados.
    const k = (i + 0.5) / n;
    const phi = Math.acos(1 - 2 * k);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const pos = new THREE.Vector3(
      Math.cos(theta) * Math.sin(phi),
      Math.cos(phi) * 0.9,
      Math.sin(theta) * Math.sin(phi)
    ).multiplyScalar(RADIUS);
    positions.push(pos);

    const color = GROUP_COLORS[skill.group] || GROUP_COLORS.code;
    const holder = new THREE.Group();
    holder.position.copy(pos);

    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.3, 0),
      new THREE.MeshBasicMaterial({ color })
    );
    holder.add(gem);

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.scale.setScalar(2.2);
    holder.add(halo);

    const { tex, aspect } = labelTexture(skill.name);
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false })
    );
    label.scale.set(0.62 * aspect * 1.4, 0.62 * 1.4, 1);
    label.position.set(0, -0.78, 0);
    label.renderOrder = 5;
    holder.add(label);

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 8, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.userData.index = i;
    holder.add(hit);
    hitMeshes.push(hit);

    group.add(holder);
    nodes.push({ holder, gem, halo, label, hover: 0, phase: Math.random() * 6.28 });
  });

  // Lineas entre vecinos cercanos.
  const linePts = [];
  const seen = new Set();
  positions.forEach((p, i) => {
    positions
      .map((q, j) => ({ j, d: p.distanceTo(q) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        linePts.push(p, positions[j]);
      });
  });
  const lines = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(linePts),
    new THREE.LineBasicMaterial({
      color: 0x8e7cff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(lines);

  // Anillos orbitales de fondo.
  [8.2, 9.6].forEach((r, idx) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r, r + 0.015, 128),
      new THREE.MeshBasicMaterial({
        color: 0xe8ecff,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.rotation.x = Math.PI / 2 + (idx ? 0.5 : -0.35);
    ring.rotation.y = idx ? 0.3 : -0.2;
    group.add(ring);
  });

  const camPos = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let rotY = 0;
  let rotX = 0;

  return {
    group,
    hitMeshes,
    pick(raycaster) {
      const hit = raycaster.intersectObjects(hitMeshes, false)[0];
      return hit ? hit.object.userData.index : -1;
    },
    update(t, dt, pointer, hoverIndex, camera, reduced) {
      const spin = reduced ? 0 : 1;
      rotY += dt * 0.07 * spin;
      const tx = pointer.y * 0.25;
      rotX += (tx - rotX) * (1 - Math.exp(-dt * 2));
      group.rotation.y = rotY + pointer.x * 0.35;
      group.rotation.x = rotX;

      camera.getWorldPosition(camPos);
      const centerDist = camPos.distanceTo(group.position);
      const k = 1 - Math.exp(-dt * 9);

      nodes.forEach((nd, i) => {
        nd.hover += ((i === hoverIndex ? 1 : 0) - nd.hover) * k;
        const pulse = 1 + (reduced ? 0 : Math.sin(t * 1.6 + nd.phase) * 0.06);
        nd.gem.scale.setScalar((1 + nd.hover * 0.9) * pulse);
        nd.gem.rotation.y = t * 0.6 + nd.phase;
        nd.gem.rotation.x = t * 0.35;
        nd.halo.scale.setScalar(2.2 + nd.hover * 2.4);

        // Las etiquetas del lado trasero se atenuan.
        nd.holder.getWorldPosition(tmp);
        const depth = (tmp.distanceTo(camPos) - (centerDist - RADIUS)) / (RADIUS * 2);
        const front = 1 - THREE.MathUtils.clamp(depth, 0, 1);
        nd.label.material.opacity = 0.25 + front * 0.75 + nd.hover;
      });
    },
  };
}
