/**
 * AWS SDK v2 の url.parse() 使用を検証
 */

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('='.repeat(60));
console.log('');

async function testAwsSdkV2(): Promise<void> {
  console.log('[Test] AWS SDK v2 internal url.parse usage:');
  console.log('-'.repeat(40));

  try {
    // AWS SDK v2 の util モジュールを直接インポート
    const AWS = await import('aws-sdk');

    // AWS SDK v2 の内部ユーティリティを取得
    const util = (AWS as any).util;

    if (util && util.urlParse) {
      console.log('Testing AWS.util.urlParse() (uses url.parse internally)...');

      // これは url.parse を内部で呼び出す
      const parsed = util.urlParse('https://s3.ap-northeast-1.amazonaws.com/bucket/key');
      console.log('Parsed URL:', {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        pathname: parsed.pathname,
      });
    }

    console.log('');

    // S3 endpoint construction (uses url.parse)
    console.log('Testing S3 endpoint construction...');
    AWS.default.config.update({
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      },
    });

    const s3 = new AWS.default.S3();

    // getSignedUrl は内部で url.parse を使用する可能性がある
    console.log('Generating presigned URL...');
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'test-bucket',
      Key: 'test-key',
      Expires: 60,
    });
    console.log('Presigned URL generated (length):', signedUrl.length);

    console.log('');

    // HTTP リクエストを作成（実際には送信しない）
    console.log('Creating S3 request object...');
    const request = s3.getObject({ Bucket: 'test-bucket', Key: 'test-key' });
    console.log('Request endpoint:', request.httpRequest?.endpoint?.href);

  } catch (e) {
    if (e instanceof Error) {
      console.error('Error:', e.message);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Test completed');
  console.log('='.repeat(60));
}

testAwsSdkV2();
