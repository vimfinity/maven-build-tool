(async () => {
  const vmMod = await import('../dist/ui/view-manager.js');
  const vmClass = vmMod.default || vmMod.ViewManager;
  const vm = new vmClass();
  const ppMod = await import('../dist/ui/views/projectPicker.js');
  const projectPicker = ppMod.default || ppMod.ProjectPicker || ppMod;

  const v = projectPicker;
  // simulate v.footerHints or auto-derived
  const compHints = {
    select: ['↑/↓: bewegen', 'Enter: auswählen'],
    multiselect: ['↑/↓: bewegen', 'Leertaste: markieren', 'Enter: ausführen'],
  };
  let hints = [];
  if (v.footerHints) hints = v.footerHints();
  else {
    const comps = v.components || [];
    for (const c of comps) {
      const mapped = compHints[c];
      if (mapped) hints.push(...mapped);
    }
  if (vm.history && vm.history.length > 0) hints.push('Esc: Zurück');
  }
  hints.push('q: Beenden');
  const { renderFooter } = await import('../dist/ui/index.js');
  const out = renderFooter(v.title || 'projectPicker', hints);
  console.log('Hints array:', hints);
  console.log('Footer raw:', out);
})();
