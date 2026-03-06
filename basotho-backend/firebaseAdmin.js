// firebaseAdmin.js
import admin from 'firebase-admin';
//import serviceAccount from "./BS-admin.json";
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync(new URL('./BS-admin.json', import.meta.url), 'utf8') // path to your downloaded key
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://basothobackend.firebaseio.com',
});

export const db = admin.firestore();
export const auth = admin.auth();
