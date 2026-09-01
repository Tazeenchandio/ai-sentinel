import { validateTargetUrl } from '../../src/lib/security/ssrf';

describe('SSRF Protection Validation', () => {
  it('should allow valid public HTTPS URLs', async () => {
    const result = await validateTargetUrl('https://github.com/anthropic-ai/anthropic-sdk-typescript');
    expect(result.allowed).toBe(true);
  });

  it('should block localhost targets', async () => {
    const result = await validateTargetUrl('http://localhost:3000');
    expect(result.allowed).toBe(false);
  });

  it('should block private 127.0.0.1 IP targets', async () => {
    const result = await validateTargetUrl('http://127.0.0.1:8080');
    expect(result.allowed).toBe(false);
  });

  it('should block AWS metadata IP 169.254.169.254', async () => {
    const result = await validateTargetUrl('http://169.254.169.254/latest/meta-data/');
    expect(result.allowed).toBe(false);
  });

  it('should block non-HTTP/HTTPS protocols', async () => {
    const result = await validateTargetUrl('file:///etc/passwd');
    expect(result.allowed).toBe(false);
  });
});
