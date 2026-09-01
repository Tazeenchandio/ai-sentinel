import { diffLines, Change } from 'diff';

export interface DiffSummaryResult {
  addedLinesCount: number;
  removedLinesCount: number;
  formattedDiff: string;
  isSignificant: boolean;
}

export function computeTextDiff(oldText: string, newText: string): DiffSummaryResult {
  if (!oldText && !newText) {
    return { addedLinesCount: 0, removedLinesCount: 0, formattedDiff: '', isSignificant: false };
  }

  const changes: Change[] = diffLines(oldText || '', newText || '');

  let addedLinesCount = 0;
  let removedLinesCount = 0;
  const lines: string[] = [];

  for (const change of changes) {
    const rawLines = change.value.split('\n').filter((l) => l.length > 0);
    if (change.added) {
      addedLinesCount += rawLines.length;
      rawLines.forEach((l) => lines.push(`+ ${l}`));
    } else if (change.removed) {
      removedLinesCount += rawLines.length;
      rawLines.forEach((l) => lines.push(`- ${l}`));
    } else {
      // Unchanged lines (sample up to 2 for context)
      if (rawLines.length > 3) {
        lines.push(`  ${rawLines[0]}`);
        lines.push(`  ... (${rawLines.length - 2} unchanged lines) ...`);
        lines.push(`  ${rawLines[rawLines.length - 1]}`);
      } else {
        rawLines.forEach((l) => lines.push(`  ${l}`));
      }
    }
  }

  const totalDiffLength = addedLinesCount + removedLinesCount;
  // A diff is considered deterministic-significant if there are actual line additions/deletions of substance (> 10 chars)
  const isSignificant = totalDiffLength > 0 && (addedLinesCount > 0 || removedLinesCount > 0);

  return {
    addedLinesCount,
    removedLinesCount,
    formattedDiff: lines.join('\n'),
    isSignificant,
  };
}
