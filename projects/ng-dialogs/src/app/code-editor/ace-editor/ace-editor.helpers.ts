export function loadScripts(scriptObjects: ScriptObject[], callback: (...args: any[]) => any, iteration = 0) {
  const isLast = scriptObjects.length === iteration + 1;
  const newCallback = isLast ? callback : loadScripts.bind(this, scriptObjects, callback, iteration + 1);
  const scrObj = scriptObjects[iteration];

  if (!!(window as any)[scrObj.globalVar]) {
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
  globalVar: string;
  src: string;
}
