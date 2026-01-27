/**
 * Force url.parse() deprecation warning reproduction
 *
 * This test forces the use of url.parse() to reproduce the deprecation warning
 * that may occur in certain scenarios with Axios/follow-redirects.
 */

import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('='.repeat(60));
console.log('');

console.log('[Setup] Forcing url.parse() usage in follow-redirects...');
console.log('');

interface RequestResult {
  status: number;
  data: string;
}

function makeRequestWithUrlParse(targetUrl: string): Promise<RequestResult> {
  return new Promise((resolve, reject) => {
    console.log(`Requesting: ${targetUrl}`);

    // This is similar to what older follow-redirects does
    const parsed = url.parse(targetUrl);
    console.log('Parsed with url.parse():', {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      path: parsed.path,
    });

    const protocol = parsed.protocol === 'https:' ? https : http;

    const req = protocol.request(
      {
        hostname: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : undefined,
        path: parsed.path,
        method: 'GET',
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => (data += chunk.toString()));
        res.on('end', () => {
          console.log('  -> Status:', res.statusCode);
          resolve({ status: res.statusCode || 0, data });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

function demonstrateUrlResolve(): void {
  console.log('[Test] url.resolve() deprecation:');
  console.log('-'.repeat(40));

  const base = 'https://httpbin.org/anything/';
  const relative = '../get?foo=bar';

  console.log('Base URL:', base);
  console.log('Relative:', relative);

  // This triggers DEP0169
  const resolved = url.resolve(base, relative);
  console.log('Resolved:', resolved);
  console.log('');
}

async function main(): Promise<void> {
  // Test 1: url.resolve deprecation
  demonstrateUrlResolve();

  // Test 2: url.parse deprecation
  console.log('[Test] url.parse() deprecation:');
  console.log('-'.repeat(40));

  try {
    await makeRequestWithUrlParse('https://httpbin.org/get?test=deprecation');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
  }

  console.log('');

  // Test 3: Multiple url.parse calls
  console.log('[Test] Multiple url.parse() calls:');
  console.log('-'.repeat(40));

  const urls: string[] = [
    'https://httpbin.org/headers',
    'https://httpbin.org/user-agent',
    'https://httpbin.org/ip',
  ];

  for (const u of urls) {
    try {
      await makeRequestWithUrlParse(u);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      }
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Test completed');
  console.log('');
  console.log('Note: DEP0169 warning should appear above if url.parse() was called.');
  console.log('The warning only appears once per process by default.');
  console.log('='.repeat(60));
}

main();
