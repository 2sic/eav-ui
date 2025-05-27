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

  target: HTMLElement;
  targetEndpoint: JsPlumbEndpoint;
}

export interface JsPlumbEndpoint {
  // elementId: string;
  getOverlay(name: 'endpointLabel'): JsPlumbOverlay;
  connections: JsPlumbConnection[];
  getUuid(): string;
  canvas: HTMLCanvasElement;
  id: string;
  delete(): void;
  isTarget: boolean;
  isSource: boolean;
  addClass(className: string): void;
  removeClass(className: string): void;
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

export interface JsPlumbInstanceOld {

  reset(): void;
  unbindContainer(): void;
  getAllConnections(): JsPlumbConnection[];
  selectEndpoints(params: { element?: string, target?: string | boolean })
  : JsPlumbEndpoint[] & {
    delete(): void,
    each(callback: (endpoint: JsPlumbEndpoint) => void): void
  };
  /** 
   * Suspend drawing, run the given function, and then re-enable drawing, optionally repainting everything.
   * https://docs.jsplumbtoolkit.com/toolkit/5.x/community-apidocs/core.jsplumbinstance.batch
   */
  batch(callback: () => void): void;

  draggable(element: HTMLElement, options: {
    filter?: string;
    containment?: string | HTMLElement;
    grid?: number[];
    start?: () => void;
    stop?: (event: { el: HTMLElement, finalPos: number[] }) => void
  }): void;

  makeSource(element: HTMLElement, options: any, more: any): void;

  makeTarget(element: HTMLElement, options: any): void;

  addEndpoint(element: HTMLElement, options: any, params: any): JsPlumbEndpoint;
  getEndpoint(id: string): JsPlumbEndpoint | null;
  getEndpoints(uuid: string): JsPlumbEndpoint[];
  deleteEndpoint(endpoint: JsPlumbEndpoint): void;

  deleteConnection(connections: JsPlumbConnection[], options: { fireEvent: boolean}): void;


  // addEndpoint(element: HTMLElement, options: any): JsPlumbEndpoint;
  connect(options: { uuids: string[]; paintStyle?: any; overlays?: any[] }): JsPlumbConnection;
  // deleteConnection(connection: JsPlumbConnection): void;
  // deleteEveryConnection(): void;
  // detachAllConnections(elementId: string): void;
  // setSuspendDrawing(suspend: boolean, doNotRepaint?: boolean): void;
  repaintEverything(): void;
  // setDraggable(element: HTMLElement, draggable: boolean): void;
  bind(eventName: string, callback: (params: any) => void): void;
}