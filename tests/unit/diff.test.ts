import { computeTextDiff } from '../../src/lib/utils/diff';

describe('Diff Utility', () => {
  it('should detect added lines correctly', () => {
    const oldText = 'Line 1\nLine 2';
    const newText = 'Line 1\nLine 2\nLine 3 Addition';
    const result = computeTextDiff(oldText, newText);
    expect(result.isSignificant).toBe(true);
    expect(result.addedLinesCount).toBeGreaterThanOrEqual(1);
    expect(result.formattedDiff).toContain('+ Line 3 Addition');
  });

  it('should handle identical texts without false positive diffs', () => {
    const text = 'Stable content string';
    const result = computeTextDiff(text, text);
    expect(result.isSignificant).toBe(false);
    expect(result.addedLinesCount).toBe(0);
  });
});
