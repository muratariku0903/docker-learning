import axios, { AxiosResponse } from 'axios';

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('Axios version:', require('axios/package.json').version);
console.log('='.repeat(60));
console.log('');

interface HttpBinResponse {
  args: Record<string, string>;
  headers: Record<string, string>;
  origin: string;
  url: string;
}

async function testAxiosRequest(): Promise<void> {
  console.log('Testing Axios HTTP request...');
  console.log('');

  try {
    const response: AxiosResponse<HttpBinResponse> = await axios.get(
      'https://httpbin.org/get',
      {
        params: {
          test: 'node24-axios',
        },
      }
    );

    console.log('Response status:', response.status);
    console.log('Response URL:', response.config.url);
    console.log('');
    console.log('Request succeeded!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Request failed:', error.message);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Test completed');
  console.log('='.repeat(60));
}

async function testVariousUrls(): Promise<void> {
  const testUrls: string[] = [
    'https://httpbin.org/get',
    'https://httpbin.org/anything/test',
    'http://httpbin.org/get?foo=bar',
  ];

  console.log('');
  console.log('Testing various URL formats...');
  console.log('');

  for (const url of testUrls) {
    try {
      console.log(`Requesting: ${url}`);
      const response = await axios.get<HttpBinResponse>(url);
      console.log(`  -> Status: ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`  -> Error: ${error.message}`);
      }
    }
  }
}

(async (): Promise<void> => {
  await testAxiosRequest();
  await testVariousUrls();
})();
