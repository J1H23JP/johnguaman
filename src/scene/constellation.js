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

    const years = THREE.MathUtils.clamp(skill.years || 1, 1, 3);
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2 + years * 0.065, 0),
      new THREE.MeshBasicMaterial({ color })
    );
    holder.add(gem);

    // Un anillo con su satelite por cada anio de experiencia.
    const orbits = [];
    for (let y = 0; y < years; y++) {
      const r = 0.58 + y * 0.3;
      const pivot = new THREE.Group();
      pivot.rotation.set(0.5 + y * 0.9, y * 1.3, y * 0.6);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.012, 64),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      pivot.add(ring, sat);
      holder.add(pivot);
      orbits.push({ pivot, ring, sat, r, speed: 0.9 - y * 0.25, a: Math.random() * 6.28 });
    }

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
    nodes.push({ holder, gem, halo, label, orbits, years, hover: 0, dim: 0, phase: Math.random() * 6.28 });
  });

  // Lineas entre vecinos cercanos.
  const linePts = [];
  const seen = new Set();
  const links = positions.map(() => []);
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
        links[i].push(j);
        links[j].push(i);
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

  // Aristas del nodo en foco, mas brillantes y con su color.
  const maxLinks = Math.max(...links.map((l) => l.length), 1);
  const hiGeo = new THREE.BufferGeometry();
  hiGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLinks * 6), 3));
  hiGeo.setDrawRange(0, 0);
  const hiLines = new THREE.LineSegments(
    hiGeo,
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  hiLines.frustumCulled = false;
  group.add(hiLines);
  let lastHover = -2;

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

      if (hoverIndex !== lastHover) {
        lastHover = hoverIndex;
        if (hoverIndex >= 0) {
          const arr = hiGeo.attributes.position.array;
          const from = positions[hoverIndex];
          links[hoverIndex].forEach((j, n) => {
            from.toArray(arr, n * 6);
            positions[j].toArray(arr, n * 6 + 3);
          });
          hiGeo.attributes.position.needsUpdate = true;
          hiGeo.setDrawRange(0, links[hoverIndex].length * 2);
          hiLines.material.color.copy(nodes[hoverIndex].gem.material.color);
        } else {
          hiGeo.setDrawRange(0, 0);
        }
      }
      lines.material.opacity += ((hoverIndex >= 0 ? 0.08 : 0.22) - lines.material.opacity) * k;

      nodes.forEach((nd, i) => {
        nd.hover += ((i === hoverIndex ? 1 : 0) - nd.hover) * k;
        nd.dim += ((hoverIndex >= 0 && i !== hoverIndex ? 1 : 0) - nd.dim) * k;
        const linked = hoverIndex >= 0 && links[hoverIndex].includes(i);
        const fade = 1 - nd.dim * (linked ? 0.2 : 0.6);
        nd.gem.material.opacity = fade;
        nd.gem.material.transparent = true;
        nd.halo.material.opacity = fade;
        nd.orbits.forEach((o) => {
          o.a += dt * o.speed * (1 + nd.hover * 3) * spin;
          o.sat.position.set(Math.cos(o.a) * o.r, Math.sin(o.a) * o.r, 0);
          o.ring.material.opacity = (0.28 + nd.hover * 0.6) * fade;
          o.sat.scale.setScalar(1 + nd.hover * 0.8);
        });
        const pulse = 1 + (reduced ? 0 : Math.sin(t * 1.6 + nd.phase) * 0.06);
        nd.gem.scale.setScalar((1 + nd.hover * 0.9) * pulse);
        nd.gem.rotation.y = t * 0.6 + nd.phase;
        nd.gem.rotation.x = t * 0.35;
        nd.halo.scale.setScalar(2.2 + nd.hover * 2.4);

        // Las etiquetas del lado trasero se atenuan.
        nd.holder.getWorldPosition(tmp);
        const depth = (tmp.distanceTo(camPos) - (centerDist - RADIUS)) / (RADIUS * 2);
        const front = 1 - THREE.MathUtils.clamp(depth, 0, 1);
        nd.label.material.opacity = (0.25 + front * 0.75 + nd.hover) * (1 - nd.dim * (linked ? 0.1 : 0.55));
      });
    },
  };
}
