// routes/member.js
import express from 'express';
import { auth, db } from '../firebaseAdmin.js'; // Firebase Admin SDK
import { getAuth } from 'firebase-admin/auth';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email is already registered
    const existingUser = await getAuth().getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Save additional info in Firestore
    await db.collection('members').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Member created', uid: userRecord.uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
