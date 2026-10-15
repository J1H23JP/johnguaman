import * as THREE from 'three';
import { GALLERY_CENTER, GALLERY_RADIUS, cardAngle } from './gallery.js';
import { CONSTELLATION_CENTER } from './constellation.js';

export const CONTACT_CENTER = new THREE.Vector3(0, 0, -146);

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Estado de camara de cada seccion en funcion del progreso interno u (0 a 1).
// Cada funcion escribe en `out` para no crear objetos en cada frame.
function makeStates(projectCount) {
  const tmp = new THREE.Vector3();

  return [
    // 0. Inicio: el cristal a la derecha, el texto a la izquierda.
    (u, o, ctx) => {
      o.pos.set(0, 0.25, (ctx.portrait ? 11.2 : 8.4) - u * 0.9);
      o.target.set(ctx.portrait ? 0 : -1.8, ctx.portrait ? -1.7 : -0.1, 0);
      o.fov = 45;
    },
    // 1. Sobre mi: orbita lenta alrededor del cristal.
    (u, o, ctx) => {
      const a = lerp(0.95, 0.15, u);
      const r = ctx.portrait ? 10.5 : 8.6;
      o.pos.set(Math.sin(a) * r, 0.9, Math.cos(a) * r);
      o.target.set(ctx.portrait ? 0 : -3.4, ctx.portrait ? -2.1 : 0, 0);
      o.fov = 45;
    },
    // 2. Proyectos: el recorrido se detiene en cada lamina.
    (u, o, ctx) => {
      const n = projectCount;
      const t = clamp(u, 0, 1) * (n - 1);
      const k = Math.min(Math.floor(t), n - 2);
      const frac = t - k;
      const eased = n === 1 ? 0 : k + smoothstep(frac, 0.2, 0.8);
      ctx.projectFloat = eased;

      const a0 = cardAngle(0, n);
      const a1 = cardAngle(n - 1, n);
      const phi = n === 1 ? 0 : lerp(a0, a1, eased / (n - 1));
      const dir = tmp.set(Math.sin(phi), 0, -Math.cos(phi));
      const right = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi));

      o.pos.copy(GALLERY_CENTER).addScaledVector(dir, GALLERY_RADIUS - 6.6);
      o.pos.y += 0.35;
      o.target.copy(GALLERY_CENTER).addScaledVector(dir, GALLERY_RADIUS);
      o.target.y += 0.2;
      if (ctx.portrait) {
        o.target.y -= 1.9;
      } else {
        o.target.addScaledVector(right, -2.5);
      }
      o.fov = 50;
    },
    // 3. Habilidades: orbita alrededor de la constelacion.
    (u, o, ctx) => {
      const a = lerp(-0.55, 0.55, u);
      const r = ctx.portrait ? 21 : 17;
      o.pos.set(Math.sin(a) * r, 1.3, Math.cos(a) * r).add(CONSTELLATION_CENTER);
      const right = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      o.target.copy(CONSTELLATION_CENTER);
      if (ctx.portrait) o.target.y -= 3.6;
      else o.target.addScaledVector(right, -3.4);
      o.fov = 48;
    },
    // 4. Trayectoria: acercamiento a Ecuador en el globo.
    (u, o, ctx) => {
      const a = lerp(0.18, -0.12, u);
      const r = ctx.portrait ? 17 : 9.5;
      o.pos.set(Math.sin(a) * r, 0.5, Math.cos(a) * r).add(CONTACT_CENTER);
      const right = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      o.target.copy(CONTACT_CENTER);
      if (ctx.portrait) o.target.y -= 3.4;
      else o.target.addScaledVector(right, -3.6);
      o.fov = 45;
    },
    // 5. Contacto: el globo completo, con paquetes llegando a Quito.
    (u, o, ctx) => {
      const a = lerp(-0.12, 0.1, u);
      const r = ctx.portrait ? 21 : 12.5;
      o.pos.set(Math.sin(a) * r, 0.6, Math.cos(a) * r).add(CONTACT_CENTER);
      const right = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      o.target.copy(CONTACT_CENTER);
      if (ctx.portrait) o.target.y -= 4.6;
      else o.target.addScaledVector(right, -3.9);
      o.fov = 45;
    },
  ];
}

export class Director {
  constructor(sectionEls, projectCount) {
    this.els = sectionEls;
    this.states = makeStates(projectCount);
    this.projectCount = projectCount;
    this.a = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 45 };
    this.b = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 45 };
    this.out = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 45 };
    this.ctx = { portrait: false, projectFloat: 0 };
    this.section = 0;
    this.projectFloat = 0;
    this.transition = 0;
    this.measure();
  }

  measure() {
    this.vh = window.innerHeight;
    this.tops = this.els.map((el) => el.offsetTop);
    this.heights = this.els.map((el) => el.offsetHeight);
  }

  // Scroll (px) en el que arranca el proyecto i.
  projectScroll(i) {
    const s = 2;
    const top = this.tops[s];
    const span = Math.max(1, this.heights[s] - this.vh);
    const u = this.projectCount > 1 ? i / (this.projectCount - 1) : 0;
    return top + u * span;
  }

  // Progreso (0 a 1) dentro de la parte fija de la seccion s.
  progress(s, y) {
    const span = Math.max(1, this.heights[s] - this.vh);
    return clamp((y - this.tops[s]) / span, 0, 1);
  }

  // Scroll (px) al que arranca el paso i de n dentro de la seccion s.
  stepScroll(s, i, n) {
    const span = Math.max(1, this.heights[s] - this.vh);
    return this.tops[s] + ((i + 0.5) / n) * span;
  }

  evaluate(y, aspect) {
    this.ctx.portrait = aspect < 0.9;
    const last = this.els.length - 1;

    let i = 0;
    for (let s = 0; s <= last; s++) if (this.tops[s] <= y + 1) i = s;

    const pinnedEnd = this.tops[i] + this.heights[i] - this.vh;
    const start = this.tops[i];

    // Seccion activa segun el centro del viewport (para navegacion y HUD).
    const mid = y + this.vh * 0.5;
    let active = 0;
    for (let s = 0; s <= last; s++) if (this.tops[s] <= mid) active = s;
    this.section = active;

    if (i === last || y <= pinnedEnd) {
      const u = clamp((y - start) / Math.max(1, pinnedEnd - start), 0, 1);
      this.states[i](u, this.out, this.ctx);
      this.transition = 0;
    } else {
      const w = clamp((y - pinnedEnd) / this.vh, 0, 1);
      const e = easeInOut(w);
      this.states[i](1, this.a, this.ctx);
      this.states[i + 1](0, this.b, this.ctx);
      this.out.pos.lerpVectors(this.a.pos, this.b.pos, e);
      this.out.target.lerpVectors(this.a.target, this.b.target, e);
      // Efecto de velocidad: el campo de vision se abre durante el vuelo.
      this.out.fov = lerp(this.a.fov, this.b.fov, e) + Math.sin(Math.PI * e) * 14;
      this.transition = e;
    }
    this.projectFloat = this.ctx.projectFloat;
    return this.out;
  }
}
