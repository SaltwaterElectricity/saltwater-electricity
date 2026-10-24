const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, 'sms-api-migration/.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const line = content.split('\n').find(l => l.startsWith('FIREBASE_PRIVATE_KEY='));
console.log('Key starts with:', line.substring(0, 50));
