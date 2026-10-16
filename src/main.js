import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { journey, projects, skills } from './data/content.js';
import { buildUI, buildDefectsHud, setPathStep, setProject, setSkill, setupContactForm, setupCerts, setupTools, toast, toggleHud } from './ui.js';
import { t, applyDocumentLanguage } from './i18n.js';
import { setupAgent } from './agent.js';
import { COLORS, createCrystal } from './scene/crystal.js';
import { createStars } from './scene/stars.js';
import { createBackdrop } from './scene/backdrop.js';
import { createGallery, GALLERY_CENTER } from './scene/gallery.js';
import { createConstellation, CONSTELLATION_CENTER } from './scene/constellation.js';
import { createGlobe } from './scene/globe.js';
import { Director, CONTACT_CENTER } from './scene/director.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse)').matches;

applyDocumentLanguage();
buildUI();
setupTools();
setupAgent();
setupContactForm();
setupCerts();
setProject(0);

const canvas = document.getElementById('gl');
const loader = document.getElementById('loader');
const cursorEl = document.getElementById('cursor');
const sectionEls = [...document.querySelectorAll('[data-sec]')];

// ---------------------------------------------------------------- WebGL

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
} catch (err) {
  console.warn('WebGL no disponible', err);
}

if (!renderer) {
  document.documentElement.classList.add('no-webgl');
  loader.classList.add('is-done');
  sectionEls.forEach((el) => (el.style.height = 'auto'));
  document.querySelectorAll('.stage').forEach((el) => {
    el.style.position = 'relative';
    el.style.height = 'auto';
    el.style.minHeight = '70vh';
  });
  document.querySelectorAll('.hud').forEach((el) => el.remove());
  throw new Error('Sin WebGL: se muestra la version de solo texto.');
}

let pixelRatio = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = COLORS.ink;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 0.25, 8.4);

// ---------------------------------------------------------------- Mundo

const backdrop = createBackdrop();
scene.add(backdrop.mesh);

const stars = createStars(isTouch ? 3200 : 5500);
stars.setPixelRatio(pixelRatio);
scene.add(stars.points);

const crystal = createCrystal();
scene.add(crystal.group);

const gallery = createGallery(projects);
scene.add(gallery.group);

let constellation = null; // se crea cuando la tipografia ya cargo (etiquetas en canvas)

let globe = null; // se crea cuando la tipografia ya cargo (etiqueta en canvas)

// ---------------------------------------------------------------- Postproceso

const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
const target = new THREE.WebGLRenderTarget(size.x * pixelRatio, size.y * pixelRatio, {
  type: THREE.HalfFloatType,
  samples: 4,
});
const composer = new EffectComposer(renderer, target);
composer.setPixelRatio(pixelRatio);
composer.setSize(size.x, size.y);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.5, 0.55, 0.82);
composer.addPass(bloom);

const fxPass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    uAber: { value: 0 },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAber;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 c = vUv - 0.5;
      float d = dot(c, c);
      vec2 off = c * uAber * (0.4 + d * 2.0);
      float r = texture2D(tDiffuse, vUv + off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - off).b;
      vec3 col = vec3(r, g, b);
      col *= 1.0 - d * 0.85;
      float n = fract(sin(dot(vUv * vec2(1920.0, 1080.0) + uTime, vec2(12.9898, 78.233))) * 43758.5453);
      col += (n - 0.5) * 0.02;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
composer.addPass(fxPass);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- Estado

const director = new Director(sectionEls, projects.length);
const pointer = { x: 0, y: 0, sx: 0, sy: 0, cx: -100, cy: -100, down: false, moved: 0, downAt: 0, active: false };
const raycaster = new THREE.Raycaster();
const camBase = new THREE.Vector3().copy(camera.position);
const lookAt = new THREE.Vector3(-1.8, -0.1, 0);
const prevBase = new THREE.Vector3().copy(camBase);

let activeProject = 0;
let activePath = 0;
let hoverCard = -1;
let hoverSkill = -1;
let hoverDefect = -1;
let sectionNow = 0;
let aberration = 0;
let maxScroll = 1;

