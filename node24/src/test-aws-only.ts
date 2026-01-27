/**
 * AWS SDK v2 のみで url.parse() 警告を検証
 * (直接 url.parse() を呼び出さずに AWS SDK v2 だけ使用)
 */

console.log('='.repeat(60));
console.log('Node.js version:', process.version);
console.log('='.repeat(60));
console.log('');

async function testAwsSdkV2Only(): Promise<void> {
  console.log('[Test] AWS SDK v2 only (no direct url.parse call):');
  console.log('-'.repeat(40));

  try {
    const AWS = await import('aws-sdk');

    // util.urlParse を直接呼び出す（これは内部で url.parse を使用）
    const util = (AWS as any).util;

    console.log('1. Calling util.urlParse()...');
    const parsed1 = util.urlParse('https://s3.amazonaws.com/bucket/key');
    console.log('   Result:', parsed1.hostname);

    console.log('2. Calling util.urlParse() again...');
    const parsed2 = util.urlParse('https://lambda.us-east-1.amazonaws.com/functions');
    console.log('   Result:', parsed2.hostname);

    console.log('3. Calling util.urlParse() with different URL...');
    const parsed3 = util.urlParse('http://localhost:4566/test');
    console.log('   Result:', parsed3.hostname);

  } catch (e) {
    if (e instanceof Error) {
      console.error('Error:', e.message);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('If no DEP0169 warning appeared above,');
  console.log('AWS SDK v2 may have switched to WHATWG URL internally.');
  console.log('='.repeat(60));
}

testAwsSdkV2Only();
