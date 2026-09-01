import { EavWindow } from '../models/eav-window.model';

declare const window: EavWindow;

type RequireJs = (dependencies: string[], callback: (exportedVar: unknown) => void) => void;

export function loadScripts(scriptObjects: ScriptObject[], callback: () => void, iteration = 0) {
  const isLast = scriptObjects.length === iteration + 1;
  const newCallback = isLast ? callback : loadScripts.bind(this, scriptObjects, callback, iteration + 1);
  const scrObj = scriptObjects[iteration];

  const global = typeof scrObj.test === 'string' ? scrObj.test : null;
  const test = typeof scrObj.test === 'function' ? scrObj.test : null;

  if (global != null && !!Reflect.get(window, global)) {
    callback();
    return;
  }

  if (test != null && test()) {
    callback();
    return;
  }

  const requireJs: unknown = Reflect.get(window, 'require');
  if (isRequireJs(requireJs)) {
    requireJs([scrObj.src], (exportedVar) => {
      if (global != null && exportedVar && !Reflect.get(window, global))
        Reflect.set(window, global, exportedVar);
      newCallback();
    });
    return;
  }

  // Fallback for hosts where require is not available as a function.
  const script = document.createElement('script');
  script.src = scrObj.src;
  script.addEventListener('load', newCallback, { once: true });
  script.addEventListener('error', () => console.error(`Failed to load script '${scrObj.src}'`), { once: true });
  document.head.appendChild(script);
}

function isRequireJs(value: unknown): value is RequireJs {
  return typeof value === 'function';
}

export interface ScriptObject {
  /** window.xxx or a function that returns a boolean */
  test: string | (() => boolean);
  src: string;
}
