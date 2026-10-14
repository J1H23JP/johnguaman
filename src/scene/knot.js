import * as THREE from 'three';
import { COLORS, createCrystalMaterial } from './crystal.js';
import { CONTACT_CENTER } from './director.js';

// Nudo final de la pagina: el mismo material que el cristal, pero sin defectos.
export function createKnot() {
  const group = new THREE.Group();
  group.position.copy(CONTACT_CENTER);

  const material = createCrystalMaterial({ defects: false, amp: 0.07 });
  const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(2.2, 0.66, 260, 40, 2, 3), material);
  group.add(mesh);

  const wire = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2.2, 0.66, 120, 12, 2, 3),
    new THREE.MeshBasicMaterial({
      color: COLORS.probe,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  wire.scale.setScalar(1.04);
  group.add(wire);

  const rings = [4.6, 5.6].map((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({
        color: i ? COLORS.violet : COLORS.bone,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    ring.rotation.x = 1.1 + i * 0.7;
    ring.rotation.y = i * 0.9;
    group.add(ring);
    return ring;
  });

  return {
    group,
    pulse(v) {
      material.uniforms.uPulse.value = v;
    },
    update(t, dt, pointer, reduced) {
      const spin = reduced ? 0 : 1;
      material.uniforms.uTime.value = t;
      mesh.rotation.y = t * 0.18 * spin + pointer.x * 0.5;
      mesh.rotation.x = t * 0.1 * spin + pointer.y * 0.3;
      wire.rotation.copy(mesh.rotation);
      rings.forEach((r, i) => {
        r.rotation.z = t * (0.1 + i * 0.06) * spin;
      });
    },
  };
}
