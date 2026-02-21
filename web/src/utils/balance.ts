export function parseBalance(value: string): number {
  return Number.parseFloat(value.replace(/,/g, "")) || 0;
}
