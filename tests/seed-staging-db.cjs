const { initFirebaseAdmin } = require('../api/_utils/firebase.js');
require('dotenv').config({ path: '.env.test' });

async function seed() {
  const IS_DRY_RUN = process.env.DRY_RUN !== 'false';

  console.log('--- STAGING DATABASE SEEDER ---');
  console.log(`Mode: ${IS_DRY_RUN ? 'DRY RUN (No writes)' : 'ACTUAL WRITE'}`);

  // 1. SAFETY GATES
  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const DATABASE_URL = process.env.VITE_FIREBASE_DATABASE_URL;

  if (PROJECT_ID !== 'saltwater-electricity-staging') {
    console.error('❌ SAFETY ERROR: Invalid Project ID. Refusing to run.');
    process.exit(1);
  }
  if (!DATABASE_URL || DATABASE_URL !== 'https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app/') {
    console.error('❌ SAFETY ERROR: Invalid Database URL. Refusing to run.');
    process.exit(1);
  }

  console.log(`✅ Safety Gates Passed: Targeting ${PROJECT_ID}`);

  try {
    const { db, auth } = initFirebaseAdmin();

    const testIdentities = [
      {
        email: process.env.TEST_USER_SUPERADMIN_EMAIL,
        role: 'superAdmin',
        isPrivate: true,
        requiresPasswordChange: false,
        name: 'Superadmin Test'
      },
      {
        email: process.env.TEST_USER_ADMIN_EMAIL,
        role: 'admin',
        isPrivate: false,
        requiresPasswordChange: true,
        name: 'Admin Test'
      },
      {
        email: process.env.TEST_USER_RESIDENT_A_EMAIL,
        role: 'user',
        isPrivate: false,
        requiresPasswordChange: true,
        name: 'Resident A Test'
      },
      {
        email: process.env.TEST_USER_RESIDENT_B_EMAIL,
        role: 'user',
        isPrivate: false,
        requiresPasswordChange: true,
        name: 'Resident B Test'
      }
    ];

    const updates = {};

    for (const identity of testIdentities) {
      if (!identity.email) {
        console.error(`❌ Missing email for ${identity.name}. Skipping.`);
        continue;
      }

      // Resolve actual Firebase Auth UID
      const userRecord = await auth.getUserByEmail(identity.email);
      const uid = userRecord.uid;

      console.log(`\nProcessing ${identity.name} (${uid})`);

      // /users/{uid}
      updates[`users/${uid}`] = {
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        suffix: '',
        gender: 'Not Specified',
        email: identity.email.toLowerCase().trim(),
        mobileNum: 'N/A',
        address: {
          street: 'Unset',
          baranggay: 'Unset',
          cityProvince: 'Unset',
          region: 'Unset',
          zipCode: '',
        },
        isPrivate: identity.isPrivate,
        updatedAt: new Date().toISOString(),
      };

      // /roles/{uid}
      updates[`roles/${uid}`] = {
        role: identity.role,
        isPrivate: identity.isPrivate,
        updatedAt: new Date().toISOString(),
      };

      // /accounts/{uid}
      updates[`accounts/${uid}`] = {
        userId: uid,
        status: 'active',
        requiresPasswordChange: identity.requiresPasswordChange,
        isPrivate: identity.isPrivate,
        createdAt: new Date().toISOString(),
      };
    }

    if (IS_DRY_RUN) {
      console.log('\n--- DRY RUN PLAN ---');
      Object.entries(updates).forEach(([path, data]) => {
        console.log(`Write to ${path}:`, JSON.stringify(data));
      });
      console.log('\nDry run complete. No data was written.');
    } else {
      await db.ref().update(updates);
      console.log('\n✅ DATABASE SEEDED SUCCESSFULLY');
    }

  } catch (error) {
    console.error('\n❌ SEED ERROR:', error.message);
    process.exit(1);
  }
}

seed();
