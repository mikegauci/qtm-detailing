export function parseCarName(folderName: string): string {
  const idx = folderName.indexOf(" - ");
  return idx === -1 ? folderName.trim() : folderName.slice(0, idx).trim();
}
