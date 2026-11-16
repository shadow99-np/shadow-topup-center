import { NextResponse } from 'next/server';
import { getRosgayAccountStatus, executeRosgayTopUpOrder, ROSGAY_PACKAGE_MAPPINGS } from '@/lib/rosgayService';
import { CartItem } from '@/types/marketplace';

export async function GET() {
  try {
    const status = await getRosgayAccountStatus();
    if (!status.success) {
      return NextResponse.json({
        connected: false,
        error: status.error || 'Failed to authenticate with Rosgay Shop.',
      }, { status: 400 });
    }

    return NextResponse.json({
      connected: true,
      balance: status.balance,
      username: status.username,
      name: status.name,
      email: status.email,
      mappingsCount: Object.keys(ROSGAY_PACKAGE_MAPPINGS).length,
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message || 'Server error checking Rosgay status.',
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, item, orderId } = body;

    if (action === 'check_balance') {
      const status = await getRosgayAccountStatus();
      return NextResponse.json(status);
    }

    if (action === 'fulfill') {
      if (!item || !item.packageId) {
        return NextResponse.json({
          success: false,
          message: 'Order item details missing for fulfillment.',
        }, { status: 400 });
      }

      const fulfillResult = await executeRosgayTopUpOrder(item as CartItem);
      return NextResponse.json({
        ...fulfillResult,
        orderId,
      });
    }

    if (action === 'get_mapping') {
      const mapping = ROSGAY_PACKAGE_MAPPINGS[item?.packageId];
      return NextResponse.json({
        supported: !!mapping,
        mapping: mapping || null,
      });
    }

    return NextResponse.json({
      success: false,
      message: `Unknown action: "${action}".`,
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Server error processing supplier action.',
    }, { status: 500 });
  }
}
