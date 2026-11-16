import fs from 'fs';

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const PUBLIC_KEY = env.ROSGAY_PUBLIC_KEY || 'pk782d3531fdadc9e2356cd386ecd65bd9a9e23706';
const SECRET_KEY = env.ROSGAY_SECRET_KEY || 'ske7f0e26c022422a162ea4e89fed18c53b73a78b2';
const BASE_URL = env.ROSGAY_API_BASE || 'https://rosgayshop.com/api';

console.log('Initiating Rosgay Shop API Discovery with native fetch...');

async function main() {
  console.log(`Connecting to: ${BASE_URL}/generate/authorization-token`);
  const authRes = await fetch(`${BASE_URL}/generate/authorization-token`, {
    method: 'POST',
    headers: {
      'PublicKey': PUBLIC_KEY,
      'SecretKey': SECRET_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const authData = await authRes.json();
  console.log('Auth Response:', JSON.stringify(authData, null, 2));

  if (!authData.bearer_token) {
    console.error('Failed to get bearer token');
    return;
  }

  const token = authData.bearer_token;
  console.log(`\nBearer Token acquired: ${token.substring(0, 15)}...`);

  // Step 2: Probing candidate endpoints
  const candidates = [
    // User & Profile
    'user',
    'profile',
    'me',
    'wallet',
    'wallet/balance',
    'balance',
    'user/profile',
    'user/wallet',
    'user/balance',
    'account',
    
    // Services & Catalog
    'services',
    'products',
    'categories',
    'topups',
    'topup',
    'direct-topup',
    'direct-topup/services',
    'direct-topup/products',
    'direct-topup/1',
    'cards',
    'vouchers',
    'packages',
    'games',
    
    // Orders
    'orders',
    'order',
    'order/history',
    'orders/history',
    'transactions',
    'order/create',
    'order/place',
    'direct-topup/order',
    
    // Tools
    'uid-check',
    'check-id',
    'check-player'
  ];

  console.log('\n--- Probing GET Endpoints ---');
  for (const ep of candidates) {
    try {
      const res = await fetch(`${BASE_URL}/${ep}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const contentType = res.headers.get('content-type') || '';
      let bodyPreview = '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        bodyPreview = JSON.stringify(json).substring(0, 200);
      } else {
        bodyPreview = `[Non-JSON: ${res.status}]`;
      }

      if (res.status !== 404 && !bodyPreview.includes('<!DOCTYPE')) {
        console.log(`[${res.status}] GET /api/${ep} -> ${bodyPreview}`);
      }
    } catch (e) {
      // ignore
    }
  }

  console.log('\n--- Probing POST Endpoints (Empty JSON Payload) ---');
  const postCandidates = [
    'user',
    'profile',
    'wallet/balance',
    'order',
    'orders',
    'order/create',
    'order/place',
    'direct-topup/order',
    'services',
    'products',
    'uid-check'
  ];

  for (const ep of postCandidates) {
    try {
      const res = await fetch(`${BASE_URL}/${ep}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({})
      });

      const contentType = res.headers.get('content-type') || '';
      let bodyPreview = '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        bodyPreview = JSON.stringify(json).substring(0, 200);
      } else {
        bodyPreview = `[Non-JSON: ${res.status}]`;
      }

      if (res.status !== 404 && !bodyPreview.includes('<!DOCTYPE')) {
        console.log(`[${res.status}] POST /api/${ep} -> ${bodyPreview}`);
      }
    } catch (e) {
      // ignore
    }
  }
}

main().catch(console.error);