const spinVel = { x: 0, y: 0 };
const crystalRot = { x: 0.15, y: 0.4 };

// ---------------------------------------------------------------- Interaccion

const interactive = (el) => el.closest('a, button, input, textarea, label, form, .hud');

window.addEventListener('pointermove', (e) => {
  pointer.cx = e.clientX;
  pointer.cy = e.clientY;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  pointer.active = true;
  if (!isTouch) cursorEl.classList.add('is-on');

  if (pointer.down) {
    const dx = e.movementX || 0;
    const dy = e.movementY || 0;
    pointer.moved += Math.abs(dx) + Math.abs(dy);
    if (sectionNow <= 1) {
      spinVel.y += dx * 0.0016;
      spinVel.x += dy * 0.0012;
    }
  }
});

canvas.addEventListener('pointerdown', (e) => {
  pointer.down = true;
  pointer.moved = 0;
  pointer.downAt = performance.now();
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
});

window.addEventListener('pointerup', (e) => {
  if (!pointer.down) return;
  pointer.down = false;
  const quick = performance.now() - pointer.downAt < 600;
  if (pointer.moved < 8 && quick && !interactive(e.target)) handleClick();
});

document.addEventListener('mouseleave', () => {
  pointer.active = false;
  cursorEl.classList.remove('is-on');
});

function setRay() {
  raycaster.setFromCamera({ x: pointer.x, y: pointer.y }, camera);
}

function pickDefect() {
  setRay();
  const hit = raycaster.intersectObject(crystal.mesh, false)[0];
  if (!hit) return -1;
  const local = crystal.group.worldToLocal(hit.point.clone()).normalize();
  return crystal.defectAt(local, 0.93);
}

function handleClick() {
  setRay();
  if (sectionNow <= 1) {
    const i = pickDefect();
    if (i >= 0 && crystal.fix(i)) {
      const count = crystal.fixedCount;
      buildDefectsHud(count, crystal.count);
      if (count === crystal.count) {
        crystal.burst();
        stars.burst();
        toast(t.toastGreen);
      } else {
        toast(t.toastFixed(count, crystal.count));
      }
    }
  } else if (sectionNow === 2) {
    const i = gallery.pick(raycaster);
    if (i >= 0) {
      if (i === activeProject) window.open(projects[i].url, '_blank', 'noopener');
      else goToProject(i);
    }
  } else if (sectionNow === 3 && constellation) {
    const i = constellation.pick(raycaster);
    setSkill(i >= 0 ? skills[i] : null);
  }
}

function goToProject(i) {
  const j = THREE.MathUtils.clamp(i, 0, projects.length - 1);
  window.scrollTo({ top: director.projectScroll(j), behavior: reduced ? 'auto' : 'smooth' });
}

const PATH_SECTION = 5;
function goToStep(i) {
  const y = director.stepScroll(PATH_SECTION, i, journey.length);
  window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}

function goToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = id === 'proyectos' ? director.projectScroll(0) + 2 : el.offsetTop;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) {
    e.preventDefault();
    goToSection(nav.dataset.nav);
    return;
  }
  const step = e.target.closest('[data-step]');
  if (step) goToStep(Number(step.dataset.step));
  if (e.target.closest('#hp-prev')) goToProject(activeProject - 1);
  if (e.target.closest('#hp-next')) goToProject(activeProject + 1);
  const mail = e.target.closest('#copy-mail');
  if (mail) {
    navigator.clipboard
      ?.writeText(mail.dataset.mail)
      .then(() => toast(t.mailCopied))
      .catch(() => toast(mail.dataset.mail));
  }
});

window.addEventListener('keydown', (e) => {
  if (sectionNow !== 2) return;
  if (e.target.closest && e.target.closest('input, textarea, dialog, [role="dialog"]')) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    goToProject(activeProject + 1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goToProject(activeProject - 1);
  }
});

window.addEventListener('contact:sent', () => {
  if (globe && globe.group.visible) globe.send(camera, camera.aspect < 0.9);
});

// ---------------------------------------------------------------- Scroll y secciones

const railLinks = [...document.querySelectorAll('#rail a')];
const menuLinks = [...document.querySelectorAll('.menu a')];
const stageEls = sectionEls.map((el) => el.querySelector('.stage'));

