# UI Directory

This folder contains the UI skeleton for the maven-build-tool CLI.

Structure:

- `views/` - small, framework-agnostic view modules used by the CLI UI.
- `README.md` - this file.

Next steps:

- Add rendering glue (Ink) if we decide to use an interactive TUI later.
- Implement small views: Header, Footer, MainMenu, Status.
- Keep UI logic separated from CLI business logic.
