// Estadisticas de uso con GoatCounter: sin cookies, sin perfiles de personas.
// - Mientras ANALYTICS.goatcounter este vacio (src/config.js) este modulo no hace nada.
// - No se mide en desarrollo (`npm run dev`) ni a quien tenga activado "No rastrear" (DNT) o Global Privacy Control.
// - Solo se envian nombres de eventos fijos ("seccion/proyectos"), nunca el texto que alguien escribe.

import { ANALYTICS } from './config.js';

const code = String(ANALYTICS.goatcounter || '').trim().toLowerCase();
const optedOut = () =>
  navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1' || navigator.globalPrivacyControl === true;

export const analyticsActive = /^[a-z0-9-]{2,40}$/.test(code) && import.meta.env.PROD && !optedOut();

const queue = [];
let ready = false;
const once = new Set();

function flush() {
  while (queue.length) {
    const ev = queue.shift();
    try {
      window.goatcounter.count(ev);
    } catch {
      /* si falla la medicion, la pagina sigue igual */
    }
  }
}

// name: sin "/" al inicio. title: texto legible para el panel.
export function track(name, title, { unique = false } = {}) {
  if (!analyticsActive) return;
  if (unique) {
    if (once.has(name)) return;
    once.add(name);
  }
  const ev = { path: name, title: title || name, event: true };
  if (ready) window.goatcounter.count(ev);
  else queue.push(ev);
}

export function setupAnalytics() {
  if (!analyticsActive) return;
  window.goatcounter = { no_onload: true };
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  s.onload = () => {
    ready = true;
    // Visita: ruta limpia (sin ?para=...), el origen lo toma GoatCounter del referente.
    try {
      window.goatcounter.count({ path: location.pathname || '/', title: document.title });
    } catch {
      /* igual */
    }
    flush();
  };
  s.onerror = () => queue.splice(0, queue.length);
  document.head.appendChild(s);

  // Secciones vistas (una vez por visita).
  window.addEventListener('section:change', (e) => track(`seccion/${e.detail}`, `Sección: ${e.detail}`, { unique: true }));
  window.addEventListener('contact:sent', () => track('contacto/enviado', 'Mensaje enviado'));

  window.addEventListener('beforeprint', () => track('imprimir', 'Imprimir o guardar PDF'));
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('a[download]')) track('cv/descargar', 'Descarga del CV');
  });
}
