import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, items } = body // type: 'song' | 'album', items: array of song IDs

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'PayPal credentials not configured' },
        { status: 500 }
      )
    }

    // Calculate total amount
    const songPrice = 3.00
    const albumPrice = 15.00
    const totalAmount = type === 'album' ? albumPrice : songPrice * items.length

    // Get access token from PayPal
    const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
    const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Failed to get PayPal access token' },
        { status: 500 }
      )
    }

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
          },
          description: type === 'album' 
            ? `Custom Album - ${items.length} songs`
            : items.length === 1 
              ? 'Single Song Download'
              : `${items.length} Song Downloads`,
          custom_id: JSON.stringify({ type, items }),
        }],
      }),
    })

    const orderData = await orderResponse.json()

    if (!orderData.id) {
      return NextResponse.json(
        { success: false, message: 'Failed to create PayPal order', error: orderData },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      approvalUrl: orderData.links?.find((link: any) => link.rel === 'approve')?.href,
    })

  } catch (error) {
    console.error('PayPal order creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

