import { renderHeader, joinLines } from '.';

function hideCursor() {
  process.stdout.write('\x1b[?25l');
}

function showCursor() {
  process.stdout.write('\x1b[?25h');
}

function clearScreen() {
  // Clear entire screen and move cursor to home
  process.stdout.write('\x1b[2J\x1b[H');
}

function enterAlternateBuffer() {
  // Use DEC private mode 1049 to switch to the alternate buffer and save cursor
  process.stdout.write('\x1b[?1049h');
}

function exitAlternateBuffer() {
  process.stdout.write('\x1b[?1049l');
}

function clearScrollback() {
  // Clear scrollback buffer (supported by many terminals)
  process.stdout.write('\x1b[3J');
}

export async function runStartView(): Promise<void> {
  if (!process.stdout.isTTY) {
    console.log('Start view requires a TTY');
    return;
  }

  return new Promise<void>((resolve) => {
    // cleanup and resolve promise
    const cleanup = () => {
      try {
        process.stdin.off('data', onData as any);
      } catch {}
      try {
        process.stdout.off('resize', onResize as any);
      } catch {}
      try {
        process.stdin.setRawMode && process.stdin.setRawMode(false);
      } catch {}
      try {
        process.stdin.pause();
      } catch {}
      try {
        showCursor();
        clearScreen();
        exitAlternateBuffer();
      } catch {}
      // resolve to signal that the view finished
      resolve();
    };

    // enable raw mode to read key presses immediately
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

  enterAlternateBuffer();
  clearScrollback();
  hideCursor();
  clearScreen();

    // render a simple full-screen layout
    function render() {
      const header = renderHeader();
      const cols = process.stdout.columns || 80;
      const rows = process.stdout.rows || 24;

      // Center a welcome message
      const title = 'Welcome to Maven CLI';
      const subtitle = 'Press Q or Ctrl+C to quit';

      const contentLines: string[] = [];
      // Reserved lines: header + footer (2)
      const bodyRows = Math.max(0, rows - 4);

      const topPad = Math.floor((bodyRows - 2) / 2);
      for (let i = 0; i < topPad; i++) contentLines.push('');

      const pad = Math.max(0, Math.floor((cols - title.length) / 2));
      contentLines.push(' '.repeat(pad) + title);
      contentLines.push(' '.repeat(Math.max(0, Math.floor((cols - subtitle.length) / 2))) + subtitle);

      while (contentLines.length < bodyRows) contentLines.push('');

      // build full screen
      const lines = [header, ...contentLines, ''];
      process.stdout.write('\x1b[H');
      process.stdout.write(joinLines(lines));
    }

    render();

    function onData(chunk: string) {
      if (!chunk) return;
      // Ctrl+C
      if (chunk === '\u0003') {
        cleanup();
        return;
      }
      const key = chunk.toLowerCase();
      if (key === 'q' || key === 'q\r' || key === 'q\n') {
        cleanup();
        return;
      }
      // ignore other control sequences for now
    }

    process.stdin.on('data', onData as any);

    function onResize() {
      clearScreen();
      render();
    }
    process.stdout.on('resize', onResize as any);

    // ensure cleanup on unexpected exits
    const sigintHandler = () => cleanup();
    const sigtermHandler = () => cleanup();
    process.once('SIGINT', sigintHandler);
    process.once('SIGTERM', sigtermHandler);
  });
}

export default runStartView;
