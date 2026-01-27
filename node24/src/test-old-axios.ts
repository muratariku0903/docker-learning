/**
 * Test with older Axios versions that may use url.parse()
 *
 * Run this after installing an older version of axios:
 * npm install axios@0.27.2
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('Axios version:', require('axios/package.json').version);
console.log('='.repeat(60));
console.log('');

interface HttpBinResponse {
  url: string;
  headers: Record<string, string>;
  args?: Record<string, string>;
  data?: string;
}

async function testOldAxios(): Promise<void> {
  console.log('[Test] Making HTTP requests with current Axios version');
  console.log('-'.repeat(40));

  try {
    // These requests may trigger url.parse() in older Axios versions
    console.log('1. Simple GET request...');
    await axios.get<HttpBinResponse>('https://httpbin.org/get');
    console.log('   -> Success');

    console.log('2. GET with params...');
    await axios.get<HttpBinResponse>('https://httpbin.org/get', {
      params: { test: 'value', foo: 'bar' },
    });
    console.log('   -> Success');

    console.log('3. POST request...');
    await axios.post<HttpBinResponse>('https://httpbin.org/post', {
      data: 'test',
    });
    console.log('   -> Success');

    console.log('4. Request with custom headers...');
    await axios<HttpBinResponse>({
      method: 'GET',
      url: 'https://httpbin.org/headers',
      headers: {
        'X-Custom-Header': 'test',
      },
    });
    console.log('   -> Success');

    console.log('5. Request with baseURL...');
    const client: AxiosInstance = axios.create({
      baseURL: 'https://httpbin.org',
      timeout: 5000,
    });
    await client.get<HttpBinResponse>('/anything');
    console.log('   -> Success');

    // Test redirect following (follow-redirects may use url.parse)
    console.log('6. Request with redirect...');
    await axios.get<HttpBinResponse>('https://httpbin.org/redirect/1');
    console.log('   -> Success');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Tests completed');
  console.log('='.repeat(60));
}

testOldAxios();
