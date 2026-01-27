/**
 * Lambda環境をシミュレートしたテスト
 *
 * AWS SDK や Lambda ランタイムが url.parse() を使用している可能性を検証
 */

import axios from 'axios';

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('Axios version:', require('axios/package.json').version);
console.log('='.repeat(60));
console.log('');

// Lambda環境変数をシミュレート
process.env.AWS_LAMBDA_FUNCTION_NAME = 'test-function';
process.env.AWS_REGION = 'ap-northeast-1';
process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs24.x';

interface HttpBinResponse {
  url: string;
  headers: Record<string, string>;
}

async function testWithAwsSdk(): Promise<void> {
  console.log('[Test 1] AWS SDK v3 (S3Client):');
  console.log('-'.repeat(40));

  try {
    // AWS SDK v3 をダイナミックインポート
    const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3');

    const client = new S3Client({
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
      },
    });

    console.log('S3Client created successfully');
    console.log('Attempting to list buckets (will fail without real credentials)...');

    try {
      await client.send(new ListBucketsCommand({}));
    } catch (e) {
      if (e instanceof Error) {
        console.log('  -> Expected error:', e.name);
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      console.log('AWS SDK v3 not installed:', e.message);
    }
  }
  console.log('');

  console.log('[Test 2] AWS SDK v2 (legacy - likely uses url.parse):');
  console.log('-'.repeat(40));

  try {
    // AWS SDK v2 をダイナミックインポート
    const AWS = await import('aws-sdk');

    AWS.default.config.update({
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
      },
    });

    const s3 = new AWS.default.S3();
    console.log('AWS SDK v2 S3 client created');
    console.log('Attempting to list buckets...');

    try {
      await s3.listBuckets().promise();
    } catch (e) {
      if (e instanceof Error) {
        console.log('  -> Expected error:', e.name);
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      console.log('AWS SDK v2 not installed:', e.message);
    }
  }
  console.log('');

  console.log('[Test 3] Axios with AWS-style endpoints:');
  console.log('-'.repeat(40));

  try {
    // AWS APIスタイルのURLでリクエスト
    const endpoints = [
      'https://s3.ap-northeast-1.amazonaws.com',
      'https://lambda.ap-northeast-1.amazonaws.com',
      'https://dynamodb.ap-northeast-1.amazonaws.com',
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing: ${endpoint}`);
      try {
        await axios.get(endpoint, { timeout: 5000 });
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.log(`  -> ${e.response?.status || e.code || 'Error'}`);
        }
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error('Error:', e.message);
    }
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('Test completed');
  console.log('');
  console.log('Note: If you see DEP0169 warnings above, they may come from:');
  console.log('1. AWS SDK v2 (uses url.parse internally)');
  console.log('2. Lambda runtime libraries');
  console.log('3. Other AWS-related packages');
  console.log('='.repeat(60));
}

testWithAwsSdk();
