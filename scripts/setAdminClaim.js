// scripts/setAdminClaim.js
import admin from 'firebase-admin';
import fs from 'fs';

// Baca service account
const serviceAccount = JSON.parse(
  fs.readFileSync('./backend/serviceAccountKey.json', 'utf8')
);

// Inisialisasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// UID kamu langsung dimasukkan di sini
const uid = '2ZX5GyK6IhV6hYACVRsRkPQdhmm1';

(async () => {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Admin claim berhasil diberikan ke UID: ${uid}`);
    console.log('ℹ️ User harus logout & login ulang agar claim berlaku.');
  } catch (error) {
    console.error('❌ Gagal memberi admin claim:', error);
  } finally {
    process.exit(0);
  }
})();
