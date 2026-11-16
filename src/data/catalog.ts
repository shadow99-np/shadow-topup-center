import { Product } from '@/types/marketplace';
import { applyFormulaToPackage } from '@/lib/pricingEngine';

const RAW_PRODUCTS: (Omit<Product, 'packages'> & { packages: any[] })[] = [
  // 1. FREE FIRE (NEPAL & BANGLADESH REGION)
  {
    id: 'ff-diamond',
    slug: 'free-fire-diamond-top-up',
    name: 'Free Fire Diamond (Nepal & Bangladesh Server)',
    publisher: 'Garena',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://rosgayshop.com/assets/upload/top-up/mjmKkIaWKLSaDtJb9GK5e8zyRC3tkW.webp',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    description: 'Instant Free Fire Diamond top-up directly to your Player ID (UID). IMPORTANT: In Free Fire, Nepal and Bangladesh share the exact same regional server (BD/Nepal Server). For India server accounts, please choose the Free Fire India Region top-up product below.',
    shortDescription: 'Instant UID top-up for Free Fire (Nepal & Bangladesh shared server). Delivered within 60s.',
    badge: 'Hot',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'Player ID (UID)',
        placeholder: 'e.g. 1984719203',
        type: 'number',
        required: true,
        helpText: 'Find your UID in your Free Fire profile under your avatar.',
        example: '1984719203'
      },
      {
        id: 'server',
        label: 'Server Region',
        placeholder: 'Select Server',
        type: 'select',
        options: ['Nepal & Bangladesh Server (BD/Nepal Shared Server)', 'Singapore / Malaysia', 'Global / Other'],
        required: true,
        helpText: 'Nepal and Bangladesh share the same server. India is on a separate server.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/free-fire-diamond-top-up',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['free fire', 'diamonds', 'nepal', 'bangladesh', 'garena', 'topup', 'ff uid', 'bd server'],
    instructions: [
      'Enter your numeric Free Fire Player ID (UID).',
      'Ensure your account is on Nepal/Bangladesh server (India server uses the separate India topup).',
      'Select your desired Diamond package or Weekly/Monthly membership.',
      'Pay via eSewa, Khalti, or Fonepay QR (Pushkar Nepal - 9761033755).',
      'Diamonds are credited directly to your in-game vault within 60 seconds!'
    ],
    faq: [
      {
        question: 'Are Nepal and Bangladesh accounts on the same Free Fire server?',
        answer: 'Yes! Garena operates Nepal and Bangladesh under the exact same regional server (BD/Nepal). Both regions use this top-up catalog.'
      },
      {
        question: 'What if my Free Fire account is on the India server?',
        answer: 'If your account is registered in India, please select our dedicated "Free Fire Diamond Top-Up (India Region)" product, as Indian UIDs are processed on separate servers.'
      }
    ],
    packages: [
      { id: 'ff-weekly-lite', name: 'Weekly Lite Membership', originalPrice: 70, instantDelivery: true, inStock: true, bonusAmount: 'Extra Rewards' },
      { id: 'ff-115', name: '115 Diamonds', originalPrice: 110, instantDelivery: true, inStock: true },
      { id: 'ff-weekly', name: 'Weekly Membership (450 Diamonds)', originalPrice: 220, instantDelivery: true, inStock: true, bonusAmount: 'VIP Badges' },
      { id: 'ff-240', name: '240 Diamonds', originalPrice: 220, instantDelivery: true, inStock: true },
      { id: 'ff-610', name: '610 Diamonds', originalPrice: 550, instantDelivery: true, inStock: true },
      { id: 'ff-monthly', name: 'Monthly Membership (2600 Diamonds)', originalPrice: 1048, instantDelivery: true, inStock: true, bonusAmount: 'Top Value' },
      { id: 'ff-1240', name: '1,240 Diamonds', originalPrice: 1100, instantDelivery: true, inStock: true },
      { id: 'ff-2530', name: '2,530 Diamonds', originalPrice: 2100, instantDelivery: true, inStock: true },
      { id: 'ff-5060', name: '5,060 Diamonds', originalPrice: 4200, instantDelivery: true, inStock: true },
      { id: 'ff-10120', name: '10,120 Diamonds (Mega Crate)', originalPrice: 8300, instantDelivery: true, inStock: true, bonusAmount: 'Mega Bonus' },
    ]
  },

  // 1B. FREE FIRE INDIA SERVER (SEPARATE DEDICATED REGION)
  {
    id: 'ff-india-diamond',
    slug: 'free-fire-india-region-top-up',
    name: 'Free Fire Diamond (India Region Server)',
    publisher: 'Garena',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    description: 'Dedicated Free Fire Diamond top-up exclusively for Free Fire accounts registered on the India Server. India region operates on completely distinct server architecture from Nepal/Bangladesh.',
    shortDescription: 'Dedicated direct UID top-up for Free Fire India server accounts.',
    badge: 'Popular',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'India Server Player ID (UID)',
        placeholder: 'e.g. 2891048192',
        type: 'number',
        required: true,
        helpText: 'Ensure your account is registered on the India server in Free Fire settings.',
        example: '2891048192'
      },
      {
        id: 'server',
        label: 'Region Confirmation',
        placeholder: 'Select Server',
        type: 'select',
        options: ['India Server (Dedicated Region)'],
        required: true,
        helpText: 'India region only. For Nepal or Bangladesh accounts, use Nepal/BD server top-up.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/free-fire-diamond-top-up',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['free fire', 'diamonds', 'india server', 'ff india', 'garena', 'topup', 'in uid'],
    instructions: [
      'Enter your numeric India server Free Fire Player ID (UID).',
      'Select your Indian package variation.',
      'Pay via eSewa, Khalti, or Fonepay QR (Pushkar Nepal - 9761033755).',
      'Diamonds will be credited to your Indian account within 1-2 minutes!'
    ],
    faq: [
      {
        question: 'Why is India region separate from Nepal/Bangladesh?',
        answer: 'Garena isolates the India server from Nepal and Bangladesh due to regional compliance and separate matchmaking clusters. Indian UIDs require this dedicated top-up channel.'
      }
    ],
    packages: [
      { id: 'ffi-100', name: '100 Diamonds (India)', originalPrice: 115, instantDelivery: true, inStock: true },
      { id: 'ffi-310', name: '310 Diamonds (India)', originalPrice: 310, instantDelivery: true, inStock: true },
      { id: 'ffi-520', name: '520 Diamonds (India)', originalPrice: 500, instantDelivery: true, inStock: true },
      { id: 'ffi-weekly', name: 'Weekly Membership (India)', originalPrice: 220, instantDelivery: true, inStock: true, bonusAmount: 'VIP' },
      { id: 'ffi-1060', name: '1,060 Diamonds (India)', originalPrice: 980, instantDelivery: true, inStock: true },
      { id: 'ffi-monthly', name: 'Monthly Membership (India)', originalPrice: 1050, instantDelivery: true, inStock: true, bonusAmount: 'Top Value' },
      { id: 'ffi-2180', name: '2,180 Diamonds (India)', originalPrice: 1920, instantDelivery: true, inStock: true },
    ]
  },

  // 2. MOBILE LEGENDS
  {
    id: 'mlbb-nepal',
    slug: 'mobile-legends-nepal',
    name: 'Mobile Legends: Bang Bang (Nepal / Global)',
    publisher: 'Moonton',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://rosgayshop.com/assets/upload/top-up/8oHnRwx8oY7THoqy2MhzCpK9BQwwVj.webp',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    description: 'Fast recharge for Mobile Legends Diamonds and Weekly Diamond Pass in Nepal. Enter your User ID and Zone ID for instant direct-to-inbox delivery.',
    shortDescription: 'Instant User ID + Zone ID recharge for MLBB diamonds.',
    badge: 'Popular',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'User ID',
        placeholder: 'e.g. 12345678',
        type: 'number',
        required: true,
        helpText: 'In-game User ID found in your profile menu.'
      },
      {
        id: 'zoneId',
        label: 'Zone ID (4-5 digits in brackets)',
        placeholder: 'e.g. 2042',
        type: 'number',
        required: true,
        helpText: 'The numbers inside brackets right next to your User ID.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/mobile-legends-nepal',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['mobile legends', 'mlbb', 'diamonds', 'moonton', 'weekly pass'],
    instructions: [
      'Enter your MLBB User ID and Zone ID.',
      'Pick your Diamond denomination or Weekly Pass.',
      'Complete payment with your preferred wallet.',
      'Check your in-game mailbox for confirmation.'
    ],
    packages: [
      { id: 'ml-weekly-pass', name: 'Weekly Diamond Pass', originalPrice: 250, instantDelivery: true, inStock: true, bonusAmount: 'Best ROI' },
      { id: 'ml-86', name: '86 Diamonds (78 + 8 Bonus)', originalPrice: 180, instantDelivery: true, inStock: true },
      { id: 'ml-172', name: '172 Diamonds (156 + 16 Bonus)', originalPrice: 350, instantDelivery: true, inStock: true },
      { id: 'ml-257', name: '257 Diamonds (234 + 23 Bonus)', originalPrice: 520, instantDelivery: true, inStock: true },
      { id: 'ml-706', name: '706 Diamonds (625 + 81 Bonus)', originalPrice: 1400, instantDelivery: true, inStock: true },
      { id: 'ml-2195', name: '2,195 Diamonds (1860 + 335 Bonus)', originalPrice: 4250, instantDelivery: true, inStock: true, bonusAmount: '+335 Bonus' },
      { id: 'ml-5532', name: '5,532 Diamonds (4680 + 852 Bonus)', originalPrice: 10400, instantDelivery: true, inStock: true },
    ]
  },

  // 3. PUBG MOBILE
  {
    id: 'pubg-uc',
    slug: 'pubg-mobile-uc-topup',
    name: 'PUBG Mobile UC Top-Up',
    publisher: 'Krafton / Tencent',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://rosgayshop.com/assets/upload/top-up/nAC8SZ7DSABiE1HaJAmRc49jIVDmqZ.webp',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    description: 'Direct Unknown Cash (UC) top-up for PUBG Mobile Global. Fast, reliable credit to unlock the Royale Pass, weapon crates, and mythic outfits.',
    shortDescription: 'Official PUBG Mobile UC top-up with Player ID.',
    badge: 'Best Value',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'Character ID (Numeric UID)',
        placeholder: 'e.g. 5123456789',
        type: 'number',
        required: true,
        helpText: 'Your 9-10 digit numeric Character ID.'
      },
      {
        id: 'inGameName',
        label: 'Character In-Game Name',
        placeholder: 'e.g. DangerPlayer',
        type: 'text',
        required: false,
        helpText: 'Optional: helps our verification engine ensure 100% correct delivery.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/pubg-mobile-uc-topup',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['pubg', 'pubg mobile', 'uc', 'unknown cash', 'royale pass'],
    packages: [
      { id: 'pubg-60', name: '60 UC', originalPrice: 135, instantDelivery: true, inStock: true },
      { id: 'pubg-325', name: '325 UC (300 + 25 Bonus)', originalPrice: 650, instantDelivery: true, inStock: true },
      { id: 'pubg-660', name: '660 UC (600 + 60 Bonus) [Royale Pass]', originalPrice: 1280, instantDelivery: true, inStock: true, bonusAmount: 'Royale Pass' },
      { id: 'pubg-1800', name: '1,800 UC (1500 + 300 Bonus)', originalPrice: 3450, instantDelivery: true, inStock: true },
      { id: 'pubg-3850', name: '3,850 UC (3000 + 850 Bonus)', originalPrice: 7200, instantDelivery: true, inStock: true, bonusAmount: '+850 Bonus' },
      { id: 'pubg-8100', name: '8,100 UC (6000 + 2100 Bonus)', originalPrice: 14200, instantDelivery: true, inStock: true, bonusAmount: '+2100 Bonus' },
    ]
  },

  // 4. CHATGPT PLUS
  {
    id: 'chatgpt-plus',
    slug: 'chatgpt-plus-nepal-global',
    name: 'ChatGPT Plus (Own Email / Official Upgrade)',
    publisher: 'OpenAI',
    category: 'subscription',
    categoryLabel: 'App & AI Subscription',
    image: 'https://rosgayshop.com/assets/upload/top-up/UZY5xD1CZKFxx41xVuWyEVlQ1uyUso.webp',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    description: 'Unlock GPT-4o, DALL-E 3 image generation, Advanced Voice Mode, Deep Research, and unlimited high-speed inference on your own personal OpenAI account in Nepal.',
    shortDescription: 'Official 1-Month ChatGPT Plus subscription upgrade for Nepal.',
    badge: 'Exclusive',
    instantDelivery: false,
    requiresPlayerId: false,
    requirementFields: [
      {
        id: 'accountEmail',
        label: 'OpenAI / ChatGPT Account Email',
        placeholder: 'yourchatgpt@gmail.com',
        type: 'email',
        required: true,
        helpText: 'OpenAI account email where you want ChatGPT Plus enabled.'
      },
      {
        id: 'accountPassword',
        label: 'ChatGPT Account Password',
        placeholder: 'Enter your ChatGPT Password',
        type: 'password',
        required: true,
        helpText: 'Required by supplier to attach Plus subscription to your OpenAI account. Tip: Set a temporary password & change it after completion.'
      },
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for Activation & OTP',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'We contact you on WhatsApp to confirm delivery & 2FA code if requested.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/chatgpt-plus-buy-in-own-email-nepal-global',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['chatgpt', 'openai', 'gpt4o', 'ai subscription', 'chatgpt plus nepal'],
    packages: [
      { id: 'gpt-1m', name: 'ChatGPT Plus 1 Month (Personal Account)', originalPrice: 3100, instantDelivery: false, inStock: true, bonusAmount: 'Own Email' },
      { id: 'gpt-team', name: 'ChatGPT Team Seat 1 Month (Invite)', originalPrice: 3400, instantDelivery: false, inStock: true, bonusAmount: 'Higher Caps' },
    ]
  },

  // 5. CAPCUT PRO
  {
    id: 'capcut-pro',
    slug: 'capcut-pro-nepal-global',
    name: 'CapCut Pro [Nepal / Global]',
    publisher: 'ByteDance',
    category: 'subscription',
    categoryLabel: 'App & AI Subscription',
    image: 'https://rosgayshop.com/assets/upload/top-up/miDpLKeJGKzXuVbhsT2T8Zplt1JhKP.webp',
    banner: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    description: 'Unlock 4K 60FPS export, AI video upscaling, optical flow slow-motion, premium cloud effects, auto-captions, and all pro transitions on desktop and mobile.',
    shortDescription: 'Full access to all CapCut Pro video editing tools & cloud filters.',
    badge: 'Hot',
    instantDelivery: true,
    requiresPlayerId: false,
    requirementFields: [
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for Login Credentials',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'Your CapCut Pro private account credentials & login details will be dispatched here.'
      },
      {
        id: 'accountEmail',
        label: 'CapCut Account Email (Optional)',
        placeholder: 'yourcapcut@gmail.com',
        type: 'email',
        required: false,
        helpText: 'If you prefer an invite link sent to your existing CapCut email.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/capcut-pro-nepal-global',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['capcut', 'capcut pro', 'video editor', 'tiktok editor', 'pro license'],
    packages: [
      { id: 'capcut-1m', name: '1 Month CapCut Pro Access', originalPrice: 250, instantDelivery: true, inStock: true, bonusAmount: 'Instant Access' },
      { id: 'capcut-3m', name: '3 Months CapCut Pro Access', originalPrice: 650, instantDelivery: true, inStock: true },
      { id: 'capcut-1y', name: '1 Year CapCut Pro Access', originalPrice: 1600, instantDelivery: true, inStock: true, bonusAmount: 'Best Value' },
    ]
  },

  // 6. NETFLIX
  {
    id: 'netflix-nepal',
    slug: 'netflix-shared-account-nepal',
    name: 'Netflix Premium (4K Ultra HD)',
    publisher: 'Netflix Inc.',
    category: 'subscription',
    categoryLabel: 'App & AI Subscription',
    image: 'https://rosgayshop.com/assets/upload/top-up/aZJDDT6hFcR3S7rFxWt9oJAn36Rk2K.webp',
    banner: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
    description: 'Stream all movies, series, anime, and Netflix originals in 4K UHD with Dolby Atmos audio. Works seamlessly on TV, phone, tablet, and laptop.',
    shortDescription: '4K Ultra HD Netflix profiles with uninterrupted warranty.',
    badge: 'Popular',
    instantDelivery: false,
    requiresPlayerId: false,
    requirementFields: [
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for Login Credentials',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'We send your private pin-protected profile credentials to this WhatsApp.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/netflix-shared-account-nepal',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['netflix', '4k uhd', 'streaming', 'movies', 'series'],
    packages: [
      { id: 'nf-1m-shared', name: '1 Screen (PIN Protected) - 1 Month', originalPrice: 350, instantDelivery: false, inStock: true, bonusAmount: '4K Ultra HD' },
      { id: 'nf-3m-shared', name: '1 Screen (PIN Protected) - 3 Months', originalPrice: 980, instantDelivery: false, inStock: true },
      { id: 'nf-private-1m', name: 'Full Private Account (5 Profiles) - 1 Month', originalPrice: 1450, instantDelivery: false, inStock: true, bonusAmount: '5 Screens' },
    ]
  },

  // 7. DISCORD NITRO
  {
    id: 'discord-nitro',
    slug: 'discord-nitro-nepal',
    name: 'Discord Nitro (Basic & Pro Boosts)',
    publisher: 'Discord Inc.',
    category: 'subscription',
    categoryLabel: 'App & AI Subscription',
    image: 'https://rosgayshop.com/assets/upload/top-up/Io64WPrTLlwHuUUBQ3VGoZ4S8YMIjO.webp',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'Upgrade your Discord account with animated emojis, custom stickers, 500MB file uploads, HD streaming, profile banners, and 2 free Server Boosts.',
    shortDescription: 'Official Discord Nitro upgrades & gifts for Nepali community members.',
    badge: 'Hot',
    instantDelivery: true,
    requiresPlayerId: false,
    requirementFields: [
      {
        id: 'discordUsername',
        label: 'Discord Username or Email',
        placeholder: 'e.g. shadow_gamer',
        type: 'text',
        required: true,
        helpText: 'Your Discord handle or email address.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/discord-nitro-basic-and-pro-nepal-global',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['discord', 'nitro', 'server boost', 'animated emojis'],
    packages: [
      { id: 'nitro-basic-1m', name: 'Nitro Basic 1 Month', originalPrice: 420, instantDelivery: true, inStock: true },
      { id: 'nitro-boost-1m', name: 'Nitro Full (2 Server Boosts) 1 Month', originalPrice: 980, instantDelivery: true, inStock: true, bonusAmount: '2 Boosts' },
      { id: 'nitro-boost-1y', name: 'Nitro Full (2 Server Boosts) 1 Year', originalPrice: 9400, instantDelivery: true, inStock: true, bonusAmount: 'Save 20%' },
    ]
  },

  // 8. TIKTOK COINS
  {
    id: 'tiktok-coins',
    slug: 'tiktok-coin-topup',
    name: 'TikTok Coins Top-Up (Nepal & Global)',
    publisher: 'ByteDance',
    category: 'live_coins',
    categoryLabel: 'Live-Streaming Coins',
    image: 'https://rosgayshop.com/assets/upload/top-up/repTjSR8U2T8a7Gw4OROEoLk6D0bel.webp',
    banner: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=1200&q=80',
    description: 'Send live gifts, roses, lions, and show support to your favourite live streamers on TikTok. Fast username top-up with zero password required.',
    shortDescription: 'Instant TikTok coin recharge via username.',
    badge: 'Instant',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'TikTok Email or Username (@username)',
        placeholder: 'e.g. @nepalgamer or email',
        type: 'text',
        required: true,
        helpText: 'Your registered TikTok handle or email address.'
      },
      {
        id: 'accountPassword',
        label: 'TikTok Account Password',
        placeholder: 'Enter TikTok password',
        type: 'password',
        required: true,
        helpText: 'Required by supplier for in-app coin recharge. You can change your password after delivery.'
      },
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for 2FA SMS Code',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'Keep WhatsApp active to send the 2FA SMS verification code when the supplier logs in.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/tiktok-coin-topup',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['tiktok', 'tiktok coins', 'live streaming', 'gifts'],
    packages: [
      { id: 'tt-70', name: '70 TikTok Coins', originalPrice: 150, instantDelivery: true, inStock: true },
      { id: 'tt-350', name: '350 TikTok Coins', originalPrice: 720, instantDelivery: true, inStock: true },
      { id: 'tt-700', name: '700 TikTok Coins', originalPrice: 1420, instantDelivery: true, inStock: true },
      { id: 'tt-1400', name: '1,400 TikTok Coins', originalPrice: 2800, instantDelivery: true, inStock: true },
      { id: 'tt-3500', name: '3,500 TikTok Coins', originalPrice: 7000, instantDelivery: true, inStock: true, bonusAmount: 'Gifter Pack' },
    ]
  },

  // 9. STEAM GIFT CARDS
  {
    id: 'steam-gift-cards',
    slug: 'steam-gift-cards',
    name: 'Steam Wallet Gift Cards (Global / US)',
    publisher: 'Valve Corporation',
    category: 'giftcard',
    categoryLabel: 'Gift Cards',
    image: 'https://rosgayshop.com/assets/upload/card/4tUkTxwIMEp8Y6FZVtt826ymy6w87s.webp',
    banner: 'https://images.unsplash.com/photo-1612287233207-6c84c17b6a1e?auto=format&fit=crop&w=1200&q=80',
    description: 'Redeem funds directly to your Steam Wallet to purchase CS2 skins, Dota 2 items, Black Myth: Wukong, GTA V, and thousands of PC games on Steam.',
    shortDescription: 'Official Steam Wallet digital voucher codes delivered to email.',
    badge: 'Popular',
    instantDelivery: true,
    requiresPlayerId: false,
    requirementFields: [
      {
        id: 'deliveryEmail',
        label: 'Delivery Email Address',
        placeholder: 'yourname@gmail.com',
        type: 'email',
        required: true,
        helpText: 'The Steam voucher code will be delivered instantly to this email.'
      },
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for Instant Backup Delivery',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'The code voucher will also be sent to your WhatsApp for instant redemption.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/card/details/steam-gift-cards',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['steam', 'pc games', 'valve', 'cs2', 'steam wallet'],
    packages: [
      { id: 'steam-5usd', name: '$5 USD Steam Wallet Code', originalPrice: 720, instantDelivery: true, inStock: true },
      { id: 'steam-10usd', name: '$10 USD Steam Wallet Code', originalPrice: 1420, instantDelivery: true, inStock: true },
      { id: 'steam-20usd', name: '$20 USD Steam Wallet Code', originalPrice: 2800, instantDelivery: true, inStock: true },
      { id: 'steam-50usd', name: '$50 USD Steam Wallet Code', originalPrice: 6950, instantDelivery: true, inStock: true },
      { id: 'steam-100usd', name: '$100 USD Steam Wallet Code', originalPrice: 13800, instantDelivery: true, inStock: true, bonusAmount: 'Best Rate' },
    ]
  },

  // 10. PREPAID MASTERCARD (DOLLAR CARD)
  {
    id: 'dollar-card',
    slug: 'prepaid-mastercard-dollar-card',
    name: 'Prepaid MasterCard (Virtual Dollar Card)',
    publisher: 'Global Prepaid / Mastercard',
    category: 'gamekeys',
    categoryLabel: 'Digital Cards & Services',
    image: 'https://rosgayshop.com/assets/upload/top-up/fEPxBBldYTX6jOLyX6BwFethScLFwk.webp',
    banner: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
    description: 'Instant virtual Mastercard creation code for online international payments from Nepal. Use on Facebook / Meta Ads, Google Ads, domains, hosting, Coursera, AI tools, and international websites.',
    shortDescription: 'Virtual international dollar card creation code for online payments.',
    badge: 'Exclusive',
    instantDelivery: false,
    requiresPlayerId: false,
    requirementFields: [
      {
        id: 'deliveryEmail',
        label: 'Delivery Email Address',
        placeholder: 'yourname@gmail.com',
        type: 'email',
        required: true,
        helpText: 'We will send your card creation code directly to this email.'
      },
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for Card Code & Support',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'Card creation code and portal generation instructions will be dispatched here.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/prepaid-mastercard-dollar-card',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['dollar card', 'mastercard', 'meta ads', 'international payment', 'prepaid card nepal'],
    packages: [
      { id: 'card-2usd', name: '$2 USD Prepaid Card Code', originalPrice: 360, instantDelivery: false, inStock: true, bonusAmount: 'Starter' },
      { id: 'card-5usd', name: '$5 USD Prepaid Card Code', originalPrice: 910, instantDelivery: false, inStock: true },
      { id: 'card-10usd', name: '$10 USD Prepaid Card Code', originalPrice: 1799, instantDelivery: false, inStock: true, bonusAmount: 'Popular' },
      { id: 'card-25usd', name: '$25 USD Prepaid Card Code', originalPrice: 4250, instantDelivery: false, inStock: true },
      { id: 'card-50usd', name: '$50 USD Prepaid Card Code', originalPrice: 8999, instantDelivery: false, inStock: true, bonusAmount: 'Best Value' },
      { id: 'card-100usd', name: '$100 USD Prepaid Card Code', originalPrice: 17999, instantDelivery: false, inStock: true, bonusAmount: 'VIP' },
    ]
  },

  // 11. VALORANT POINTS
  {
    id: 'valorant-points',
    slug: 'valorant-points',
    name: 'Valorant Points (VP - Riot Games)',
    publisher: 'Riot Games',
    category: 'giftcard',
    categoryLabel: 'Gift Cards',
    image: 'https://rosgayshop.com/assets/upload/card/Mft9lwBvvaicrM6Zm7Ki9U0eI7kqQw.webp',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    description: 'Instant Valorant Points for weapon skin collections (Vandal, Phantom, Kuronami, Prime), battle passes, and Radianite points in Nepal.',
    shortDescription: 'Official Riot Games Valorant Points for South Asia & Global.',
    badge: 'Hot',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'Riot ID (Username#Tag)',
        placeholder: 'e.g. Phoenix#NEP',
        type: 'text',
        required: true,
        helpText: 'Your complete Riot ID including the hashtag (#).'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/card/details/valorant',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['valorant', 'vp', 'riot games', 'skins', 'battle pass'],
    packages: [
      { id: 'vp-475', name: '475 Valorant Points', originalPrice: 650, instantDelivery: true, inStock: true },
      { id: 'vp-1000', name: '1,000 Valorant Points (Battle Pass)', originalPrice: 1320, instantDelivery: true, inStock: true, bonusAmount: 'Battle Pass' },
      { id: 'vp-2050', name: '2,050 Valorant Points', originalPrice: 2650, instantDelivery: true, inStock: true },
      { id: 'vp-3650', name: '3,650 Valorant Points', originalPrice: 4600, instantDelivery: true, inStock: true },
      { id: 'vp-5350', name: '5,350 Valorant Points', originalPrice: 6600, instantDelivery: true, inStock: true },
      { id: 'vp-11000', name: '11,000 Valorant Points (Collector Bundle)', originalPrice: 13000, instantDelivery: true, inStock: true, bonusAmount: 'Mega VP' },
    ]
  },

  // 12. TELEGRAM STARS & PREMIUM
  {
    id: 'telegram-stars',
    slug: 'telegram-stars-and-premium',
    name: 'Telegram Stars & Premium Membership',
    publisher: 'Telegram FZ-LLC',
    category: 'subscription',
    categoryLabel: 'App & AI Subscription',
    image: 'https://rosgayshop.com/assets/upload/top-up/AqOZseJv7BmgwETVByh32OfFhRhbAY.webp',
    banner: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1200&q=80',
    description: 'Purchase Telegram Stars for in-app mini-apps, bots, exclusive channel access, and unlock Telegram Premium with 4GB upload limits, voice-to-text, and fast download speeds.',
    shortDescription: 'Official Telegram Premium & Stars recharge directly to your username.',
    badge: 'Popular',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'Telegram Username (@username)',
        placeholder: '@yourhandle',
        type: 'text',
        required: true,
        helpText: 'Your public Telegram handle starting with @.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/telegram-stars-and-premium',
    lastCheckedDate: '2026-11-15',
    inStock: true,
    tags: ['telegram', 'telegram stars', 'telegram premium', 'bots'],
    packages: [
      { id: 'tg-50stars', name: '50 Telegram Stars', originalPrice: 160, instantDelivery: true, inStock: true },
      { id: 'tg-100stars', name: '100 Telegram Stars', originalPrice: 310, instantDelivery: true, inStock: true },
      { id: 'tg-250stars', name: '250 Telegram Stars', originalPrice: 750, instantDelivery: true, inStock: true },
      { id: 'tg-500stars', name: '500 Telegram Stars', originalPrice: 1450, instantDelivery: true, inStock: true },
      { id: 'tg-prem-3m', name: 'Telegram Premium (3 Months Gift)', originalPrice: 1450, instantDelivery: true, inStock: true },
      { id: 'tg-prem-6m', name: 'Telegram Premium (6 Months Gift)', originalPrice: 2450, instantDelivery: true, inStock: true },
      { id: 'tg-prem-12m', name: 'Telegram Premium (1 Year Gift)', originalPrice: 4300, instantDelivery: true, inStock: true, bonusAmount: 'Best Rate' },
    ]
  },

  // 13. ROBLOX
  {
    id: 'roblox-topup',
    slug: 'roblox-topup',
    name: 'Roblox Robux Top-Up (Global & Nepal)',
    publisher: 'Roblox Corporation',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://rosgayshop.com/assets/upload/top-up/F0x3sgP01TSLzuLWSl3barJCy5myq4.webp',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    description: 'Instant Robux recharge for Roblox accounts in Nepal. Buy avatar clothing, gamepasses, animations, and premium experiences across all Roblox worlds.',
    shortDescription: 'Instant Robux top-up for Roblox accounts.',
    badge: 'Hot',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'Roblox Username or Email',
        placeholder: 'e.g. shadow_roblox or email',
        type: 'text',
        required: true,
        helpText: 'Your registered Roblox account username or email.'
      },
      {
        id: 'accountPassword',
        label: 'Roblox Account Password',
        placeholder: 'Enter Roblox password',
        type: 'password',
        required: true,
        helpText: 'Required by supplier to credit Robux directly. You can set a temporary password and change it after recharge.'
      },
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for 2FA / Login Code',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'Keep WhatsApp ready to share 2-step verification code when prompted.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/roblox-topup',
    lastCheckedDate: '2026-11-16',
    inStock: true,
    tags: ['roblox', 'robux', 'bloxfruits', 'brookhaven', 'adopt me', 'roblox nepal'],
    packages: [
      { id: 'roblox-80', name: '80 Robux', originalPrice: 170, instantDelivery: true, inStock: true },
      { id: 'roblox-400', name: '400 Robux', originalPrice: 850, instantDelivery: true, inStock: true },
      { id: 'roblox-500', name: '500 Robux', originalPrice: 930, instantDelivery: true, inStock: true },
      { id: 'roblox-1000', name: '1,000 Robux', originalPrice: 1700, instantDelivery: true, inStock: true, bonusAmount: 'Popular' },
      { id: 'roblox-2000', name: '2,000 Robux', originalPrice: 3400, instantDelivery: true, inStock: true },
      { id: 'roblox-5000', name: '5,000 Robux', originalPrice: 8500, instantDelivery: true, inStock: true, bonusAmount: 'Best Value' },
      { id: 'roblox-10000', name: '10,000 Robux', originalPrice: 17000, instantDelivery: true, inStock: true, bonusAmount: 'Mega Pack' },
    ]
  },

  // 14. EFOOTBALL (PES)
  {
    id: 'efootball-pes',
    slug: 'efootball-coins-amp-packs-pes',
    name: 'eFootball Coins & Packs (PES Mobile)',
    publisher: 'Konami',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://rosgayshop.com/assets/upload/top-up/OCvb8bGMTwUWWU1J70VZTTVYSN4xOb.webp',
    banner: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    description: 'Recharge eFootball Coins & special manager packs in Nepal. Sign legendary epic cards, managers, and pack openings on Konami eFootball PES mobile.',
    shortDescription: 'Official eFootball PES Coins & Manager Sets top-up.',
    badge: 'Popular',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'accountEmail',
        label: 'Konami ID Email',
        placeholder: 'efootb@gmail.com',
        type: 'email',
        required: true,
        helpText: 'The Konami ID email linked to your eFootball game.'
      },
      {
        id: 'accountPassword',
        label: 'Konami ID Password',
        placeholder: 'Enter Konami password',
        type: 'password',
        required: true,
        helpText: 'Konami account password for recharge.'
      },
      {
        id: 'whatsappNumber',
        label: 'WhatsApp Number for 2-Step Code',
        placeholder: 'e.g. 98XXXXXXXX',
        type: 'text',
        required: true,
        helpText: 'Provide 2-step verification code via WhatsApp when supplier logs in.'
      },
      {
        id: 'device',
        label: 'Device Platform',
        placeholder: 'Select Device',
        type: 'select',
        options: ['Android', 'iOS / iPhone'],
        required: true,
        helpText: 'Select your mobile gaming platform.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/efootball-coins-amp-packs-pes',
    lastCheckedDate: '2026-11-16',
    inStock: true,
    tags: ['efootball', 'pes', 'pes coins', 'konami', 'efootball nepal', 'pes mobile'],
    packages: [
      { id: 'efoot-starter', name: 'Starter Set (Silvestre + 50 Coins)', originalPrice: 157, instantDelivery: true, inStock: true, bonusAmount: 'Starter' },
      { id: 'efoot-300', name: '300 eFootball Coins', originalPrice: 450, instantDelivery: true, inStock: true },
      { id: 'efoot-500', name: '500 eFootball Coins', originalPrice: 720, instantDelivery: true, inStock: true },
      { id: 'efoot-1000', name: '1,000 eFootball Coins', originalPrice: 1375, instantDelivery: true, inStock: true, bonusAmount: 'Top Choice' },
      { id: 'efoot-2000', name: '2,000 eFootball Coins', originalPrice: 2660, instantDelivery: true, inStock: true },
      { id: 'efoot-5000', name: '5,000 eFootball Coins', originalPrice: 6300, instantDelivery: true, inStock: true, bonusAmount: 'Pro Pack' },
      { id: 'efoot-10000', name: '10,000 eFootball Coins', originalPrice: 12000, instantDelivery: true, inStock: true, bonusAmount: 'Mega Pack' },
    ]
  },

  // 15. BLOOD STRIKE
  {
    id: 'blood-strike',
    slug: 'blood-strike',
    name: 'Blood Strike Gold Top-Up (Global)',
    publisher: 'NetEase Games',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://rosgayshop.com/assets/upload/top-up/6tF41axwi67lEDaFcQzqulwGuw5X1o.webp',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    description: 'Fast Gold and Strike Pass top-up directly to your Blood Strike User ID. Fast Battle Royale weapon skins, strikers, and ultra lucky chests.',
    shortDescription: 'Instant UID Gold top-up for Blood Strike mobile & PC.',
    badge: 'Hot',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'Player Profile ID (UID)',
        placeholder: 'e.g. 198273645',
        type: 'number',
        required: true,
        helpText: 'Find your numeric User ID in your Blood Strike profile.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/blood-strike',
    lastCheckedDate: '2026-11-16',
    inStock: true,
    tags: ['blood strike', 'blood strike gold', 'netease', 'battle royale', 'strike pass'],
    packages: [
      { id: 'bs-56', name: '56 Golds', originalPrice: 75, instantDelivery: true, inStock: true },
      { id: 'bs-116', name: '116 Golds', originalPrice: 145, instantDelivery: true, inStock: true },
      { id: 'bs-352', name: '352 Golds', originalPrice: 435, instantDelivery: true, inStock: true },
      { id: 'bs-594', name: '594 Golds', originalPrice: 725, instantDelivery: true, inStock: true, bonusAmount: 'Popular' },
      { id: 'bs-1210', name: '1,210 Golds', originalPrice: 1450, instantDelivery: true, inStock: true },
      { id: 'bs-2486', name: '2,486 Golds', originalPrice: 2900, instantDelivery: true, inStock: true, bonusAmount: 'High Tier' },
      { id: 'bs-pass-elite', name: 'Strike Pass Elite', originalPrice: 600, instantDelivery: true, inStock: true, bonusAmount: 'Battle Pass' },
      { id: 'bs-level-up', name: 'Level Up Pass', originalPrice: 320, instantDelivery: true, inStock: true },
    ]
  },

  // 16. WHERE WINDS MEET
  {
    id: 'where-winds-meet',
    slug: 'where-winds-meet-top-up',
    name: 'Where Winds Meet Top Up (Global)',
    publisher: 'Everstone Studio / NetEase',
    category: 'topup',
    categoryLabel: 'Game Top-Up',
    image: 'https://rosgayshop.com/assets/upload/top-up/mj455Vym2dbWsvgt3EvZ90VuWERfHl.webp',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    description: 'Instant Echo Beads recharge and Battle Passes for Where Winds Meet open-world Wuxia action-adventure RPG. Enter your player UID for fast direct delivery.',
    shortDescription: 'Official Where Winds Meet Echo Beads & Passes top-up.',
    badge: 'Exclusive',
    instantDelivery: true,
    requiresPlayerId: true,
    requirementFields: [
      {
        id: 'playerId',
        label: 'Player Numeric UID',
        placeholder: 'e.g. 481609237',
        type: 'number',
        required: true,
        helpText: 'Your numeric player UID in Where Winds Meet.'
      }
    ],
    sourceUrl: 'https://rosgayshop.com/direct-topup/details/where-winds-meet-top-up',
    lastCheckedDate: '2026-11-16',
    inStock: true,
    tags: ['where winds meet', 'echo beads', 'wuxia', 'rpg', 'where winds meet nepal'],
    packages: [
      { id: 'wwm-60', name: '60 Echo Beads', originalPrice: 154, instantDelivery: true, inStock: true },
      { id: 'wwm-180', name: '180 Echo Beads', originalPrice: 462, instantDelivery: true, inStock: true },
      { id: 'wwm-300', name: '300 Echo Beads', originalPrice: 770, instantDelivery: true, inStock: true },
      { id: 'wwm-600', name: '600 Echo Beads', originalPrice: 1540, instantDelivery: true, inStock: true, bonusAmount: 'Popular' },
      { id: 'wwm-monthly', name: 'Monthly Pass', originalPrice: 770, instantDelivery: true, inStock: true, bonusAmount: 'VIP' },
      { id: 'wwm-elite-bp', name: 'Elite Battle Pass', originalPrice: 1540, instantDelivery: true, inStock: true, bonusAmount: 'Pass' },
      { id: 'wwm-prem-bp', name: 'Premium Battle Pass', originalPrice: 3080, instantDelivery: true, inStock: true },
    ]
  }
];

// Automatically apply the Business Formula: 
// - Packages <= NPR 1,000: FINAL SELLING PRICE = ORIGINAL PRICE + NPR 20 (Rs. 20 Profit)
// - Packages > NPR 1,000:  FINAL SELLING PRICE = ORIGINAL PRICE + NPR 50 (Rs. 50 Profit)
export const PRODUCTS_CATALOG: Product[] = RAW_PRODUCTS.map((prod) => ({
  ...prod,
  packages: prod.packages.map((pkg) => applyFormulaToPackage(pkg)),
}));

export const CATEGORIES_LIST = [
  { id: 'all', label: 'All Products', icon: 'Sparkles', count: PRODUCTS_CATALOG.length },
  { id: 'topup', label: 'Game Top-Up', icon: 'Gamepad2', count: PRODUCTS_CATALOG.filter(p => p.category === 'topup').length },
  { id: 'subscription', label: 'App Subscriptions', icon: 'Layers', count: PRODUCTS_CATALOG.filter(p => p.category === 'subscription').length },
  { id: 'giftcard', label: 'Gift Cards', icon: 'CreditCard', count: PRODUCTS_CATALOG.filter(p => p.category === 'giftcard').length },
  { id: 'live_coins', label: 'Live App Coins', icon: 'Radio', count: PRODUCTS_CATALOG.filter(p => p.category === 'live_coins').length },
  { id: 'gamekeys', label: 'Digital Cards & Keys', icon: 'Key', count: PRODUCTS_CATALOG.filter(p => p.category === 'gamekeys').length },
];
