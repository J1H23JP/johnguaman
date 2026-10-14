import * as THREE from 'three';
import { COLORS, NOISE_GLSL } from './crystal.js';

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uInk;
uniform vec3 uViolet;
uniform vec3 uProbe;
uniform vec3 uDefect;
uniform float uMix;
varying vec3 vDir;
${NOISE_GLSL}
void main() {
  vec3 d = normalize(vDir);
  float n1 = snoise(d * 1.6 + vec3(0.0, uTime * 0.01, 0.0)) * 0.5 + 0.5;
  float n2 = snoise(d * 3.2 - vec3(uTime * 0.015, 0.0, 3.0)) * 0.5 + 0.5;
  float cloud = smoothstep(0.45, 0.95, n1 * 0.7 + n2 * 0.5);
  vec3 tint = mix(uViolet, uProbe, uMix);
  vec3 col = uInk;
  col += tint * cloud * 0.1;
  col += uDefect * smoothstep(0.7, 1.0, n2) * 0.05;
  // Gradiente vertical: algo mas claro abajo, como un horizonte.
  col += tint * smoothstep(0.1, -0.9, d.y) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}`;

export function createBackdrop() {
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uMix: { value: 0 },
      uInk: { value: COLORS.ink },
      uViolet: { value: COLORS.violet },
      uProbe: { value: COLORS.probe },
      uDefect: { value: COLORS.defect },
    },
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 20), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return {
    mesh,
    update(t, camera, mix) {
      mesh.position.copy(camera.position);
      material.uniforms.uTime.value = t;
      material.uniforms.uMix.value = mix;
    },
  };
}
