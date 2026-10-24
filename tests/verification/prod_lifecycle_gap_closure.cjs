const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const PROD_CONFIG = {
  apiKey: 'AIzaSyCoivKDivjYhaNbUHzxhYxV4s-0wExfd4Y',
  authDomain: 'saltwater-electricity.firebaseapp.com',
  databaseURL: 'https://saltwater-electricity-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'saltwater-electricity',
  storageBucket: 'saltwater-electricity.firebasestorage.app',
  messagingSenderId: '458768011751',
  appId: '1:458768011751:web:3dede021e83986b899ad42',
};

async function run() {
  const app = initializeApp(PROD_CONFIG);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const resEmail = process.env.PRODUCTION_TEST_RESIDENT_B_EMAIL;
  const resPass = process.env.PRODUCTION_TEST_RESIDENT_B_PASSWORD;
  const residentUid = '1Fh97TwuM1PTQLz4708xuh45Xen1';

  try {
    console.log('Authenticating resident...');
    await signInWithEmailAndPassword(auth, resEmail.toLowerCase().trim(), resPass);
    
    console.log(`Checking /accounts/${residentUid}...`);
    try {
      const accountSnap = await get(ref(db, `accounts/${residentUid}`));
      if (accountSnap.exists()) {
        const data = accountSnap.val();
        console.log('ACCOUNT_DATA_FOUND');
        console.log(`status: ${data.status}`);
        console.log(`requiresPasswordChange: ${data.requiresPasswordChange}`);
      } else {
        console.log('ACCOUNT_DATA_NOT_FOUND');
      }
    } catch (e) {
      console.log(`READ_ERROR: ${e.code || e.message}`);
    }
  } catch (error) {
    console.error('CRITICAL_ERROR:', error.message);
  } finally {
    await signOut(auth).catch(() => {});
  }
}

run();
