export function getMaxZIndex(containerSelector: string = '#root'): number {
  const container = document.querySelector(containerSelector);
  if (!container) return 0;

  const elements = Array.from(container.querySelectorAll('*')) as HTMLElement[];
  let maxZ = 0;

  for (const el of elements) {
    const style = window.getComputedStyle(el);
    if (!style) continue;

    const zIndex = parseInt(style.zIndex, 10);
    if (!isNaN(zIndex) && zIndex > maxZ) {
      maxZ = zIndex;
    }
  }

  return maxZ;
}
