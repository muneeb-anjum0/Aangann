// Helper script to convert Firebase service account key to base64 for Vercel deployment
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  // Read the Firebase service account key file
  const serviceAccountPath = join(__dirname, 'firebaseServiceAccountKey.json');
  const serviceAccountKey = readFileSync(serviceAccountPath, 'utf8');
  
  // Convert to base64
  const base64Key = Buffer.from(serviceAccountKey).toString('base64');
  
  console.log('='.repeat(80));
  console.log('FIREBASE SERVICE ACCOUNT KEY (Base64 for Vercel):');
  console.log('='.repeat(80));
  console.log(base64Key);
  console.log('='.repeat(80));
  console.log('\nAdd this as FIREBASE_SERVICE_ACCOUNT_KEY environment variable in Vercel');
  
} catch (error) {
  console.error('Error reading Firebase service account key:', error.message);
  console.log('\nMake sure firebaseServiceAccountKey.json exists in the server directory');
}
