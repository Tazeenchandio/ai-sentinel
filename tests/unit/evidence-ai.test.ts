import { AIIntelligenceService } from '../../src/lib/ai/intelligence.service';

describe('Evidence-Grounded AI Intelligence Engine Unit Tests', () => {
  const baseParams = {
    watchName: 'Test Watch',
    target: 'https://github.com/test/repo',
    watchType: 'GITHUB_REPO',
    targetImportance: 'HIGH',
    aiInstructions: 'Only alert on security or breaking changes.',
    keywords: ['security', 'breaking'],
  };

  it('1. Confirmed security change: Should classify as security/CRITICAL when diff contains explicit CVE/GHSA', async () => {
    const result = await AIIntelligenceService.analyzeChange({
      ...baseParams,
      diffSummary: '+ CVE-2026-9999: Fixed buffer overflow vulnerability in auth module',
      normalizedBefore: 'Version 1.0.0',
      normalizedAfter: 'Version 1.0.1 - Fixes CVE-2026-9999 security vulnerability patch',
    });

    expect(result.category).toBe('security');
    expect(result.importance).toBe('CRITICAL');
    expect(result.isSecurityConfirmed).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('2. Normal release: Should NOT classify normal features as security', async () => {
    const result = await AIIntelligenceService.analyzeChange({
      ...baseParams,
      diffSummary: '+ Release v2.0.0: Added new UI toggle button for dark mode.',
      normalizedBefore: 'Version 1.9.0',
      normalizedAfter: 'Version 2.0.0 - Added new dark mode UI feature.',
    });

    expect(result.category).not.toBe('security');
    expect(result.importance).not.toBe('CRITICAL');
    expect(result.isSecurityConfirmed).toBe(false);
  });

  it('3. Documentation-only change: Should classify as documentation/LOW', async () => {
    const result = await AIIntelligenceService.analyzeChange({
      ...baseParams,
      diffSummary: '- Fixed typo in README.md\n+ Fixed formatting in README.md',
      normalizedBefore: 'README.md: Fix typo',
      normalizedAfter: 'README.md: Updated formatting',
    });

    expect(result.category).toBe('documentation');
    expect(result.importance).toBe('LOW');
  });

  it('4. Insufficient evidence: Should explicitly state insufficient evidence when diff lacks context', async () => {
    const result = await AIIntelligenceService.analyzeChange({
      ...baseParams,
      diffSummary: 'No line diff available.',
      normalizedBefore: '',
      normalizedAfter: 'insufficient_test_trigger',
    });

    expect(result.whyItMatters).toContain('Insufficient evidence');
    expect(result.confidence).toBeLessThan(0.70);
  });

  it('5. Breaking change: Should classify breaking API changes as breaking_change/HIGH', async () => {
    const result = await AIIntelligenceService.analyzeChange({
      ...baseParams,
      diffSummary: '- Deprecated legacy query params signature\n+ Removed API method v1',
      normalizedBefore: 'API v1 method signature',
      normalizedAfter: 'API v2 with breaking signature changes',
    });

    expect(result.category).toBe('breaking_change');
    expect(result.importance).toBe('HIGH');
  });

  it('6. False-positive security prevention: User instructions asking for security must NOT falsely label normal release as CRITICAL security', async () => {
    const result = await AIIntelligenceService.analyzeChange({
      ...baseParams,
      aiInstructions: 'ALERT ME IMMEDIATELY ABOUT ANY CRITICAL SECURITY VULNERABILITIES OR CVEs!',
      diffSummary: '+ Added optional helper method for date formatting.',
      normalizedBefore: 'v1.0',
      normalizedAfter: 'v1.1 - Minor helper additions',
    });

    expect(result.category).not.toBe('security');
    expect(result.importance).not.toBe('CRITICAL');
    expect(result.isSecurityConfirmed).toBe(false);
  });
});
