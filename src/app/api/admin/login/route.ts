import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_USERNAME = 'JoeyHendrickson'
const ADMIN_PASSWORD = 'Voyetra070105!'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Verify credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create session token (simple approach - in production, use JWT)
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Set cookie
      const cookieStore = await cookies()
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return NextResponse.json({
        success: true,
        message: 'Login successful'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    if (session && session.value) {
      return NextResponse.json({
        authenticated: true
      })
    } else {
      return NextResponse.json({
        authenticated: false
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      authenticated: false
    })
  }
}

