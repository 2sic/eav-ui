import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
import { WindowWithJsPlumb } from '../window';
import { ConnectionLineColors } from './connection-line-colors';
import { JsPlumbInstanceOld } from './jsplumb.models';

declare const window: WindowWithJsPlumb;

export class JsPlumbInstanceManager {
  constructor(private jsPlumbRoot: HTMLElement, private lineColors: ConnectionLineColors) {
    // New
    this.instance = newInstance(this.createBrowserJsPlumbDefaults(this.jsPlumbRoot));

    // Old
    this.instanceOld = window.jsPlumb.getInstance(this.createInstanceDefaults(this.jsPlumbRoot));
  }

  // New
  instance: BrowserJsPlumbInstance;
  createBrowserJsPlumbDefaults(container: HTMLElement) {
    const defaults = {
      container: container,
      Connector: ['Bezier', { curviness: 70 }],
      PaintStyle: this.lineColors.nextLinePaintStyle('dummy'),
      HoverPaintStyle: {
        stroke: '#216477',
        strokeWidth: 4,
        outlineStroke: 'white',
        outlineWidth: 2,
      },
    };
    return defaults;
  }

  // Old
  instanceOld: JsPlumbInstanceOld;
  createInstanceDefaults(container: HTMLElement) {
    const defaults = {
      Container: container,
      Connector: ['Bezier', { curviness: 70 }],
      PaintStyle: this.lineColors.nextLinePaintStyle('dummy'),
      HoverPaintStyle: {
        stroke: '#216477',
        strokeWidth: 4,
        outlineStroke: 'white',
        outlineWidth: 2,
      },
    };
    return defaults;
  }

  destroy() {
    // New
    this.instance.reset();
    this.instance.unbind();
    this.instance = null;
    
    // Old
    this.instanceOld.reset();
    this.instanceOld.unbindContainer();
    this.instanceOld = null;
  }
}