import dns from 'dns';
import { URL } from 'url';

const BLOCKED_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // AWS IMDS / Cloud Metadata
  /^0\./,
  /^::1$/,
  /^fe80:/i,
  /^fc00:/i,
  /^localhost$/i,
];

export interface SSRFCheckResult {
  allowed: boolean;
  reason?: string;
  url?: URL;
}

/**
 * Validates a target URL to prevent SSRF vulnerabilities.
 * Checks protocol, hostname, and resolves IP via DNS to ensure no private/internal addresses are queried.
 */
export async function validateTargetUrl(targetUrl: string): Promise<SSRFCheckResult> {
  try {
    const parsed = new URL(targetUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { allowed: false, reason: `Unsupported protocol: ${parsed.protocol}. Only http: and https: are allowed.` };
    }

    const hostname = parsed.hostname;

    // Check direct hostname string matching
    for (const pattern of BLOCKED_IP_RANGES) {
      if (pattern.test(hostname)) {
        return { allowed: false, reason: `Access to internal host "${hostname}" is forbidden.` };
      }
    }

    // Resolve DNS to verify destination IP address
    return new Promise((resolve) => {
      dns.lookup(hostname, { all: true }, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          // If DNS lookup fails, reject
          return resolve({ allowed: false, reason: `Failed to resolve hostname "${hostname}".` });
        }

        for (const addr of addresses) {
          const ip = addr.address;
          for (const pattern of BLOCKED_IP_RANGES) {
            if (pattern.test(ip)) {
              return resolve({
                allowed: false,
                reason: `Target hostname "${hostname}" resolves to blocked IP "${ip}".`,
              });
            }
          }
        }

        return resolve({ allowed: true, url: parsed });
      });
    });
  } catch (e: any) {
    return { allowed: false, reason: `Invalid URL format: ${e.message}` };
  }
}

/**
 * SSRF-Safe Fetch wrapper with timeout and maximum size limit.
 */
export async function safeFetch(
  targetUrl: string,
  options: RequestInit & { maxBytes?: number; timeoutMs?: number } = {}
): Promise<{ status: number; text: string; headers: Headers }> {
  const { maxBytes = 5 * 1024 * 1024, timeoutMs = 10000, ...fetchOptions } = options;

  const ssrfCheck = await validateTargetUrl(targetUrl);
  if (!ssrfCheck.allowed) {
    throw new Error(`SSRF Blocked: ${ssrfCheck.reason}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'User-Agent': 'AISentinel-Bot/1.0 (+https://ai-sentinel.dev)',
        ...(fetchOptions.headers || {}),
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const text = await response.text();
      return { status: response.status, text, headers: response.headers };
    }

    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedLength += value.length;
        if (receivedLength > maxBytes) {
          controller.abort();
          throw new Error(`Response size limit exceeded (${maxBytes} bytes max).`);
        }
        chunks.push(value);
      }
    }

    const text = Buffer.concat(chunks).toString('utf-8');
    return { status: response.status, text, headers: response.headers };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}
