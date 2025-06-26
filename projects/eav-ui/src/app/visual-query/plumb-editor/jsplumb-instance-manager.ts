import { WindowWithJsPlumb } from '../window';
import { ConnectionLineColors } from './connection-line-colors';
import { JsPlumbInstance } from './jsplumb.models';

declare const window: WindowWithJsPlumb;

export class JsPlumbInstanceManager {
  constructor(private jsPlumbRoot: HTMLElement, private lineColors: ConnectionLineColors) {
    this.instance = window.jsPlumb.getInstance(this.createInstanceDefaults(this.jsPlumbRoot));
  }

  instance: JsPlumbInstance;

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
    this.instance.reset();
    this.instance.unbindContainer();
    this.instance = null;
  }
}