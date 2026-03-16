export function fmtCoord(n: number): string {
  return n.toFixed(4);
}

export function gcLine(code: string, comment?: string): string {
  return comment ? `${code} (${comment})` : code;
}

export function applyKerfOffset(
  x: number,
  kerfWidth: number,
  direction: 1 | -1 = 1,
): number {
  return x + direction * (kerfWidth / 2);
}
