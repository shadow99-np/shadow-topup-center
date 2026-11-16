import { Order, CartItem } from '@/types/marketplace';

const PUBLIC_KEY = process.env.ROSGAY_PUBLIC_KEY || 'pk782d3531fdadc9e2356cd386ecd65bd9a9e23706';
const SECRET_KEY = process.env.ROSGAY_SECRET_KEY || 'ske7f0e26c022422a162ea4e89fed18c53b73a78b2';
const BASE_URL = process.env.ROSGAY_API_BASE || 'https://rosgayshop.com/api';

// In-memory token cache to prevent unnecessary token generation on every request
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export interface RosgayPackageMapping {
  topUpId: number;
  serviceId: number;
  name: string;
  wholesaleCostNpr: number;
}

// Complete Product & Package Mapping to Rosgay Shop Catalog
export const ROSGAY_PACKAGE_MAPPINGS: Record<string, RosgayPackageMapping> = {
  // 1. Free Fire (Nepal & Bangladesh Server - topUpId: 1)
  'ff-weekly-lite': { topUpId: 1, serviceId: 7, name: 'WEEKLY LITE', wholesaleCostNpr: 70 },
  'ff-115': { topUpId: 1, serviceId: 2, name: '115 diamond', wholesaleCostNpr: 110 },
  'ff-weekly': { topUpId: 1, serviceId: 1, name: 'Weekly Membership', wholesaleCostNpr: 220 },
  'ff-240': { topUpId: 1, serviceId: 3, name: '240 diamond', wholesaleCostNpr: 220 },
  'ff-610': { topUpId: 1, serviceId: 4, name: '355 diamond', wholesaleCostNpr: 330 },
  'ff-monthly': { topUpId: 1, serviceId: 5, name: 'Monthly Membership', wholesaleCostNpr: 1050 },

  // 2. Mobile Legends (Nepal / Global - topUpId: 2)
  'ml-value-pack': { topUpId: 2, serviceId: 178, name: 'Super value pack', wholesaleCostNpr: 149 },
  'ml-55': { topUpId: 2, serviceId: 133, name: '55 diamonds', wholesaleCostNpr: 150 },
  'ml-86': { topUpId: 2, serviceId: 134, name: '86 diamonds', wholesaleCostNpr: 215 },
  'ml-172': { topUpId: 2, serviceId: 135, name: '172 diamonds', wholesaleCostNpr: 425 },
  'ml-257': { topUpId: 2, serviceId: 136, name: '257 diamonds', wholesaleCostNpr: 635 },
  'ml-706': { topUpId: 2, serviceId: 137, name: '706 diamonds', wholesaleCostNpr: 1700 },

  // 3. PUBG Mobile UC (topUpId: 3)
  'pubg-60': { topUpId: 3, serviceId: 25, name: '60 UC', wholesaleCostNpr: 160 },
  'pubg-325': { topUpId: 3, serviceId: 26, name: '325 UC', wholesaleCostNpr: 799 },
  'pubg-660': { topUpId: 3, serviceId: 27, name: '660 UC', wholesaleCostNpr: 1590 },

  // 4. Prepaid MasterCard / Virtual Dollar Card (topUpId: 16)
  'card-2usd': { topUpId: 16, serviceId: 106, name: '$2 USD Prepaid Card Code', wholesaleCostNpr: 360 },
  'card-5usd': { topUpId: 16, serviceId: 101, name: '$5 USD Prepaid Card Code', wholesaleCostNpr: 910 },
  'card-10usd': { topUpId: 16, serviceId: 102, name: '$10 USD Prepaid Card Code', wholesaleCostNpr: 1799 },
  'card-25usd': { topUpId: 16, serviceId: 103, name: '$25 USD Prepaid Card Code', wholesaleCostNpr: 4250 },
  'card-50usd': { topUpId: 16, serviceId: 104, name: '$50 USD Prepaid Card Code', wholesaleCostNpr: 8999 },
  'card-100usd': { topUpId: 16, serviceId: 105, name: '$100 USD Prepaid Card Code', wholesaleCostNpr: 17999 },

  // 5. Roblox Robux (topUpId: 5)
  'roblox-80': { topUpId: 5, serviceId: 34, name: '80 Robux', wholesaleCostNpr: 170 },
  'roblox-400': { topUpId: 5, serviceId: 35, name: '400 Robux', wholesaleCostNpr: 850 },
  'roblox-500': { topUpId: 5, serviceId: 36, name: '500 Robux', wholesaleCostNpr: 930 },
  'roblox-1000': { topUpId: 5, serviceId: 37, name: '1,000 Robux', wholesaleCostNpr: 1700 },
  'roblox-2000': { topUpId: 5, serviceId: 38, name: '2,000 Robux', wholesaleCostNpr: 3400 },
  'roblox-5000': { topUpId: 5, serviceId: 39, name: '5,000 Robux', wholesaleCostNpr: 8500 },
  'roblox-10000': { topUpId: 5, serviceId: 40, name: '10,000 Robux', wholesaleCostNpr: 17000 },

  // 6. eFootball Coins & Packs PES (topUpId: 22)
  'efoot-starter': { topUpId: 22, serviceId: 142, name: 'Starter Set (Silvestre + 50 Coins)', wholesaleCostNpr: 157 },
  'efoot-300': { topUpId: 22, serviceId: 145, name: '300 eFootball Coins', wholesaleCostNpr: 450 },
  'efoot-500': { topUpId: 22, serviceId: 146, name: '500 eFootball Coins', wholesaleCostNpr: 720 },
  'efoot-1000': { topUpId: 22, serviceId: 147, name: '1,000 eFootball Coins', wholesaleCostNpr: 1375 },
  'efoot-2000': { topUpId: 22, serviceId: 148, name: '2,000 eFootball Coins', wholesaleCostNpr: 2660 },
  'efoot-5000': { topUpId: 22, serviceId: 149, name: '5,000 eFootball Coins', wholesaleCostNpr: 6300 },
  'efoot-10000': { topUpId: 22, serviceId: 150, name: '10,000 eFootball Coins', wholesaleCostNpr: 12000 },

  // 7. Blood Strike (topUpId: 30)
  'bs-56': { topUpId: 30, serviceId: 222, name: '56 Golds', wholesaleCostNpr: 75 },
  'bs-116': { topUpId: 30, serviceId: 223, name: '116 Golds', wholesaleCostNpr: 145 },
  'bs-352': { topUpId: 30, serviceId: 224, name: '352 Golds', wholesaleCostNpr: 435 },
  'bs-594': { topUpId: 30, serviceId: 225, name: '594 Golds', wholesaleCostNpr: 725 },
  'bs-1210': { topUpId: 30, serviceId: 226, name: '1,210 Golds', wholesaleCostNpr: 1450 },
  'bs-2486': { topUpId: 30, serviceId: 227, name: '2,486 Golds', wholesaleCostNpr: 2900 },
  'bs-pass-elite': { topUpId: 30, serviceId: 229, name: 'Strike Pass Elite', wholesaleCostNpr: 600 },
  'bs-level-up': { topUpId: 30, serviceId: 231, name: 'Level Up Pass', wholesaleCostNpr: 320 },

  // 8. Where Winds Meet (topUpId: 25)
  'wwm-60': { topUpId: 25, serviceId: 167, name: '60 Echo Beads', wholesaleCostNpr: 154 },
  'wwm-180': { topUpId: 25, serviceId: 168, name: '180 Echo Beads', wholesaleCostNpr: 462 },
  'wwm-300': { topUpId: 25, serviceId: 169, name: '300 Echo Beads', wholesaleCostNpr: 770 },
  'wwm-600': { topUpId: 25, serviceId: 170, name: '600 Echo Beads', wholesaleCostNpr: 1540 },
  'wwm-monthly': { topUpId: 25, serviceId: 175, name: 'Monthly Pass', wholesaleCostNpr: 770 },
  'wwm-elite-bp': { topUpId: 25, serviceId: 176, name: 'Elite Battle Pass', wholesaleCostNpr: 1540 },
  'wwm-prem-bp': { topUpId: 25, serviceId: 177, name: 'Premium Battle Pass', wholesaleCostNpr: 3080 },

  // 9. ChatGPT Plus (topUpId: 10)
  'gpt-1m': { topUpId: 10, serviceId: 68, name: 'ChatGPT Plus 1 Month (Personal Account)', wholesaleCostNpr: 3100 },

  // 10. CapCut Pro (topUpId: 7)
  'capcut-1m': { topUpId: 7, serviceId: 50, name: '1 Month CapCut Pro Access', wholesaleCostNpr: 250 },
  'capcut-3m': { topUpId: 7, serviceId: 51, name: '3 Months CapCut Pro Access', wholesaleCostNpr: 650 },
  'capcut-1y': { topUpId: 7, serviceId: 52, name: '1 Year CapCut Pro Access', wholesaleCostNpr: 1600 },

  // 11. TikTok Coins (topUpId: 6)
  'tt-70': { topUpId: 6, serviceId: 44, name: '70 TikTok Coins', wholesaleCostNpr: 150 },
  'tt-350': { topUpId: 6, serviceId: 45, name: '350 TikTok Coins', wholesaleCostNpr: 720 },
  'tt-700': { topUpId: 6, serviceId: 46, name: '700 TikTok Coins', wholesaleCostNpr: 1420 },
  'tt-1400': { topUpId: 6, serviceId: 47, name: '1,400 TikTok Coins', wholesaleCostNpr: 2800 },
  'tt-3500': { topUpId: 6, serviceId: 48, name: '3,500 TikTok Coins', wholesaleCostNpr: 7000 },
};

