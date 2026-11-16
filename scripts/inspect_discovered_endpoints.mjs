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

  console.log('=== 1. /api/top-up/list ===');
  const topUpListRes = await fetch(`${BASE_URL}/top-up/list`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const topUpListData = await topUpListRes.json();
  fs.writeFileSync('scripts/topup_list.json', JSON.stringify(topUpListData, null, 2));
  console.log('Saved top-up list. Items count:', topUpListData.message?.items?.length || topUpListData.message?.length);
  if (topUpListData.message?.items) {
    console.log('Sample games:', topUpListData.message.items.slice(0, 5).map(g => ({ id: g.id, name: g.name, slug: g.slug })));
  }

  console.log('\n=== 2. Probing Top-up Details & Order Endpoints ===');
  const topupProbes = [
    'top-up/order',
    'top-up/orders',
    'top-up/details/1',
    'top-up/1',
    'top-up/services/1',
    'get-top-up',
    'get-top-up/1',
    'top-up/check-player',
    'top-up/check-player-name',
    'check-player-name',
    'card/order'
  ];

  for (const ep of topupProbes) {
    // GET
    const rGet = await fetch(`${BASE_URL}/${ep}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    if (rGet.status !== 404 && rGet.status !== 302) {
      const text = await rGet.text();
      console.log(`[GET ${rGet.status}] /api/${ep} -> ${text.substring(0, 150)}`);
    }

    // POST
    const rPost = await fetch(`${BASE_URL}/${ep}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({})
    });
    if (rPost.status !== 404 && rPost.status !== 302 && rPost.status !== 405) {
      const text = await rPost.text();
      console.log(`[POST ${rPost.status}] /api/${ep} -> ${text.substring(0, 150)}`);
    } else if (rPost.status === 405) {
      const text = await rPost.text();
      if (!text.includes('GET, HEAD')) {
        console.log(`[POST 405] /api/${ep} -> ${text.substring(0, 100)}`);
      }
    }
  }
}

main().catch(console.error);
