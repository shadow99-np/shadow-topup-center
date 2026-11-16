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

  console.log('Testing payload formats for /api/top-up/make-order:');

  // Test 1: JSON with various field names
  const testPayloads = [
    { name: 'empty', body: {} },
    { name: 'uid string', body: { uid: '1849102941' } },
    { name: 'uid as object/array', body: { uid: ['1849102941'] } },
    { name: 'uid + service_id', body: { uid: '1849102941', service_id: 1, top_up_id: 1 } },
    { name: 'uid + serviceId', body: { uid: '1849102941', serviceId: 1, topUpId: 1 } },
    { name: 'order_information', body: { service_id: 1, top_up_id: 1, order_information: { Uid: '1849102941' } } }
  ];

  for (const t of testPayloads) {
    const res = await fetch(`${BASE_URL}/top-up/make-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(t.body)
    });

    const json = await res.json();
    console.log(`[JSON ${t.name}] ->`, json);
  }

  // Test 2: URLSearchParams (form urlencoded)
  const form = new URLSearchParams();
  form.append('uid', '1849102941');
  form.append('service_id', '1');
  form.append('top_up_id', '1');

  const resForm = await fetch(`${BASE_URL}/top-up/make-order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: form.toString()
  });

  console.log('[FORM-URLENCODED] ->', await resForm.json());
}

main().catch(console.error);
