
import fs from 'fs';
import dotenv from 'dotenv';
const config = dotenv.parse(fs.readFileSync('.env.test'));
console.log(Object.keys(config).join('\n'));
