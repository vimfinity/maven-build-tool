import { accent, wrapBold, PALETTE } from '../theme';

export function renderHeader(): string {
  const title = `${accent()}Maven CLI${PALETTE.reset}`;
  const name = wrapBold('maven-build-tool');
  const version = `${PALETTE.gray}v0.1.0${PALETTE.reset}`;
  return `${title} — ${name} ${version}\n`;
}
