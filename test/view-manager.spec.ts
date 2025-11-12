import { describe, it, expect } from 'vitest';
import { ViewManager } from '../src/ui/view-manager';

// Note: This test runs synchronously in Node and simulates SIGINT by emitting the event.
describe('ViewManager lifecycle', () => {
  it('registers handlers and cleans up on SIGINT', async () => {
    const before = process.listenerCount('SIGINT');
    const vm = new ViewManager();
    const dummy = {
      render() { return 'x'; }
    } as any;
    vm.register('d', dummy);

    const runner = vm.start();
    // show a view so current is set
    setTimeout(async () => {
      await vm.show('d');
    }, 10);

    // emit SIGINT after short delay
    await new Promise((res) => setTimeout(res, 80));
    process.emit('SIGINT');

    await runner;

    const after = process.listenerCount('SIGINT');
    expect(after).toBe(before);
  });
});
