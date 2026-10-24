const https = require('https');

const RTDB_URL = 'saltwater-electricity-default-rtdb.asia-southeast1.firebasedatabase.app';
const RESIDENT_UID = '1Fh97TwuM1PTQLz4708xuh45Xen1';

function fetchPath(path) {
  return new Promise((resolve) => {
    https.get(`https://${RTDB_URL}${path}.json`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Parse Error' });
        }
      });
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function run() {
  console.log('--- Resident Profile ---');
  console.log('Users:', await fetchPath(`/users/${RESIDENT_UID}`));
  console.log('Roles:', await fetchPath(`/roles/${RESIDENT_UID}`));
  console.log('Accounts:', await fetchPath(`/accounts/${RESIDENT_UID}`));
  
  console.log('\n--- Devices ---');
  const devices = await fetchPath('/device_information');
  if (devices && typeof devices === 'object') {
    const keys = Object.keys(devices);
    if (keys.length > 0) {
      console.log('Sample Device:', devices[keys[0]]);
    } else {
      console.log('No devices found.');
    }
  }

  console.log('\n--- Assignments ---');
  const assignments = await fetchPath('/device_assignments');
  if (assignments && typeof assignments === 'object') {
    const keys = Object.keys(assignments);
    if (keys.length > 0) {
      console.log('Sample Assignment:', assignments[keys[0]]);
    } else {
      console.log('No assignments found.');
    }
  }

  console.log('\n--- Notifications ---');
  console.log('Notifications:', await fetchPath(`/notifications/${RESIDENT_UID}`));
}

run();
