 (async () => {
  try {
    const projectPicker = (await import('../dist/ui/views/projectPicker.js')).default || (await import('../dist/ui/views/projectPicker.js')).ProjectPicker;
    const footerModule = await import('../dist/ui/views/footer.js');
    const renderFooter = footerModule.renderFooter || footerModule.default;

    const compHints = {
      select: ['↑/↓: bewegen', 'Enter: auswählen'],
      multiselect: ['↑/↓: bewegen', 'Leertaste: markieren', 'Enter: ausführen'],
    };

    const v = projectPicker;
    let hints = [];
    if (v.footerHints) hints = v.footerHints();
    else {
      const comps = v.components || [];
      for (const c of comps) {
        const mapped = compHints[c];
        if (mapped) hints.push(...mapped);
      }
      // no history in this debug run
    }
    hints.push('q: Beenden');

    const out = renderFooter(undefined, hints);
    console.log('hints:', hints);
    console.log('footer:', out);
  } catch (err) {
    console.error('debug failed:', err);
  }
})();
