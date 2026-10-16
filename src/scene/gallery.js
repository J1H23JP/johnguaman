import * as THREE from 'three';
import { t } from '../i18n.js';
import { COLORS } from './crystal.js';

export const GALLERY_CENTER = new THREE.Vector3(0, 0, -42);
export const GALLERY_RADIUS = 10;
export const GALLERY_SPAN = 0.62; // radianes entre laminas

export function cardAngle(i, n) {
  return (i - (n - 1) / 2) * GALLERY_SPAN;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCard(project, index, total) {
  const W = 1024;
  const H = 640;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const hue = project.hue * 360;
  const accent = `hsl(${hue} 85% 62%)`;
  const accentDim = `hsl(${hue} 70% 45%)`;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#15205a');
  bg.addColorStop(1, '#070b1f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Inicial gigante como marca de agua.
  ctx.font = '700 560px "Unbounded Variable", sans-serif';
  ctx.fillStyle = `hsla(${hue} 80% 60% / 0.09)`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(project.title[0], W - 520, H - 20);

  // Cuadricula tenue.
  ctx.strokeStyle = 'rgba(232,236,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Barra de acento.
  ctx.fillStyle = accent;
  ctx.fillRect(64, 72, 96, 8);

  // Titulo.
  ctx.fillStyle = '#e8ecff';
  ctx.font = '700 82px "Unbounded Variable", sans-serif';
  const titleLines = wrapText(ctx, project.title, W - 128);
  let y = 190;
  titleLines.slice(0, 2).forEach((l) => {
    ctx.fillText(l, 64, y);
    y += 92;
  });

  // Descripcion.
  ctx.font = '500 34px "Instrument Sans Variable", sans-serif';
  ctx.fillStyle = '#c6ccee';
  y += 14;
  wrapText(ctx, project.description, W - 160)
    .slice(0, 3)
    .forEach((l) => {
      ctx.fillText(l, 64, y);
      y += 46;
    });

  // Etiquetas de tecnologia.
  let x = 64;
  ctx.font = '600 28px "Instrument Sans Variable", sans-serif';
  project.stack.forEach((tag) => {
    const w = ctx.measureText(tag).width + 44;
    ctx.strokeStyle = accentDim;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, H - 120, w, 54, 27);
    ctx.stroke();
    ctx.fillStyle = '#e8ecff';
    ctx.fillText(tag, x + 22, H - 83);
    x += w + 14;
  });

  // Contador (aqui si es una secuencia real).
  ctx.font = '600 28px "Instrument Sans Variable", sans-serif';
  ctx.fillStyle = accent;
  ctx.textAlign = 'right';
  ctx.fillText(t.countOf(index + 1, total), W - 64, 100);
  ctx.textAlign = 'left';

  // Marco.
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(6, 6, W - 12, H - 12, 36);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  return tex;
}

const CARD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const CARD_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uAccent;
uniform float uHover;
uniform float uActive;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec4 tex = texture2D(uMap, vUv);
  float scan = 0.94 + 0.06 * sin(vUv.y * 420.0 + uTime * 2.0);
  vec3 col = tex.rgb * scan;
  float dim = mix(0.5, 1.0, uActive);
  col *= dim + uHover * 0.35;
  // Brillo de borde al pasar el cursor.
  vec2 e = min(vUv, 1.0 - vUv);
  float edge = smoothstep(0.03, 0.0, min(e.x * 1.6, e.y));
  col += uAccent * edge * (0.25 + uHover * 1.4 + uActive * 0.35);
  // Barrido de luz diagonal.
  float sweep = smoothstep(0.0, 0.08, 1.0 - abs(vUv.x + vUv.y * 0.4 - fract(uTime * 0.12 + uHover) * 2.4 + 0.2) * 6.0) * uActive;
  col += uAccent * sweep * 0.12;
  gl_FragColor = vec4(col, 0.97);
}`;

const FLOOR_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  float a = atan(p.y, p.x);
  float rings = smoothstep(0.012, 0.0, abs(fract(r * 14.0 - uTime * 0.05) - 0.5) - 0.48);
  float spokes = smoothstep(0.015, 0.0, abs(fract(a * 3.8197 + 0.5) - 0.5) - 0.485) * step(0.12, r);
  float fade = smoothstep(1.0, 0.1, r);
  float alpha = (rings + spokes * 0.7) * fade * 0.22;
  gl_FragColor = vec4(uColor, alpha);
}`;

