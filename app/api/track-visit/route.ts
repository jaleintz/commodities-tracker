import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { page } = await request.json()

    // Get IP address from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Insert into database
    const { error } = await supabase
      .from('ip-addresses-tb')
      .insert({
        ip_address: ip,
        date: new Date().toISOString(),
        page: page
      })

    if (error) {
      console.error('Error tracking visit:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking visit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
