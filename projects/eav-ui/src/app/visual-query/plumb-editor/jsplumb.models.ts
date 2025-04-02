// Custom models for better typed JSPlumb usage
// An update to a newer jsPlumb may not need this later on

export interface JsPlumbConnection {
  sourceId: string;
  targetId: string;
  endpoints: JsPlumbEndpoint[];
  // sourceEndpoint: JsPlumbEndpoint;
  // targetEndpoint: JsPlumbEndpoint;
  connection: any; // The actual jsPlumb connection object
  setLabel(data: { label: string; cssClass?: string; events?: { [key: string]: () => void } }): void;
}

export interface JsPlumbEndpoint {
  // elementId: string;
  getOverlay(name: 'endpointLabel'): JsPlumbOverlay;
  connections: JsPlumbConnection[];
  getUuid(): string;
  canvas: HTMLCanvasElement;
  id: string;
}

export interface JsPlumbOverlay {
  label: string;
  getLabel(): string;
  setLabel(label: string): void;
  addClass(className: string): void;
  // getElement(): HTMLElement;
  // setVisible(visible: boolean): void;
  // setPosition(position: { x: number; y: number }): void;
  // setHover(hover: boolean): void;
  // setStyle(style: { [key: string]: string }): void;
  // getStyle(): { [key: string]: string };
}