import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

async function test() {
  console.log("Starting connection test...");
  try {
    initializeApp({
      projectId: "test-project",
      databaseURL: "http://127.0.0.1:9000"
    });
    const db = getDatabase();
    await db.ref("test").set({ foo: "bar" });
    console.log("Successfully wrote to emulator!");
    const snap = await db.ref("test").get();
    console.log("Read from emulator:", snap.val());
  } catch (e) {
    console.error("Connection failed:", e);
  }
  process.exit(0);
}
test();
