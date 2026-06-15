const admin = require('firebase-admin');

let bucket = null;

const initFirebaseAdmin = () => {
    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(
            Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        bucket = admin.storage().bucket();
        console.log("✅ Firebase Admin inicializado");
    }
    return bucket;
};

const getBucket = () => {
    if (!bucket) return initFirebaseAdmin();
    return bucket;
};

module.exports = { initFirebaseAdmin, getBucket };