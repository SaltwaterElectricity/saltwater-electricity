
import { initFirebaseAdmin } from "./api/_utils/firebase.js";
import handler from "./api/sms/worker.js";
import { v4 as uuidv4 } from "uuid";

async function run() {
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.SMS_WORKER_SECRET = "secret";
  
  const { db } = initFirebaseAdmin();
  const msgId = "test_msg_" + Date.now();
  await db.ref(`sms_queue_v2/${msgId}`).set({
    status: "pending",
    sortKey: "100",
    submissionCount: 0
  });

  const req = {
    method: "POST",
    headers: { "x-worker-secret": "secret" },
    body: { cursor: "0" },
  };
  const res = {
    status: (c) => { res.statusCode = c; return res; },
    json: (d) => { res.body = d; return res; },
    setHeader: () => res,
  };

  await handler(req, res);
  console.log("Response:", res.statusCode, res.body);

  const final = await db.ref(`sms_queue_v2/${msgId}`).get();
  console.log("Final Record:", final.val());
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
