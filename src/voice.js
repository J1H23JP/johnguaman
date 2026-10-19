// Voz del agente, sin servidor propio.
// - Lectura en voz alta: speechSynthesis del navegador (local, no sale audio ni texto).
// - Dictado: SpeechRecognition del navegador. En Chrome el audio lo procesa el servicio de reconocimiento de Google;
//   el agente lo avisa en el chat. En navegadores sin soporte (Firefox) el boton de microfono no aparece.

import { lang } from './i18n.js';

const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const ttsSupported = !!synth && 'SpeechSynthesisUtterance' in window;
export const sttSupported = !!Recognition;

const LOCALE = lang === 'en' ? ['en-US', 'en-GB', 'en'] : ['es-EC', 'es-MX', 'es-US', 'es-ES', 'es'];

function pickVoice() {
  const voices = synth.getVoices();
  for (const code of LOCALE) {
    const hit = voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(code.toLowerCase()));
    if (hit) return hit;
  }
  return null;
}

let current = null;

export function stopSpeaking() {
  if (!ttsSupported) return;
  synth.cancel();
  if (current) current.onEnd?.();
  current = null;
}

// Lee `text` en el idioma de la pagina. `onEnd` se llama al terminar o al cortarse.
export function speak(text, onEnd) {
  if (!ttsSupported) return false;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice ? voice.lang : LOCALE[0];
  u.rate = 1;
  const state = { onEnd };
  const done = () => {
    if (current === state) current = null;
    onEnd?.();
  };
  u.onend = done;
  u.onerror = done;
  current = state;
  try {
    synth.speak(u);
  } catch {
    done();
    return false;
  }
  return true;
}

// Dictado por voz. Devuelve { start, stop } o null si el navegador no lo soporta.
// onText(texto, esFinal), onState(activo), onError(codigo)
export function createDictation({ onText, onState, onError }) {
  if (!Recognition) return null;
  let rec = null;
  let active = false;

  const start = () => {
    if (active) return;
    stopSpeaking();
    rec = new Recognition();
    rec.lang = LOCALE[0];
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let text = '';
      let final = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      onText(text.trim(), final);
    };
    rec.onerror = (e) => onError?.(e.error || 'error');
    rec.onend = () => {
      active = false;
      onState(false);
    };
    try {
      rec.start();
      active = true;
      onState(true);
    } catch (err) {
      active = false;
      onState(false);
      onError?.('start-failed');
    }
  };

  const stop = () => {
    if (rec && active) {
      try {
        rec.stop();
      } catch {
        /* ya estaba detenido */
      }
    }
  };

  return { start, stop, isActive: () => active };
}
