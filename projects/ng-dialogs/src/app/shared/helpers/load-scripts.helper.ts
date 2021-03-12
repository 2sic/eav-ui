import { WindowObject } from '../models/eav-window.model';

declare const window: WindowObject;

export function loadScripts(scriptObjects: ScriptObject[], callback: () => any, iteration = 0) {
  const isLast = scriptObjects.length === iteration + 1;
  const newCallback = isLast ? callback : loadScripts.bind(this, scriptObjects, callback, iteration + 1);
  const scrObj = scriptObjects[iteration];

  const global = typeof scrObj.test === 'string' ? scrObj.test : null;
  const test = typeof scrObj.test === 'function' ? scrObj.test : null;

  if (global != null && !!window[global]) {
    callback();
    return;
  }

  if (test != null && test()) {
    callback();
    return;
  }

  const scriptInDom: HTMLScriptElement = document.querySelector(`script[src="${scrObj.src}"]`);
  if (scriptInDom) {
    scriptInDom.addEventListener('load', newCallback, { once: true });
    return;
  }

  const scriptEl = document.createElement('script');
  scriptEl.src = scrObj.src;
  scriptEl.addEventListener('load', newCallback, { once: true });
  document.head.appendChild(scriptEl);
}

export class ScriptObject {
  /** window.xxx or a function that returns a boolean */
  test: string | (() => boolean);
  src: string;
}
