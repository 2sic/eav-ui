import { EavWindow } from '../models/eav-window.model';

declare const window: EavWindow;

export function loadScripts(scriptObjects: ScriptObject[], callback: () => void, iteration = 0) {
  const isLast = scriptObjects.length === iteration + 1;
  const newCallback = isLast ? callback : loadScripts.bind(this, scriptObjects, callback, iteration + 1);
  const scrObj = scriptObjects[iteration];

  const global = typeof scrObj.test === 'string' ? scrObj.test : null;
  const test = typeof scrObj.test === 'function' ? scrObj.test : null;
  const w = window as Record<string, any>;

  if (global != null && !!w[global]) {
    callback();
    return;
  }

  if (test != null && test()) {
    callback();
    return;
  }

  window.require([scrObj.src], (exportedVar: any) => {
    if (exportedVar && !w[global]) {
      w[global] = exportedVar;
    }
    newCallback();
  });
}

export interface ScriptObject {
  /** window.xxx or a function that returns a boolean */
  test: string | (() => boolean);
  src: string;
}
