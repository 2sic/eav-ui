/**
 * Checks if the keyboard event is triggered by the Escape key.
 * @param event KeyboardEvent
 * @returns boolean
 */
export function isEscape(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}

/**
 * Checks if the keyboard event is triggered by Ctrl + S (or Cmd + S on Mac).
 * @param event KeyboardEvent
 * @returns boolean
 */
export function isCtrlS(event: KeyboardEvent): boolean {
  return (event.key === 's' || event.key === 'S') && (event.ctrlKey || event.metaKey);
}

/**
 * Checks if the keyboard event is triggered by Ctrl + Enter (or Cmd + Enter on Mac).
 * @param event KeyboardEvent
 * @returns boolean
 */
export function isCtrlEnter(event: KeyboardEvent): boolean {
  return event.key === 'Enter' && (event.ctrlKey || event.metaKey);
}