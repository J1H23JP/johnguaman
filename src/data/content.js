// Punto unico de acceso al contenido: elige español o inglés segun el idioma activo.
// Los datos (enlaces, años, tonos, ids) viven en content.es.js; content.en.js solo trae los textos.
import { lang } from '../i18n.js';
import * as es from './content.es.js';
import * as en from './content.en.js';

const EN = lang === 'en';

// Mezcla elemento a elemento: el texto en inglés pisa al español.
const merge = (base, over) => (EN ? base.map((item, i) => ({ ...item, ...(over[i] || {}) })) : base);

export const profile = EN ? { ...es.profile, ...en.profile } : es.profile;
export const about = EN ? en.about : es.about;
export const projects = merge(es.projects, en.projects);
export const skills = merge(es.skills, en.skills);
export const certifications = merge(es.certifications, en.certifications);
export const sections = merge(es.sections, en.sections);

// En la trayectoria los puntos con enlace conservan su URL: el texto en inglés se aplica sobre el original.
export const journey = EN
  ? es.journey.map((step, i) => {
      const over = en.journey[i];
      const points = over.points.map((text, k) => {
        const orig = step.points[k];
        return typeof orig === 'object' && orig.link ? { ...orig, text } : text;
      });
      return { ...step, ...over, points };
    })
  : es.journey;
