import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test database connection
    const { data: countries, error } = await supabase
      .from('countries')
      .select('count', { count: 'exact' })
      .limit(1);
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: !error,
        countries_available: !error,
        error: error?.message || null
      },
      version: '1.0.0'
    };
    
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 