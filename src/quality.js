// Calidad grafica: automatica por defecto, o "modo ligero" elegido por la persona (se recuerda en el navegador).
// main.js escucha 'quality:set' para aplicar el cambio al instante.

import { t } from './i18n.js';
import { toast } from './ui.js';

export function getQuality() {
  try {
    return localStorage.getItem('quality') === 'low' ? 'low' : 'auto';
  } catch {
    return 'auto';
  }
}

export function setQuality(mode) {
  try {
    if (mode === 'low') localStorage.setItem('quality', 'low');
    else localStorage.removeItem('quality');
  } catch {
    /* sin almacenamiento: vale solo para esta visita */
  }
  window.dispatchEvent(new CustomEvent('quality:set', { detail: mode }));
  toast(mode === 'low' ? t.qualityLowOn : t.qualityAutoOn);
}
