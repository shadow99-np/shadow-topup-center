import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const PUBLIC_KEY = env.ROSGAY_PUBLIC_KEY;
const SECRET_KEY = env.ROSGAY_SECRET_KEY;
const BASE_URL = 'https://rosgayshop.com';

async function main() {
  const authRes = await fetch(`${BASE_URL}/api/generate/authorization-token`, {
    method: 'POST',
    headers: {
      'PublicKey': PUBLIC_KEY,
      'SecretKey': SECRET_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const authData = await authRes.json();
  const token = authData.bearer_token;
  console.log('Token ready:', token.substring(0, 15));

  // Check prefixes
  const prefixes = [
    'api/v1',
    'api/v2',
    'api/user',
    'api/reseller',
    'api/partner',
    'api/merchant',
    'api/app',
    'api'
  ];

  const subroutes = [
    'orders',
    'order',
    'topup',
    'direct-topup',
    'services',
    'products',
    'categories',
    'games',
    'wallet',
    'balance',
    'history',
    'transactions',
    'create-order',
    'place-order',
    'make-order',
    'order-now',
    'direct-topup/order',
    'topup/order'
  ];

  for (const prefix of prefixes) {
    for (const sub of subroutes) {
      const path = `${prefix}/${sub}`;
      try {
        const res = await fetch(`${BASE_URL}/${path}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.status !== 404 && res.status !== 302) {
          const txt = await res.text();
          console.log(`[GET ${res.status}] /${path} -> ${txt.substring(0, 150)}`);
        }
      } catch (e) {}

      try {
        const res = await fetch(`${BASE_URL}/${path}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({})
        });
        if (res.status !== 404 && res.status !== 302 && res.status !== 405) {
          const txt = await res.text();
          console.log(`[POST ${res.status}] /${path} -> ${txt.substring(0, 150)}`);
        } else if (res.status === 405) {
          const txt = await res.text();
          if (!txt.includes('GET, HEAD')) {
            console.log(`[POST 405 allowed methods] /${path} -> ${txt.substring(0, 120)}`);
          }
        }
      } catch (e) {}
    }
  }

  // Also check if Bearer token can access /direct-topup/order or /user/... with Accept: application/json
  const webEndpoints = [
    'direct-topup/order',
    'user/direct-topup/order',
    'user/order',
    'user/orders',
    'user/topup-history',
    'user/wallet',
    'user/wallet/balance',
    'axios/nav-search'
  ];

  console.log('\n--- Checking Web Endpoints with Bearer Token ---');
  for (const ep of webEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}/${ep}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (res.status !== 404 && res.status !== 302 && res.status !== 405) {
        const txt = await res.text();
        console.log(`[POST ${res.status}] /${ep} -> ${txt.substring(0, 150)}`);
      }
    } catch (e) {}
  }
}

main().catch(console.error);
