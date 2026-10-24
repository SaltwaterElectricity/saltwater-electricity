
import { initFirebaseAdmin } from './api/_utils/firebase.js';

async function readRecord() {
  try {
    const { db } = initFirebaseAdmin();
    const path = 'sms_queue_v2/-P4EW5VF0WRaqs_0HpjH';
    const snapshot = await db.ref(path).once('value');
    const data = snapshot.val();
    if (!data) {
      console.log('Record not found');
      return;
    }
    
    // Redact sensitive info
    const redacted = { ...data };
    if (redacted.recipient) {
      redacted.recipient = redacted.recipient.replace(/(\d{4})$/, '****');
    }
    
    console.log(JSON.stringify(redacted, null, 2));
  } catch (e) {
    console.error('Error reading record:', e.message);
    process.exit(1);
  }
}

readRecord();
