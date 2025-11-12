// Simple color helpers and palette for the CLI
export const PALETTE = {
  accent: { r: 116, g: 119, b: 216 }, // periwinkle
  white: '\x1b[97m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
};

export function rgb(r: number, g: number, b: number) {
  return `\x1b[38;2;${r};${g};${b}m`;
}

export function accent() {
  const c = PALETTE.accent;
  return rgb(c.r, c.g, c.b);
}

export function wrapBold(s: string) {
  return `${PALETTE.bold}${s}${PALETTE.reset}`;
}

export default PALETTE;
