import { PALETTE, accent } from '../theme';

export function renderFooter(currentView?: string, hints?: string[]): string {
  const parts: string[] = [];
  // Format hints: expect strings like '↑/↓: bewegen' — split into key and label
  if (hints && hints.length) {
    for (const h of hints) {
      const idx = h.indexOf(':');
      if (idx > 0) {
        const key = h.slice(0, idx).trim();
        const label = h.slice(idx + 1).trim();
        parts.push(`${accent()}${PALETTE.bold}${key}${PALETTE.reset}${PALETTE.dim}:${PALETTE.reset} ${PALETTE.dim}${label}${PALETTE.reset}`);
      } else {
        parts.push(`${PALETTE.dim}${h}${PALETTE.reset}`);
      }
    }
  }
  // We no longer render a right-side status (current view) in the footer.
  // Footer now only displays contextual action hints. If no hints, return empty string.
  if (parts.length === 0) return '';
  return parts.join('  ');
}

export default renderFooter;