export function createGallery(projects, onOpen) {
  const group = new THREE.Group();
  group.position.copy(GALLERY_CENTER);
  const n = projects.length;

  const cards = [];
  const meshes = [];

  projects.forEach((project, i) => {
    const θ = cardAngle(i, n);
    const accent = new THREE.Color().setHSL(project.hue, 0.85, 0.62);

    const geo = new THREE.PlaneGeometry(5.2, 3.25, 24, 1);
    const pos = geo.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v);
      pos.setZ(v, x * x * 0.035); // curvatura suave hacia el centro
    }
    geo.computeVertexNormals();

    const mat = new THREE.ShaderMaterial({
      vertexShader: CARD_VERT,
      fragmentShader: CARD_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uMap: { value: null },
        uAccent: { value: accent },
        uHover: { value: 0 },
        uActive: { value: 0 },
        uTime: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.index = i;

    const holder = new THREE.Group();
    const px = Math.sin(θ) * GALLERY_RADIUS;
    const pz = -Math.cos(θ) * GALLERY_RADIUS;
    holder.position.set(px, 0.2, pz);
    holder.rotation.y = -θ;
    holder.add(mesh);

    // Haz de luz hacia el suelo.
    const beam = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1.65, 0), new THREE.Vector3(0, -3.1, 0)]),
      new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      })
    );
    holder.add(beam);

    group.add(holder);
    cards.push({ holder, mesh, mat, hover: 0, active: 0, base: holder.position.clone(), θ });
    meshes.push(mesh);
  });

  // Suelo circular.
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(28, 96),
    new THREE.ShaderMaterial({
      vertexShader: CARD_VERT,
      fragmentShader: FLOOR_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uColor: { value: COLORS.probe }, uTime: { value: 0 } },
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.1;
  group.add(floor);

  let ready = false;
  const api = {
    group,
    meshes,
    // Las texturas se dibujan cuando las tipografias ya estan cargadas.
    async init() {
      await Promise.all([
        document.fonts.load('700 82px "Unbounded Variable"'),
        document.fonts.load('500 34px "Instrument Sans Variable"'),
        document.fonts.load('600 28px "Instrument Sans Variable"'),
      ]).catch(() => {});
      projects.forEach((p, i) => {
        cards[i].mat.uniforms.uMap.value = drawCard(p, i, n);
      });
      ready = true;
    },
    pick(raycaster) {
      if (!ready) return -1;
      const hit = raycaster.intersectObjects(meshes, false)[0];
      return hit ? hit.object.userData.index : -1;
    },
    open(i) {
      onOpen?.(projects[i], i);
    },
    update(t, dt, activeIndex, hoverIndex, reduced) {
      const k = 1 - Math.exp(-dt * 8);
      cards.forEach((c, i) => {
        c.hover += ((i === hoverIndex ? 1 : 0) - c.hover) * k;
        c.active += ((i === activeIndex ? 1 : 0) - c.active) * k;
        c.mat.uniforms.uHover.value = c.hover;
        c.mat.uniforms.uActive.value = c.active;
        c.mat.uniforms.uTime.value = reduced ? 0 : t;

        // Avanza hacia el centro al pasar el cursor o ser la activa.
        const lift = c.hover * 0.55 + c.active * 0.35;
        const toCenter = new THREE.Vector3(-Math.sin(c.θ), 0, Math.cos(c.θ));
        c.holder.position.copy(c.base).addScaledVector(toCenter, lift);
        c.holder.position.y = 0.2 + (reduced ? 0 : Math.sin(t * 0.8 + i * 1.7) * 0.06);
        c.mesh.scale.setScalar(1 + c.hover * 0.05);
      });
      floor.material.uniforms.uTime.value = t;
    },
  };
  return api;
}
