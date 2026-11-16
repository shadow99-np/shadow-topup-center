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
const BASE_URL = 'https://rosgayshop.com/api';

async function main() {
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
  const token = authData.bearer_token;

  const orderEndpoints = [
    'top-up/order',
    'top-up-order',
    'top-up/make-order',
    'top-up/order-now',
    'top-up/order/create',
    'top-up/order/store',
    'topup-order',
    'topup/order',
    'order/top-up',
    'order/topup',
    'direct-topup/order',
    'direct-topup-order',
    'card/order',
    'card-order',
    'order',
    'orders',
    'order/create',
    'order/store',
    'order-submit',
    'submit-order'
  ];

  console.log('Testing Top-up Order POST endpoints:');
  for (const ep of orderEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}/${ep}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          topUpId: 1,
          serviceId: 2,
          uid: '1849102941',
          playerId: '1849102941'
        })
      });

      const text = await res.text();
      console.log(`[POST ${res.status}] /api/${ep} -> ${text.substring(0, 160)}`);
    } catch (e) {
      console.error(ep, e.message);
    }
  }

  // Also test GET on them
  console.log('\nTesting Top-up Order GET endpoints:');
  for (const ep of orderEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}/${ep}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (res.status !== 404 && res.status !== 302) {
        const text = await res.text();
        console.log(`[GET ${res.status}] /api/${ep} -> ${text.substring(0, 160)}`);
      }
    } catch (e) {}
  }
}

main().catch(console.error);
