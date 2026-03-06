// routes/auth.js
import express from 'express';
import { auth } from '../firebaseAdmin.js'; // Firebase Admin SDK

const router = express.Router();

router.post('/verify', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    res.status(200).json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

