/**
 * url.parse() 警告の発生源を特定するテスト
 *
 * Lambda環境で実際に使用している依存関係を追加して、
 * どのパッケージが url.parse() を呼び出しているか特定する
 */

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('='.repeat(60));
console.log('');
console.log('NOTE: DEP0169 warning should appear with stack trace.');
console.log('Check the stack trace to identify which package calls url.parse()');
console.log('');

// Lambda環境変数をシミュレート
process.env.AWS_LAMBDA_FUNCTION_NAME = 'test-function';
process.env.AWS_REGION = 'ap-northeast-1';

async function main(): Promise<void> {
  console.log('[Step 1] Loading AWS SDK v2...');
  const AWS = await import('aws-sdk');
  console.log('  -> Loaded');
  console.log('');

  console.log('[Step 2] Loading Axios...');
  const axios = await import('axios');
  console.log('  -> Loaded, version:', require('axios/package.json').version);
  console.log('');

  console.log('[Step 3] Making AWS SDK v2 call (triggers url.parse)...');
  AWS.default.config.update({
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
    },
  });
  const s3 = new AWS.default.S3();
  const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: 'test',
    Key: 'test',
  });
  console.log('  -> Presigned URL generated');
  console.log('');

  console.log('[Step 4] Making Axios request...');
  try {
    await axios.default.get('https://httpbin.org/get', { timeout: 5000 });
    console.log('  -> Request succeeded');
  } catch (e) {
    console.log('  -> Request failed (expected in some environments)');
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('Test completed');
  console.log('');
  console.log('If you see DEP0169 warning above, check the stack trace to');
  console.log('identify which package/line triggers url.parse()');
  console.log('');
  console.log('Common sources in Lambda:');
  console.log('- AWS SDK v2 (aws-sdk)');
  console.log('- AWS Lambda runtime');
  console.log('- http-proxy-agent / https-proxy-agent');
  console.log('- request / request-promise');
  console.log('- older versions of follow-redirects');
  console.log('='.repeat(60));
}

main();
