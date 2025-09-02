// Contact model helper
import { db } from '../lib/firebase.js';
const CONTACT_COLLECTION = 'contacts';

async function saveContact(data) {
  const now = new Date();
  const contactData = { ...data, createdAt: now };
  const docRef = await db.collection(CONTACT_COLLECTION).add(contactData);
  return { id: docRef.id, ...contactData };
}

export default { saveContact };
