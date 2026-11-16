export interface PaymentGatewayConfig {
  id: 'esewa' | 'khalti' | 'fonepay' | 'bank_transfer';
  name: string;
  badge: string;
  tagline: string;
  logoUrl: string;
  accountName: string;
  accountNumber: string;
  qrImage: string;
  instructions: string[];
  color: string;
  accentBg: string;
}

export const NEPAL_PAYMENT_METHODS: Record<string, PaymentGatewayConfig> = {
  fonepay: {
    id: 'fonepay',
    name: 'Fonepay / Bank QR',
    badge: 'Scan & Pay (Instant)',
    tagline: 'Instant scan with any Nepali mobile banking app or wallet',
    logoUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=120&q=80',
    accountName: 'Pushkar Nepal (Garima Bikas Bank)',
    accountNumber: '9761033755',
    qrImage: '/images/qr/bank_qr.png',
    instructions: [
      'Open your mobile banking app (Nabil, Global IME, NIC Asia, Garima, etc.) or eSewa/Khalti.',
      'Tap "Scan to Pay" and scan the Garima Bikas Bank / Fonepay QR code.',
      'Verify the recipient name displays: Pushkar Nepal.',
      'Enter the exact order amount.',
      'Copy the Transaction Code / Retrieval Reference Number (RRN) from your receipt and paste below.'
    ],
    color: '#dc2626',
    accentBg: 'rgba(220, 38, 38, 0.1)',
  },
  esewa: {
    id: 'esewa',
    name: 'eSewa Mobile Wallet',
    badge: 'Most Popular',
    tagline: 'Instant transfer via eSewa ID or QR code',
    logoUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=120&q=80',
    accountName: 'Pushkar Nepal',
    accountNumber: '9761033755',
    qrImage: '/images/qr/esewa_qr.jpg',
    instructions: [
      'Open your eSewa app.',
      'Tap "Send Money" to eSewa ID: 9761033755 or scan the eSewa QR code.',
      'Recipient Name: Pushkar Nepal.',
      'Enter the exact order amount in NPR.',
      'Copy the 10-digit eSewa Transaction ID and paste it in the box below.'
    ],
    color: '#16a34a',
    accentBg: 'rgba(22, 163, 74, 0.1)',
  },
  khalti: {
    id: 'khalti',
    name: 'Khalti Digital Wallet',
    badge: 'Fast & Secure',
    tagline: 'Direct wallet transfer or Khalti QR scan',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&q=80',
    accountName: 'PUSHKAR NEPAL',
    accountNumber: '9761033755',
    qrImage: '/images/qr/khalti_qr.png',
    instructions: [
      'Open your Khalti app.',
      'Send money to Khalti Mobile ID: 9761033755 or scan the Khalti QR code.',
      'Recipient Name: PUSHKAR NEPAL.',
      'Enter the exact order amount.',
      'Copy the Khalti Transaction Reference code and submit below.'
    ],
    color: '#7c3aed',
    accentBg: 'rgba(124, 58, 237, 0.1)',
  },
  bank_transfer: {
    id: 'bank_transfer',
    name: 'Garima Bikas Bank / ConnectIPS',
    badge: 'No Wallet Limits',
    tagline: 'Direct mobile banking or QR transfer to Garima Bikas Bank Limited',
    logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=120&q=80',
    accountName: 'Pushkar Nepal',
    accountNumber: '9761033755',
    qrImage: '/images/qr/bank_qr.png',
    instructions: [
      'Bank: Garima Bikas Bank Limited (गरिमा विकास बैंक लिमिटेड)',
      'Account Holder: Pushkar Nepal',
      'Registered Mobile / ID: 9761033755',
      'Scan the Garima Bikas Bank QR code from any mobile banking app.',
      'Copy the reference / transaction number and attach screenshot.'
    ],
    color: '#0284c7',
    accentBg: 'rgba(2, 132, 199, 0.1)',
  }
};
