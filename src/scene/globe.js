import * as THREE from 'three';
import { COLORS } from './crystal.js';
import { CONTACT_CENTER } from './director.js';
import { MASK_W, MASK_H, LAND_MASK_B64 } from '../data/landmask.js';

export const GLOBE_R = 3;

// Quito, Ecuador (sobre la linea del ecuador).
export const QUITO = { lat: -0.1807, lon: -78.4678 };

// Ciudades desde las que "llegan" paquetes de datos a Quito.
const CITIES = [
  { lat: 40.42, lon: -3.7 }, // Madrid
  { lat: 40.71, lon: -74.0 }, // Nueva York
  { lat: -23.55, lon: -46.63 }, // Sao Paulo
  { lat: 51.5, lon: -0.12 }, // Londres
  { lat: 19.43, lon: -99.13 }, // Ciudad de Mexico
  { lat: 35.68, lon: 139.69 }, // Tokio
  { lat: -33.87, lon: 151.21 }, // Sidney
  { lat: -26.2, lon: 28.04 }, // Johannesburgo
  { lat: 19.08, lon: 72.88 }, // Bombay
  { lat: 34.05, lon: -118.24 }, // Los Angeles
  { lat: -33.45, lon: -70.67 }, // Santiago
];

const rad = (d) => (d * Math.PI) / 180;

// Convencion: lon 0 mira a +z, lon 90 este mira a +x, el norte es +y.
export function latLonToVec3(lat, lon, r = 1, out = new THREE.Vector3()) {
  const phi = rad(lat);
  const lam = rad(lon);
  return out.set(Math.cos(phi) * Math.sin(lam), Math.sin(phi), Math.cos(phi) * Math.cos(lam)).multiplyScalar(r);
}

// ---------------------------------------------------------------- Tierra firme

const maskBytes = Uint8Array.from(atob(LAND_MASK_B64), (c) => c.charCodeAt(0));
function isLand(lat, lon) {
  const r = Math.min(MASK_H - 1, Math.max(0, Math.floor(90 - lat)));
  const c = Math.min(MASK_W - 1, Math.max(0, Math.floor(lon + 180)));
  const i = r * MASK_W + c;
  return (maskBytes[i >> 3] >> (i & 7)) & 1;
}

function landPositions() {
  const N = 26000;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const lat = (Math.asin(y) * 180) / Math.PI;
    let lon = (((i * golden) * 180) / Math.PI) % 360;
    if (lon > 180) lon -= 360;
    if (!isLand(lat, lon)) continue;
    latLonToVec3(lat, lon, GLOBE_R * 1.003, v);
    out.push(v.x, v.y, v.z);
  }
  return new Float32Array(out);
}

// ---------------------------------------------------------------- Puntos

const DOT_VERT = /* glsl */ `
uniform float uSize;
uniform float uScale;
uniform float uTime;
uniform float uTwinkle;
attribute float aSeed;
attribute float aScale;
attribute float aGlow;
varying float vGlow;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = max(uSize * aScale * uScale / max(-mv.z, 0.1), 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.55 + 0.45 * sin(uTime * 1.4 + aSeed * 60.0);
  vGlow = aGlow * mix(1.0, tw, uTwinkle);
}`;

