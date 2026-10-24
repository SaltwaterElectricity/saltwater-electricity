const admin = require('firebase-admin');
const fs = require('fs');

// Use environment variables for credentials
const projectID = process.env.FIREBASE_PROJECT_ID;
const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL;

if (!projectID || !databaseURL) {
  console.error("Missing environment variables: FIREBASE_PROJECT_ID or VITE_FIREBASE_DATABASE_URL");
  process.exit(1);
}

// Initialize with a service account if provided in environment or using default application credentials
// Since I'm in the Claude environment, I'll check if GOOGLE_APPLICATION_CREDENTIALS is set or if I need to load from a file.
// For now, I'll attempt to initialize and let the environment handle the auth.
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: databaseURL
  });
} catch (e) {
  console.error("Initialization failed: " + e.message);
  process.exit(1);
}

const db = admin.database();

async function auditStructure(targetName) {
  console.log(`--- Audit for ${targetName} ---`);
  
  const rootSnap = await db.ref('/').once('value');
  const rootData = rootSnap.val();
  if (!rootData) {
    console.log("Database is empty.");
    return;
  }

  const topLevelKeys = Object.keys(rootData);
  console.log("Top-level nodes:", topLevelKeys.join(', '));

  // Focus on user-like nodes: users, accounts, user, account
  const userLikeKeys = topLevelKeys.filter(k => /user|account/i.test(k));
  
  for (const key of userLikeKeys) {
    console.log(`\nInspecting node: /${key}`);
    const nodeSnap = await db.ref(key).limitToFirst(5).once('value');
    const nodeData = nodeSnap.val();
    
    if (!nodeData) {
      console.log(`Node /${key} is empty.`);
      continue;
    }

    const uids = Object.keys(nodeData);
    console.log(`Found ${uids.length} sample records in /${key}`);
    
    for (const uid of uids) {
      const user = nodeData[uid];
      const children = Object.keys(user || {});
      console.log(`  UID: ${uid}`);
      console.log(`  Children: ${children.join(', ')}`);
      if (children.includes('username')) {
        console.log(`  [!] Found 'username' child`);
        // Report type and presence without reporting the actual value
        console.log(`  Username type: ${typeof user.username}`);
      }
    }
  }
}

auditStructure("Target");
