// FAQ model helper
import { db } from '../lib/firebase.js';
const FAQ_COLLECTION = 'faqs';

async function saveFAQ(data) {
  const now = new Date();
  const faqData = { ...data, createdAt: now };
  const docRef = await db.collection(FAQ_COLLECTION).add(faqData);
  return { id: docRef.id, ...faqData };
}

export default { saveFAQ };
