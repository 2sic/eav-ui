
export function isEscape(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}

export function isCtrlS(event: KeyboardEvent): boolean {
  return event.key === 's' && (event.ctrlKey || event.metaKey);
}