const DOT_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uSoft;
varying float vGlow;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, uSoft, r);
  gl_FragColor = vec4(uColor * vGlow, a * uOpacity);
}`;

function makeDots(positions, { color, size, soft = 0, opacity = 1, twinkle = 0 }) {
  const n = positions.length / 3;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(Float32Array.from({ length: n }, Math.random), 1));
  geo.setAttribute('aScale', new THREE.BufferAttribute(new Float32Array(n).fill(1), 1));
  geo.setAttribute('aGlow', new THREE.BufferAttribute(new Float32Array(n).fill(1), 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: DOT_VERT,
    fragmentShader: DOT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: { value: size },
      uScale: { value: 800 },
      uTime: { value: 0 },
      uTwinkle: { value: twinkle },
      uColor: { value: color.clone() },
      uOpacity: { value: opacity },
      uSoft: { value: soft },
    },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return { points, geo, mat };
}

// ---------------------------------------------------------------- Esfera y atmosfera

const BODY_VERT = /* glsl */ `
varying vec3 vPos;
varying vec3 vN;
varying vec3 vView;
void main() {
  vPos = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

const BODY_FRAG = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uViolet;
uniform vec3 uProbe;
varying vec3 vPos;
varying vec3 vN;
varying vec3 vView;
void main() {
  float lat = asin(clamp(vPos.y, -1.0, 1.0));
  float lon = atan(vPos.x, vPos.z);
  vec2 g = vec2(lat, lon) * 3.8197; // linea cada 15 grados
  vec2 w = max(fwidth(g), vec2(0.0001));
  vec2 d = abs(fract(g - 0.5) - 0.5) / w;
  float line = 1.0 - min(min(d.x, d.y), 1.0);
  line *= pow(max(cos(lat), 0.0), 0.5);

  float f = pow(1.0 - max(dot(normalize(vN), normalize(vView)), 0.0), 2.4);
  vec3 col = uDeep + uViolet * f * 0.85 + uProbe * f * f * 0.45 + uViolet * line * 0.16;
  gl_FragColor = vec4(col, 1.0);
}`;

const ATMO_VERT = /* glsl */ `
varying vec3 vN;
void main() {
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor;
varying vec3 vN;
void main() {
  float i = pow(max(0.64 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.2);
  gl_FragColor = vec4(uColor * i * 0.75, i * 0.55);
}`;

// ---------------------------------------------------------------- Arcos

const ARC_SEG = 72;

function buildArc(a, b) {
  const omega = a.angleTo(b);
  const s = Math.sin(omega);
  const bump = 0.06 + 0.34 * (omega / Math.PI);
  const pts = [];
  for (let i = 0; i <= ARC_SEG; i++) {
    const t = i / ARC_SEG;
    const p = a
      .clone()
      .multiplyScalar(Math.sin((1 - t) * omega) / s)
      .add(b.clone().multiplyScalar(Math.sin(t * omega) / s))
      .normalize()
      .multiplyScalar(GLOBE_R * (1.004 + bump * Math.sin(Math.PI * t)));
    pts.push(p);
  }
  return pts;
}

const ARC_VERT = /* glsl */ `
attribute float aT;
attribute float aOff;
attribute float aSpeed;
varying float vT;
varying float vOff;
varying float vSpeed;
void main() {
  vT = aT;
  vOff = aOff;
  vSpeed = aSpeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ARC_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uCyan;
uniform vec3 uViolet;
varying float vT;
varying float vOff;
varying float vSpeed;
void main() {
  float head = fract(uTime * vSpeed + vOff);
  float d = mod(head - vT, 1.0);
  float trail = pow(max(1.0 - d / 0.3, 0.0), 2.0);
  vec3 col = mix(uViolet, uCyan, trail);
  gl_FragColor = vec4(col * (0.7 + trail * 0.9), 0.14 + trail * 0.86);
}`;

function labelSprite(text) {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 120;
  const g = c.getContext('2d');
  g.font = '600 56px "Instrument Sans Variable", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(7,11,31,0.95)';
  g.shadowBlur = 16;
  g.fillStyle = '#e8ecff';
  g.fillText(text, 320, 60);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(1.9, 0.356, 1);
  return sprite;
}

const smooth = (x) => x * x * (3 - 2 * x);

// ---------------------------------------------------------------- Globo

export function createGlobe() {
  const group = new THREE.Group();
  group.position.copy(CONTACT_CENTER);

  // Todo lo que gira junto con la Tierra.
  const spin = new THREE.Group();
  group.add(spin);

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_R * 0.995, 72, 54),
    new THREE.ShaderMaterial({
      vertexShader: BODY_VERT,
      fragmentShader: BODY_FRAG,
      uniforms: {
        uDeep: { value: new THREE.Color('#080e2c') },
        uViolet: { value: COLORS.violet },
        uProbe: { value: COLORS.probe },
      },
    })
  );
  spin.add(body);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_R * 1.2, 48, 36),
    new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color('#5a6cff') } },
    })
  );
  group.add(atmo);

  const dotSets = [];
  const land = makeDots(landPositions(), { color: new THREE.Color('#4df3e0').multiplyScalar(0.85), size: 0.034, soft: 0.3, twinkle: 0.35, opacity: 0.95 });
  spin.add(land.points);
  dotSets.push(land);

  // Ciudades de origen.
  const quitoDir = latLonToVec3(QUITO.lat, QUITO.lon, 1);
  const quitoPos = quitoDir.clone().multiplyScalar(GLOBE_R * 1.004);
  const cityDirs = CITIES.map((c) => latLonToVec3(c.lat, c.lon, 1));
  const cityPos = new Float32Array(CITIES.length * 3);
  cityDirs.forEach((d, i) => d.clone().multiplyScalar(GLOBE_R * 1.005).toArray(cityPos, i * 3));
  const cities = makeDots(cityPos, { color: new THREE.Color('#e8ecff'), size: 0.075, soft: 0.1, opacity: 0.9 });
  spin.add(cities.points);
  dotSets.push(cities);

  // Baliza de Quito.
  const beacon = makeDots(new Float32Array(quitoPos.toArray()), { color: new THREE.Color('#ff3d8b').multiplyScalar(1.4), size: 0.2, soft: 0.0, opacity: 1 });
  spin.add(beacon.points);
  dotSets.push(beacon);

  const ringMat = () =>
    new THREE.MeshBasicMaterial({
      color: 0xff3d8b,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  const quitoQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), quitoDir);
  const ringIdle = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.125, 64), ringMat());
  const ringFlash = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.13, 64), ringMat());
  [ringIdle, ringFlash].forEach((r) => {
    r.position.copy(quitoPos).multiplyScalar(1.002);
    r.quaternion.copy(quitoQuat);
    spin.add(r);
  });
  ringFlash.material.color.set(0x4df3e0);

  const label = labelSprite('Quito, Ecuador');
  label.position.copy(quitoDir).multiplyScalar(GLOBE_R + 0.3).add(new THREE.Vector3(0, 0.62, 0));
  spin.add(label);

  // Arcos hacia Quito.
  const arcs = cityDirs.map((d, i) => ({
    pts: buildArc(d, quitoDir),
    off: (i * 0.137 + 0.05) % 1,
    speed: 0.1 + ((i * 37) % 11) * 0.011,
  }));
  const vertCount = arcs.length * ARC_SEG * 2;
  const aPos = new Float32Array(vertCount * 3);
  const aT = new Float32Array(vertCount);
  const aOff = new Float32Array(vertCount);
  const aSpeed = new Float32Array(vertCount);
  let w = 0;
  arcs.forEach((arc) => {
    for (let i = 0; i < ARC_SEG; i++) {
      [i, i + 1].forEach((k) => {
        arc.pts[k].toArray(aPos, w * 3);
        aT[w] = k / ARC_SEG;
        aOff[w] = arc.off;
        aSpeed[w] = arc.speed;
        w++;
      });
    }
  });
  const arcGeo = new THREE.BufferGeometry();
  arcGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
  arcGeo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
  arcGeo.setAttribute('aOff', new THREE.BufferAttribute(aOff, 1));
  arcGeo.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));
  const arcMat = new THREE.ShaderMaterial({
    vertexShader: ARC_VERT,
    fragmentShader: ARC_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uCyan: { value: COLORS.probe },
      uViolet: { value: COLORS.violet },
    },
  });
  const arcLines = new THREE.LineSegments(arcGeo, arcMat);
  arcLines.frustumCulled = false;
  spin.add(arcLines);

  // Cabezas de los paquetes que viajan por los arcos.
  const headPos = new Float32Array(arcs.length * 3);
  const heads = makeDots(headPos, { color: new THREE.Color('#4df3e0').multiplyScalar(1.6), size: 0.12, soft: 0.0, opacity: 1 });
  spin.add(heads.points);
  dotSets.push(heads);

  // Orbita decorativa con tres satelites.
  const orbit = new THREE.Group();
  orbit.rotation.set(1.15, 0, 0.38);
  const orbitR = GLOBE_R * 1.36;
  const orbitLine = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 160 }, (_, i) => {
        const a = (i / 160) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * orbitR, 0, Math.sin(a) * orbitR);
      })
    ),
    new THREE.LineBasicMaterial({ color: COLORS.violet, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  orbit.add(orbitLine);
  const sats = makeDots(new Float32Array(9), { color: new THREE.Color('#e8ecff').multiplyScalar(1.3), size: 0.09, soft: 0.0, opacity: 1 });
  orbit.add(sats.points);
  dotSets.push(sats);
  group.add(orbit);

  // Paquete "mensaje enviado": viaja desde el lado del formulario hasta Quito.
  const TRAIL = 18;
  const trail = makeDots(new Float32Array(TRAIL * 3), { color: new THREE.Color('#4df3e0').multiplyScalar(1.8), size: 0.2, soft: 0.0, opacity: 1 });
  trail.points.visible = false;
  group.add(trail.points);
  dotSets.push(trail);
  const flight = { active: false, t: 0, dur: 1.9, start: new THREE.Vector3(), ctrl: new THREE.Vector3() };
  let flash = -1;

  const qRoot = new THREE.Vector3();
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();

  const baseYaw = -rad(QUITO.lon); // deja a Ecuador mirando a la camara

  function bezier(t, out) {
    const k = 1 - t;
    return out
      .copy(flight.start)
      .multiplyScalar(k * k)
      .addScaledVector(flight.ctrl, 2 * k * t)
      .addScaledVector(qRoot, t * t);
  }

  return {
    group,
    send(camera, portrait) {
      if (flight.active) return;
      group.updateMatrixWorld(true);
      qRoot.copy(quitoPos).applyMatrix4(spin.matrix);
      const ndc = portrait ? new THREE.Vector3(-0.2, -1.0, 0.5) : new THREE.Vector3(-0.95, -0.4, 0.5);
      ndc.unproject(camera);
      const dir = ndc.sub(camera.position).normalize();
      const dist = camera.position.distanceTo(group.position);
      const startW = camera.position.clone().addScaledVector(dir, dist * 0.85);
      flight.start.copy(group.worldToLocal(startW));
      flight.ctrl.copy(flight.start).lerp(qRoot, 0.5);
      flight.ctrl.y += 2.4;
      flight.ctrl.z += 1.6;
      flight.t = 0;
      flight.active = true;
      trail.points.visible = true;
    },
    update(t, dt, pointer, camera, viewH, reduced) {
      const tt = reduced ? 0.5 : t;

      // Orientacion: Ecuador de frente, con una oscilacion lenta.
      const sway = reduced ? 0 : Math.sin(t * 0.17) * 0.28;
      spin.rotation.set(0.1 + pointer.y * 0.18, baseYaw + sway + pointer.x * 0.25, 0);
      spin.updateMatrix();

      const scale = viewH / (2 * Math.tan(rad(camera.fov) / 2));
      dotSets.forEach((d) => {
        d.mat.uniforms.uScale.value = scale;
        d.mat.uniforms.uTime.value = tt;
      });
      arcMat.uniforms.uTime.value = tt;

      // Cabezas de paquete.
      const hp = heads.geo.attributes.position;
      arcs.forEach((arc, i) => {
        const head = (tt * arc.speed + arc.off) % 1;
        const f = head * ARC_SEG;
        const i0 = Math.min(Math.floor(f), ARC_SEG - 1);
        tmpA.copy(arc.pts[i0]).lerp(arc.pts[i0 + 1], f - i0);
        hp.setXYZ(i, tmpA.x, tmpA.y, tmpA.z);
      });
      hp.needsUpdate = true;

      // Satelites.
      const sp = sats.geo.attributes.position;
      for (let i = 0; i < 3; i++) {
        const a = (reduced ? 0 : t * 0.22) + (i * Math.PI * 2) / 3;
        sp.setXYZ(i, Math.cos(a) * orbitR, 0, Math.sin(a) * orbitR);
      }
      sp.needsUpdate = true;

      // Pulso permanente de la baliza.
      const k = reduced ? 0.3 : (t * 0.42) % 1;
      ringIdle.scale.setScalar(1 + k * 5);
      ringIdle.material.opacity = (1 - k) * 0.75;

      // Paquete de "mensaje enviado".
      if (flight.active) {
        qRoot.copy(quitoPos).applyMatrix4(spin.matrix);
        flight.t += dt / flight.dur;
        const e = smooth(Math.min(flight.t, 1));
        const ga = trail.geo.attributes.aGlow;
        const sa = trail.geo.attributes.aScale;
        const pa = trail.geo.attributes.position;
        for (let i = 0; i < TRAIL; i++) {
          const ti = Math.max(0, e - i * 0.02);
          bezier(ti, tmpB);
          pa.setXYZ(i, tmpB.x, tmpB.y, tmpB.z);
          sa.setX(i, 1 - (i / TRAIL) * 0.75);
          ga.setX(i, 1 - i / TRAIL);
        }
        pa.needsUpdate = true;
        sa.needsUpdate = true;
        ga.needsUpdate = true;
        if (flight.t >= 1) {
          flight.active = false;
          trail.points.visible = false;
          flash = 0;
        }
      }
      if (flash >= 0) {
        flash += dt / 1.4;
        const e = Math.min(flash, 1);
        ringFlash.scale.setScalar(1 + e * 16);
        ringFlash.material.opacity = (1 - e) * 0.95;
        if (flash >= 1) {
          flash = -1;
          ringFlash.material.opacity = 0;
        }
      }
    },
  };
}
