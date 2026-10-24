const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.test');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

console.log('KEYS_FOUND: ' + Object.keys(envConfig).join(', '));