function updateStages(y) {
  const vh = window.innerHeight;
  sectionEls.forEach((el, i) => {
    const top = director.tops[i];
    const h = director.heights[i];
    const enter = THREE.MathUtils.clamp(1 - (top - y) / (vh * 0.9), 0, 1);
    const leave = i === sectionEls.length - 1 ? 1 : THREE.MathUtils.clamp(1 - (y - (top + h - vh)) / (vh * 0.7), 0, 1);
    const vis = Math.min(enter, leave);
    const stage = stageEls[i];
    stage.style.opacity = vis.toFixed(3);
    stage.style.visibility = vis < 0.01 ? 'hidden' : 'visible';
    stage.style.pointerEvents = vis < 0.4 ? 'none' : '';
  });
}

function setSection(idx) {
  sectionNow = idx;
  railLinks.forEach((a, i) => (i === idx ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  const ids = ['inicio', 'sobre-mi', 'proyectos', 'habilidades', 'certificaciones', 'trayectoria', 'contacto'];
  menuLinks.forEach((a) =>
    a.dataset.nav === ids[idx] ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')
  );
  toggleHud('#hud-defects', idx === 0);
  toggleHud('#hud-project', idx === 2);
  toggleHud('#hud-skill', idx === 3);
  if (idx !== 3) hoverSkill = -1;
}

// ---------------------------------------------------------------- Resize

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(w, h, false);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(w, h);
  bloom.resolution.set(w / 2, h / 2);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  stars.setPixelRatio(pixelRatio);
  director.measure();
  maxScroll = Math.max(1, document.documentElement.scrollHeight - h);
}
window.addEventListener('resize', onResize);
onResize();

// ---------------------------------------------------------------- Bucle

let lastTime = performance.now();
let elapsed = 0;
const camOffset = new THREE.Vector3();
const parallax = { x: 0, y: 0 };
let slowFrames = 0;
let frames = 0;
let acc = 0;
let first = true;

function frame() {
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += dt;
  const t = elapsed;
  const y = window.scrollY;

  // Calidad adaptable: si el equipo va lento, baja la resolucion.
  acc += dt;
  frames++;
  if (acc > 2) {
    const avg = acc / frames;
    if (avg > 0.03 && pixelRatio > 1) {
      pixelRatio = Math.max(1, pixelRatio - 0.25);
      onResize();
    }
    acc = 0;
    frames = 0;
  }

  const state = director.evaluate(y, camera.aspect);
  if (director.section !== sectionNow) setSection(director.section);
  updateStages(y);

  // Camara con amortiguacion.
  const k = reduced ? 1 : 1 - Math.exp(-dt * 4.5);
  camBase.lerp(state.pos, k);
  lookAt.lerp(state.target, k);
  const fovK = reduced ? 1 : 1 - Math.exp(-dt * 6);
  camera.fov += (state.fov - camera.fov) * fovK;
  camera.updateProjectionMatrix();

  parallax.x += (pointer.x - parallax.x) * (1 - Math.exp(-dt * 3));
  parallax.y += (pointer.y - parallax.y) * (1 - Math.exp(-dt * 3));
  camera.position.copy(camBase);
  camera.lookAt(lookAt);
  if (!reduced && !isTouch) {
    camOffset.set(parallax.x * 0.45, parallax.y * 0.28, 0).applyQuaternion(camera.quaternion);
    camera.position.add(camOffset);
  }

  // Velocidad de la camara: aberracion cromatica durante el vuelo.
  const speed = camBase.distanceTo(prevBase) / Math.max(dt, 0.001);
  prevBase.copy(camBase);
  const aberTarget = reduced ? 0 : Math.min(0.008, speed * 0.00025);
  aberration += (aberTarget - aberration) * (1 - Math.exp(-dt * 6));
  fxPass.uniforms.uAber.value = aberration;
  fxPass.uniforms.uTime.value = t % 100;
  bloom.strength = 0.5 + aberration * 12;

  // Visibilidad por distancia: no se dibuja lo que esta lejos.
  const cp = camera.position;
  crystal.group.visible = cp.distanceTo(crystal.group.position) < 40;
  gallery.group.visible = cp.distanceTo(GALLERY_CENTER) < 34;
  if (constellation) constellation.group.visible = cp.distanceTo(CONSTELLATION_CENTER) < 38;
  if (globe) globe.group.visible = cp.distanceTo(CONTACT_CENTER) < 48;

  // Cristal: arrastre con inercia + giro lento.
  if (crystal.group.visible) {
    const idle = reduced ? 0 : 0.12; // rad/s
    crystalRot.y += spinVel.y * dt * 60 + (pointer.down ? 0 : idle * dt);
    crystalRot.x += spinVel.x * dt * 60;
    crystalRot.x = THREE.MathUtils.clamp(crystalRot.x, -1.1, 1.1);
    const damp = Math.exp(-dt * 3.2);
    spinVel.x *= damp;
    spinVel.y *= damp;
    crystal.group.rotation.set(crystalRot.x, crystalRot.y, 0);
    crystal.update(t, dt, camera, reduced);
  }

  // Hover segun la seccion.
  let hot = false;
  if (pointer.active && !isTouch) {
    setRay();
    if (sectionNow <= 1 && crystal.group.visible) {
      const i = pickDefect();
      hoverDefect = i;
      hot = i >= 0;
    } else if (sectionNow === 2) {
      hoverCard = gallery.pick(raycaster);
      hot = hoverCard >= 0;
    } else if (sectionNow === 3 && constellation) {
      const i = constellation.pick(raycaster);
      if (i !== hoverSkill) {
        hoverSkill = i;
        setSkill(i >= 0 ? skills[i] : null);
      }
      hot = i >= 0;
    }
  }
  if (sectionNow !== 2) hoverCard = -1;
  cursorEl.classList.toggle('is-hot', hot);
  cursorEl.style.transform = `translate3d(${pointer.cx}px, ${pointer.cy}px, 0)`;
  canvas.style.cursor = hot ? 'pointer' : pointer.down && sectionNow <= 1 ? 'grabbing' : sectionNow <= 1 ? 'grab' : 'default';

  // Proyecto activo.
  if (sectionNow === 2) {
    const idx = THREE.MathUtils.clamp(Math.round(director.projectFloat), 0, projects.length - 1);
    if (idx !== activeProject) {
      activeProject = idx;
      setProject(idx);
    }
  }
  if (sectionNow === PATH_SECTION) {
    const u = director.progress(PATH_SECTION, y);
    const idx = THREE.MathUtils.clamp(Math.floor(u * journey.length), 0, journey.length - 1);
    if (idx !== activePath) {
      activePath = idx;
      setPathStep(idx);
    }
  }
  if (gallery.group.visible) gallery.update(t, dt, sectionNow === 2 ? activeProject : -1, hoverCard, reduced);
  if (constellation && constellation.group.visible) constellation.update(t, dt, parallax, hoverSkill, camera, reduced);
  if (globe && globe.group.visible) globe.update(t, dt, parallax, camera, window.innerHeight * pixelRatio, reduced);

  stars.update(t, dt, pointer, reduced || isTouch);
  backdrop.update(t, camera, THREE.MathUtils.clamp(y / maxScroll, 0, 1));

  composer.render(dt);

  if (first) {
    first = false;
    loader.classList.add('is-done');
  }
  requestAnimationFrame(frame);
}

async function start() {
  await gallery.init();
  await constellationReady();
  constellation = createConstellation(skills);
  scene.add(constellation.group);
  globe = createGlobe();
  scene.add(globe.group);
  buildDefectsHud(0, crystal.count);
  setSection(0);
  requestAnimationFrame(frame);
}

// Las etiquetas de la constelacion usan la tipografia: esperamos a que cargue.
async function constellationReady() {
  try {
    await document.fonts.load('600 54px "Instrument Sans Variable"');
    await document.fonts.load('600 56px "Instrument Sans Variable"');
  } catch {
    /* sin tipografia personalizada: se usa la del sistema */
  }
}

start();

// Util para depurar desde la consola del navegador.
window.__portfolio = { director, crystal, goToSection, goToProject };
