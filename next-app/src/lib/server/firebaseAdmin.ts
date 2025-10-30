import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace \n with actual newlines in private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminTimestamp = admin.firestore.FieldValue.serverTimestamp;
export const adminIncrement = admin.firestore.FieldValue.increment;
export const adminArrayUnion = admin.firestore.FieldValue.arrayUnion;

export default admin;

