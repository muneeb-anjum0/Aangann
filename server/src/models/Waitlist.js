// Waitlist model helper
import { db } from '../lib/firebase.js';
const WAITLIST_COLLECTION = 'waitlist';

async function saveWaitlist(data) {
  const now = new Date();
  const waitlistData = { ...data, createdAt: now };
  const docRef = await db.collection(WAITLIST_COLLECTION).add(waitlistData);
  return { id: docRef.id, ...waitlistData };
}

export default { saveWaitlist };
