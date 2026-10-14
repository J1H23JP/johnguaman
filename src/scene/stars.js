import * as THREE from 'three';
import { COLORS } from './crystal.js';

const VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform float uPixel;
uniform vec3 uPointer;
attribute float aSeed;
attribute float aSize;
varying float vSeed;
varying float vFade;
void main() {
  vec3 p = position;
  // La onda de "build verde" empuja las particulas desde el origen.
  p += normalize(p + 0.001) * uPulse * (2.0 + aSeed * 6.0);
  // Deriva suave.
  p.y += sin(uTime * 0.2 + aSeed * 40.0) * 0.25;
  p.x += cos(uTime * 0.15 + aSeed * 31.0) * 0.25;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Repulsion cerca del puntero (en espacio de vista).
  vec2 d = mv.xy - uPointer.xy * -mv.z * 0.55;
  float push = smoothstep(2.4, 0.0, length(d)) * uPointer.z;
  mv.xy += normalize(d + 0.0001) * push * 0.9;

  float dist = -mv.z;
  vFade = smoothstep(0.0, 6.0, dist) * (1.0 - smoothstep(60.0, 120.0, dist));
  vSeed = aSeed;
  gl_PointSize = aSize * uPixel * (24.0 / max(dist, 0.5));
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uBone;
uniform vec3 uProbe;
uniform vec3 uViolet;
uniform vec3 uDefect;
varying float vSeed;
varying float vFade;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float core = smoothstep(0.5, 0.0, r);
  float twinkle = 0.65 + 0.35 * sin(uTime * (1.0 + vSeed * 3.0) + vSeed * 90.0);
  vec3 col = uBone;
  if (vSeed > 0.62) col = mix(uBone, uProbe, 0.8);
  if (vSeed > 0.84) col = mix(uBone, uViolet, 0.85);
  if (vSeed > 0.985) col = uDefect;
  gl_FragColor = vec4(col * 1.4, core * core * twinkle * vFade);
}`;

export function createStars(count = 5500) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Tubo largo a lo largo de -z: el viaje de la camara atraviesa todo.
    const z = 30 - Math.pow(Math.random(), 0.9) * 190;
    const rad = 6 + Math.pow(Math.random(), 0.7) * 70;
    const a = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * rad;
    positions[i * 3 + 1] = Math.sin(a) * rad * 0.7;
    positions[i * 3 + 2] = z;
    seeds[i] = Math.random();
    sizes[i] = 0.5 + Math.pow(Math.random(), 3) * 2.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uPixel: { value: 1 },
      uPointer: { value: new THREE.Vector3() },
      uBone: { value: COLORS.bone },
      uProbe: { value: COLORS.probe },
      uViolet: { value: COLORS.violet },
      uDefect: { value: COLORS.defect },
    },
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  let pulse = 0;
  return {
    points,
    setPixelRatio(pr) {
      material.uniforms.uPixel.value = pr;
    },
    burst() {
      pulse = 1;
    },
    update(t, dt, pointer, reduced) {
      pulse = Math.max(0, pulse - dt * 0.7);
      material.uniforms.uTime.value = reduced ? 0 : t;
      material.uniforms.uPulse.value = Math.sin(Math.min(pulse, 1) * Math.PI) * 0.6;
      material.uniforms.uPointer.value.set(pointer.x, pointer.y, reduced ? 0 : 1);
    },
  };
}