/**
 * Generates or retrieves cached Bearer Token for Rosgay Shop API
 */
export async function getRosgayAuthToken(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    if (cachedToken && Date.now() < tokenExpiresAt) {
      return { success: true, token: cachedToken };
    }

    const res = await fetch(`${BASE_URL}/generate/authorization-token`, {
      method: 'POST',
      headers: {
        'PublicKey': PUBLIC_KEY,
        'SecretKey': SECRET_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await res.json();
    if (data.status === 'success' && data.bearer_token) {
      cachedToken = data.bearer_token;
      // Cache token for 1 hour (Sanctum tokens typically last 30+ days)
      tokenExpiresAt = Date.now() + 60 * 60 * 1000;
      return { success: true, token: cachedToken! };
    }

    return { success: false, error: data.message || 'Could not generate Rosgay authorization token.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error to Rosgay Shop.' };
  }
}

/**
 * Fetches user profile and live wholesale wallet balance from Rosgay Shop
 */
export async function getRosgayAccountStatus(): Promise<{
  success: boolean;
  balance?: number;
  username?: string;
  email?: string;
  name?: string;
  error?: string;
}> {
  const auth = await getRosgayAuthToken();
  if (!auth.success || !auth.token) {
    return { success: false, error: auth.error };
  }

  try {
    const res = await fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return { success: false, error: `Rosgay server responded with status: ${res.status}` };
    }

    const user = await res.json();
    return {
      success: true,
      balance: Number(user.balance || 0),
      username: user.username || 'Merchant',
      email: user.email || 'yadunepal8@gmail.com',
      name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Pukar Nepal',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch Rosgay account balance.' };
  }
}

/**
 * Dispatches an automated top-up order directly to Rosgay Shop
 */
export async function executeRosgayTopUpOrder(item: CartItem): Promise<{
  success: boolean;
  message: string;
  rawResponse?: any;
  requiredCost?: number;
  currentBalance?: number;
}> {
  // 1. Locate package mapping
  const mapping = ROSGAY_PACKAGE_MAPPINGS[item.packageId];
  if (!mapping) {
    return {
      success: false,
      message: `No automated Rosgay supplier mapping found for package: "${item.packageName}" (${item.packageId}). Manual fulfillment required.`,
    };
  }

  // 2. Extract customer requirements flexibly
  const req = item.requirements || {};
  const uid = req.playerId || req.uid || req.Uid || req.player_id;
  const email = req.deliveryEmail || req.accountEmail || req.email || req.Email;
  const username = req.username || req.playerId || req.deliveryEmail;
  const password = req.accountPassword || req.password;
  const whatsapp = req.whatsappNumber || req.whatsapp || req.phone;
  const device = req.device || 'Android';
  const zone = req.zoneId || req.zone || req.server;

  // 3. Build appropriate payload and validate input fields based on product type
  const payload: Record<string, any> = {
    topUpId: mapping.topUpId,
    serviceId: mapping.serviceId,
  };

  let targetDisplay = '';

  if (mapping.topUpId === 16) {
    // Prepaid Dollar Card
    if (!email) {
      return {
        success: false,
        message: 'Delivery Email Address is required for Prepaid Dollar Card delivery.',
      };
    }
    payload.Email = String(email).trim();
    if (whatsapp) payload.Whatsapp_Number = String(whatsapp).trim();
    targetDisplay = `Email: ${email}`;
  } else if (mapping.topUpId === 5) {
    // Roblox Robux
    if (!username || !password) {
      return {
        success: false,
        message: 'Roblox Username/Email and Password are required.',
      };
    }
    payload['Email/Username'] = String(username).trim();
    payload.Password = String(password).trim();
    if (whatsapp) payload.Whatsapp_Number = String(whatsapp).trim();
    targetDisplay = `Roblox Account: ${username}`;
  } else if (mapping.topUpId === 22) {
    // eFootball PES
    if (!email || !password) {
      return {
        success: false,
        message: 'Konami ID Email and Password are required for eFootball top-up.',
      };
    }
    payload.Konami_Mail = String(email).trim();
    payload.Password = String(password).trim();
    payload.Device = String(device).trim() || 'Android';
    if (whatsapp) payload.Whatsapp_Number = String(whatsapp).trim();
    targetDisplay = `Konami Mail: ${email} (${payload.Device})`;
  } else if (mapping.topUpId === 6) {
    // TikTok Coins
    if (!username || !password) {
      return {
        success: false,
        message: 'TikTok Username/Email and Password are required.',
      };
    }
    payload['Email/Username'] = String(username).trim();
    payload.Tt_Pass = String(password).trim();
    if (whatsapp) payload.Whatsapp_Number = String(whatsapp).trim();
    targetDisplay = `TikTok: ${username}`;
  } else if (mapping.topUpId === 7) {
    // CapCut Pro
    if (!whatsapp) {
      return {
        success: false,
        message: 'WhatsApp Number is required for CapCut Pro credential delivery.',
      };
    }
    payload.Whatsapp_Number = String(whatsapp).trim();
    if (email) payload.Email = String(email).trim();
    targetDisplay = `WhatsApp: ${whatsapp}`;
  } else if (mapping.topUpId === 10) {
    // ChatGPT Plus
    if (!email) {
      return {
        success: false,
        message: 'OpenAI Account Email is required for ChatGPT Plus.',
      };
    }
    payload.User_Id = String(email).trim();
    if (password) payload.Password = String(password).trim();
    if (whatsapp) payload.Whatsapp_Number = String(whatsapp).trim();
    targetDisplay = `OpenAI: ${email}`;
  } else {
    // Standard UID Games (Free Fire, Mobile Legends, PUBG, Blood Strike, Where Winds Meet, etc.)
    if (!uid) {
      return {
        success: false,
        message: 'Customer Player UID is missing from order requirements. Please verify UID before dispatching.',
      };
    }
    payload.Uid = String(uid).trim();
    if (zone && String(zone).trim()) {
      payload.Zone = String(zone).trim();
    }
    targetDisplay = `UID: ${uid}${zone ? ` (Zone: ${zone})` : ''}`;
  }

  // 4. Check live balance before sending
  const account = await getRosgayAccountStatus();
  if (account.success && typeof account.balance === 'number') {
    if (account.balance < mapping.wholesaleCostNpr) {
      return {
        success: false,
        message: `Insufficient Rosgay wholesale balance. Required: Rs. ${mapping.wholesaleCostNpr}, Available: Rs. ${account.balance}. Please load funds onto rosgayshop.com.`,
        requiredCost: mapping.wholesaleCostNpr,
        currentBalance: account.balance,
      };
    }
  }

  // 5. Authenticate
  const auth = await getRosgayAuthToken();
  if (!auth.success || !auth.token) {
    return { success: false, message: auth.error || 'Authentication with Rosgay Shop failed.' };
  }

  // 6. Execute make-order API call
  try {
    const res = await fetch(`${BASE_URL}/top-up/make-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === 'success') {
      return {
        success: true,
        message: `Successfully dispatched to Rosgay Shop! Item: ${mapping.name} (Wholesale: Rs. ${mapping.wholesaleCostNpr}) to ${targetDisplay}.`,
        rawResponse: data,
        requiredCost: mapping.wholesaleCostNpr,
      };
    } else {
      const errMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Rosgay rejected order.');
      return {
        success: false,
        message: `Rosgay Shop order failed: ${errMsg}`,
        rawResponse: data,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Network error connecting to Rosgay Shop API: ${err.message}`,
    };
  }
}
