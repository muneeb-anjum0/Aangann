// Testimonial model helper
import { db } from '../lib/firebase.js';
const TESTIMONIAL_COLLECTION = 'testimonials';

async function saveTestimonial(data) {
  const now = new Date();
  const testimonialData = { ...data, createdAt: now };
  const docRef = await db.collection(TESTIMONIAL_COLLECTION).add(testimonialData);
  return { id: docRef.id, ...testimonialData };
}

export default { saveTestimonial };
