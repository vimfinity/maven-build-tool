// Smoke test: start the ViewManager from the compiled dist and emit SIGINT to verify cleanup
(async function () {
  try {
    const mod = await import('../dist/ui/view-manager.js');
    const ViewManager = mod.default || mod.ViewManager;
    const vm = new ViewManager();

    // Register a minimal view so show() has something to render
    const dummy = {
      render() { return 'Dummy\n'; },
      onMount() { /* noop */ },
      onInput() { /* noop */ },
    };
    vm.register('dummy', dummy);

    const runner = vm.start();
    // wait briefly then show
    setTimeout(async () => {
      await vm.show('dummy');
    }, 20);

    // after 200ms, emit SIGINT programmatically
    setTimeout(() => {
      console.log('Emitting SIGINT...');
      process.emit('SIGINT');
    }, 200);

    await runner;
    console.log('Smoke test finished: ViewManager shutdown completed');
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
})();
