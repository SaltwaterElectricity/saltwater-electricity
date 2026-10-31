import { sanitizeError } from '../api/_utils/outbox.js';

const testCases = [
  { name: 'Simple Bearer', input: 'Authorization: Bearer secret123', expected: 'Authorization: ***' },
  { name: 'Quoted Bearer', input: '"Authorization": "Bearer secret123"', expected: 'Authorization: ***' },
  { name: 'Basic Auth', input: 'Authorization: Basic dXNlcjpwYXNz', expected: 'Authorization: ***' },
  { name: 'x-api-key', input: 'x-api-key: my-secret-key-123', expected: 'x-api-key: ***' },
  { name: 'Mixed case x-api-key', input: 'X-API-KEY: my-secret-key-123', expected: 'x-api-key: ***' },
  { name: 'Special chars in key', input: 'x-api-key: secret+123/abc=def%ghi', expected: 'x-api-key: ***' },
  { name: 'Generic secret', input: 'api_key=secret123', expected: ': [REDACTED]' },
  { name: 'Generic token', input: 'token: secret-token-xyz', expected: ': [REDACTED]' },
  { name: 'Generic password', input: 'password: mypassword123', expected: ': [REDACTED]' },
  { name: 'Mixed casing token', input: 'ToKeN: secret123', expected: ': [REDACTED]' },
  { name: 'Whitespace in secret', input: 'secret: key with space', expected: ': [REDACTED]' },
  { name: 'Private key mock', input: '[REDACTED PRIVATE KEY]', expected: '[PRIVATE KEY REDACTED]' },
  { name: 'Axios-like error', input: '{"message":"Request failed","config":{"headers":{"Authorization":"Bearer secret"}}}', expected: 'Authorization: ***' },
];

let passed = 0;
testCases.forEach(tc => {
  const result = sanitizeError(tc.input);
  const isPassed = result && result.includes(tc.expected);
  if (isPassed) {
    passed++;
  } else {
    console.log(`FAIL: ${tc.name} | Input: ${tc.input} | Result: ${result} | Expected: ${tc.expected}`);
  }
});

console.log(`\nResults: ${passed}/${testCases.length} passed`);
if (passed < testCases.length) process.exit(1);
