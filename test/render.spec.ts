import { describe, it, expect } from 'vitest';
import { renderHeader } from '../src/ui/views/header';
import { renderSelect } from '../src/ui/widgets/select';

describe('renderers', () => {
  it('renderHeader returns title line', () => {
    const h = renderHeader();
    expect(h).toContain('Maven CLI');
  });

  it('renderSelect shows prompt and options', () => {
    const options = ['One', 'Two', 'Three'];
    const out = renderSelect(options, 1, new Set<number>(), false, 'Prompt:');
    expect(out).toContain('Prompt:');
    expect(out).toContain('Two');
    expect(out).toContain('Use ↑/↓ to move');
  });
});
