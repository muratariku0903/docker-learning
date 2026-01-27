/**
 * Test follow-redirects package directly
 * This package is used internally by Axios and may use url.parse()
 */

import { https } from 'follow-redirects';
import type { IncomingMessage } from 'http';

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('follow-redirects version:', require('follow-redirects/package.json').version);
console.log('='.repeat(60));
console.log('');

interface FollowRedirectsResponse extends IncomingMessage {
  responseUrl: string;
}

// Test 1: follow-redirects with URL string
console.log('[Test 1] follow-redirects with URL string:');
console.log('-'.repeat(40));

const testUrl = 'https://httpbin.org/get';

https.get(testUrl, (response: FollowRedirectsResponse) => {
  console.log('Status:', response.statusCode);
  console.log('Redirect URL:', response.responseUrl);

  let data = '';
  response.on('data', (chunk: Buffer) => (data += chunk.toString()));
  response.on('end', () => {
    console.log('Response received, length:', data.length);
    console.log('');

    // Test 2: follow-redirects with redirect
    console.log('[Test 2] follow-redirects with redirect:');
    console.log('-'.repeat(40));

    https.get('https://httpbin.org/redirect/2', (res: FollowRedirectsResponse) => {
      console.log('Final status:', res.statusCode);
      console.log('Final URL:', res.responseUrl);

      let data2 = '';
      res.on('data', (chunk: Buffer) => (data2 += chunk.toString()));
      res.on('end', () => {
        console.log('');
        console.log('='.repeat(60));
        console.log('Tests completed');
        console.log('='.repeat(60));
      });
    }).on('error', (e: Error) => console.error('Error:', e.message));
  });
}).on('error', (e: Error) => console.error('Error:', e.message));
