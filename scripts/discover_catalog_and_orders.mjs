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
const BASE_URL = env.ROSGAY_API_BASE || 'https://rosgayshop.com/api';

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

  const probeList = [
    // Direct topup variations
    'direct-topup',
    'direct-topups',
    'direct-topup-list',
    'direct-topup/order',
    'direct-topup/list',
    'direct-topup/all',
    'direct-topup/details',
    'direct-topup/services',
    'direct_topup',
    'topup',
    'topups',
    'top-up',
    'top-ups',
    'topup/order',
    'topup-order',
    'topups/order',

    // Order endpoints
    'order',
    'orders',
    'order/create',
    'order/store',
    'order/place',
    'order/submit',
    'orders/create',
    'orders/store',
    'orders/place',
    'orders/history',
    'order/history',
    'order-history',
    'user/orders',
    'user/order',
    'user/transactions',
    'user/wallet',
    'user/wallet/balance',

    // Products / Services / Categories / Games
    'products',
    'product',
    'services',
    'service',
    'service/list',
    'services/list',
    'categories',
    'category',
    'games',
    'game',
    'items',
    'item',
    'cards',
    'card',
    'giftcards',
    'gift-cards',
    'vouchers',
    'voucher',
    'packages',
    'package',

    // Specific endpoints
    'free-fire',
    'ff',
    'player-info',
    'check-player',
    'check-id',
    'get-services',
    'get-products'
  ];

  console.log('Testing GET and POST for candidates:');
  for (const route of probeList) {
    // Try GET
    try {
      const resGet = await fetch(`${BASE_URL}/${route}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (resGet.status !== 404 && resGet.status !== 302) {
        const text = await resGet.text();
        console.log(`[FOUND GET ${resGet.status}] /api/${route} -> ${text.substring(0, 160)}`);
      }
    } catch (e) {}

    // Try POST
    try {
      const resPost = await fetch(`${BASE_URL}/${route}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (resPost.status !== 404 && resPost.status !== 302 && resPost.status !== 405) {
        const text = await resPost.text();
        console.log(`[FOUND POST ${resPost.status}] /api/${route} -> ${text.substring(0, 160)}`);
      } else if (resPost.status === 405) {
        const text = await resPost.text();
        if (!text.includes('GET, HEAD')) {
          console.log(`[POST 405] /api/${route} -> ${text.substring(0, 100)}`);
        }
      }
    } catch (e) {}
  }
}

main().catch(console.error);
