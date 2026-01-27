/**
 * Node.js 24 url.parse() deprecation test
 *
 * This script tests various scenarios that may trigger the url.parse() deprecation warning.
 */

import * as url from 'url';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('Axios version:', require('axios/package.json').version);
console.log('='.repeat(60));
console.log('');

// Test 1: Direct url.parse() usage (definitely triggers deprecation)
console.log('[Test 1] Direct url.parse() usage:');
console.log('-'.repeat(40));
try {
  const parsed = url.parse('https://example.com/path?query=value');
  console.log('Parsed URL:', parsed.href);
  console.log('Host:', parsed.host);
  console.log('Path:', parsed.path);
} catch (e) {
  if (e instanceof Error) {
    console.error('Error:', e.message);
  }
}
console.log('');

// Test 2: url.parse() with second argument (slashesDenoteHost)
console.log('[Test 2] url.parse() with slashesDenoteHost:');
console.log('-'.repeat(40));
try {
  const parsed = url.parse('//example.com/path', true);
  console.log('Parsed URL:', parsed);
} catch (e) {
  if (e instanceof Error) {
    console.error('Error:', e.message);
  }
}
console.log('');

// Test 3: url.resolve() (also deprecated)
console.log('[Test 3] url.resolve() usage (also deprecated):');
console.log('-'.repeat(40));
try {
  const resolved = url.resolve('https://example.com/a/b', '../c');
  console.log('Resolved URL:', resolved);
} catch (e) {
  if (e instanceof Error) {
    console.error('Error:', e.message);
  }
}
console.log('');

// Test 4: Recommended WHATWG URL API (no deprecation)
console.log('[Test 4] WHATWG URL API (recommended):');
console.log('-'.repeat(40));
try {
  const myUrl = new URL('https://example.com/path?query=value');
  console.log('URL:', myUrl.href);
  console.log('Host:', myUrl.host);
  console.log('Pathname:', myUrl.pathname);
  console.log('Search:', myUrl.search);
} catch (e) {
  if (e instanceof Error) {
    console.error('Error:', e.message);
  }
}
console.log('');

// Test 5: Axios with various configurations
console.log('[Test 5] Axios HTTP requests:');
console.log('-'.repeat(40));

interface HttpBinResponse {
  url: string;
  headers: Record<string, string>;
}

async function testAxios(): Promise<void> {
  try {
    // Basic request
    console.log('Making basic GET request...');
    await axios.get<HttpBinResponse>('https://httpbin.org/get');
    console.log('  -> Success');

    // Request with baseURL
    console.log('Making request with baseURL...');
    const client: AxiosInstance = axios.create({
      baseURL: 'https://httpbin.org',
    });
    await client.get<HttpBinResponse>('/get');
    console.log('  -> Success');

    // Request with proxy config (may trigger url.parse internally)
    console.log('Making request with explicit URL parsing scenario...');
    await axios<HttpBinResponse>({
      method: 'get',
      url: 'https://httpbin.org/get',
      params: { foo: 'bar' },
    });
    console.log('  -> Success');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Axios error:', error.message);
    }
  }
}

// Test 6: Check if follow-redirects (axios dependency) uses url.parse
console.log('[Test 6] Checking axios dependencies:');
console.log('-'.repeat(40));
try {
  require('follow-redirects');
  console.log('follow-redirects loaded (may use url.parse internally)');
} catch (e) {
  console.log('follow-redirects not directly accessible');
}
console.log('');

// Run async tests
testAxios().then(() => {
  console.log('');
  console.log('='.repeat(60));
  console.log('All tests completed');
  console.log('');
  console.log('Summary:');
  console.log('- url.parse() is deprecated in Node.js 24');
  console.log('- Use new URL() constructor instead');
  console.log('- Axios 1.x has migrated away from url.parse()');
  console.log('- Older Axios versions may still use url.parse()');
  console.log('='.repeat(60));
});
