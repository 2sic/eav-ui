export function vh(percentage: number) {
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (percentage * viewportHeight) / 100;
}

export function vw(percentage: number) {
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (percentage * viewportWidth) / 100;
}
