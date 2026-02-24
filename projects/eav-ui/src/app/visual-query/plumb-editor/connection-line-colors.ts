import { classLog } from '../../../../../shared/logging';

const logSpecs = {
  all: false,
}

/**
 * Helper to manage the line colors on each connection
 */
export class ConnectionLineColors {
  log = classLog({ConnectionLineColors}, logSpecs);

  constructor() { }

  #lineCount = 0;
  #linePaintDefault = {
    stroke: '#61B7CF',
    strokeWidth: 4,
    outlineStroke: 'white',
    outlineWidth: 2,
  };
  #lineColors = [
    '#009688', '#00bcd4', '#3f51b5', '#9c27b0', '#e91e63',
    '#db4437', '#ff9800', '#60a917', '#60a917', '#008a00',
    '#00aba9', '#1ba1e2', '#0050ef', '#6a00ff', '#aa00ff',
    '#f472d0', '#d80073', '#a20025', '#e51400', '#fa6800',
    '#f0a30a', '#e3c800', '#825a2c', '#6d8764', '#647687',
    '#76608a', '#a0522d',
  ];
  #maxCols = this.#lineColors.length - 1;
  #uuidColorMap: Record<string, any> = {};


  nextLinePaintStyle(uuid: string) {
    return this.#uuidColorMap[uuid] ??= this.#nextLineColor();
  }

  #nextLineColor() {
    return {
      ...this.#linePaintDefault,
      stroke: this.#lineColors[this.#lineCount++ % this.#maxCols],
    };
  }

}