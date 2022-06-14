export interface ElementEventListener {
  element: HTMLElement | Document | Window;
  type: string;
  listener: EventListenerOrEventListenerObject;
}
