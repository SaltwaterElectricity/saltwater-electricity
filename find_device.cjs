
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

async function findDevice() {
  const snap = await admin.database().ref('device_information').limitToFirst(1).once('value');
  if (snap.exists()) {
    const data = snap.val();
    const id = Object.keys(data)[0];
    console.log(`DEVICE_ID=${id}`);
    console.log(`DEVICE_TOKEN=${data[id].token}`);
  } else {
    console.log('No devices found');
  }
}
findDevice();
