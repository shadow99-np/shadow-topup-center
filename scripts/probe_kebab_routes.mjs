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
  console.log('Bearer Token obtained.');

  const verbs = ['get', 'order', 'create', 'check', 'list', 'all', 'user', 'service', 'product', 'category', 'direct', 'wallet'];
  const nouns = ['orders', 'order', 'products', 'product', 'services', 'service', 'categories', 'category', 'balance', 'profile', 'user', 'topup', 'top-up', 'direct-topup', 'direct-top-up', 'games', 'game', 'cards', 'card', 'vouchers', 'voucher', 'player', 'player-id', 'uid', 'history', 'transactions'];

  const testEndpoints = new Set();

  // Single words
  for (const n of nouns) {
    testEndpoints.add(n);
  }

  // verb-noun
  for (const v of verbs) {
    for (const n of nouns) {
      testEndpoints.add(`${v}-${n}`);
      testEndpoints.add(`${v}/${n}`);
      testEndpoints.add(`${n}-${v}`);
      testEndpoints.add(`${n}/${v}`);
    }
  }

  // specific domain combinations
  const specifics = [
    'generate/authorization-token',
    'direct-topup-order',
    'direct-topup/order',
    'direct-topup/details',
    'topup-order',
    'topup/order',
    'game-topup',
    'game-topup/order',
    'game-topup-order',
    'card-order',
    'card/order',
    'gift-card-order',
    'voucher-order',
    'check-player-name',
    'get-player-name',
    'player-name-check',
    'uid-check-proxy',
    'fetch-services',
    'fetch-products',
    'fetch-categories',
    'api-docs',
    'docs',
    'routes',
    'help'
  ];

  specifics.forEach(s => testEndpoints.add(s));

  console.log(`Testing ${testEndpoints.size} candidate endpoints...`);

  const results = [];
  for (const ep of testEndpoints) {
    try {
      // test GET
      const resGet = await fetch(`${BASE_URL}/${ep}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (resGet.status !== 404 && resGet.status !== 302) {
        const text = await resGet.text();
        results.push(`[GET ${resGet.status}] /api/${ep} -> ${text.substring(0, 140)}`);
      }

      // test POST
      const resPost = await fetch(`${BASE_URL}/${ep}`, {
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
        results.push(`[POST ${resPost.status}] /api/${ep} -> ${text.substring(0, 140)}`);
      }
    } catch (e) {}
  }

  console.log('\n=== DISCOVERY RESULTS ===');
  if (results.length === 0) {
    console.log('No additional endpoints found in this batch.');
  } else {
    results.forEach(r => console.log(r));
  }
}

main().catch(console.error);
