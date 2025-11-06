// simple data provider for UI (placeholder / WIP)
// move hardcoded lists here so views remain generic and easy to replace
export function getProjects(): string[] {
  // TODO: replace with real project discovery (workspace scan, config, etc.)
  // return placeholder empty list so views mark themselves WIP instead of showing hardcoded examples
  return [];
}

export function getGoalsForProject(_project: string): string[] {
  // TODO: fetch goals from project configuration (pom.xml, build config)
  return [];
}

export const DATA_WIP = true; // flag to indicate data is placeholder
