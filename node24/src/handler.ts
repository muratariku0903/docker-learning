/**
 * Lambda Handler - axios.get() での警告再現テスト
 */

import axios from 'axios';

interface LambdaEvent {
  url?: string;
}

interface LambdaContext {
  functionName: string;
  memoryLimitInMB: string;
  awsRequestId: string;
}

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const handler = async (
  event: LambdaEvent,
  context: LambdaContext
): Promise<LambdaResponse> => {
  console.log('Node.js version:', process.version);
  console.log('Axios version:', require('axios/package.json').version);
  console.log('Function:', context.functionName);
  console.log('');

  const targetUrl = event.url || 'https://httpbin.org/get';

  try {
    console.log(`Making axios.get() request to: ${targetUrl}`);
    const response = await axios.get(targetUrl);

    console.log('Response status:', response.status);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Success',
        nodeVersion: process.version,
        axiosVersion: require('axios/package.json').version,
        responseStatus: response.status,
      }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

// ローカル実行用
if (require.main === module) {
  const mockEvent: LambdaEvent = { url: 'https://httpbin.org/get' };
  const mockContext: LambdaContext = {
    functionName: 'test-function',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
  };

  handler(mockEvent, mockContext).then((result) => {
    console.log('');
    console.log('Result:', JSON.stringify(result, null, 2));
  });
}
