import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client


export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
  );
    const { data: roles, error } = await supabaseAdmin.from('roles').select('*');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ roles }, { status: 200 });
  }
export async function PUT(req) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
  );
    const { user_email, user_role, user_permissions } = await req.json();
  
    const { error } = await supabaseAdmin
      .from('roles')
      .update({ user_role, user_permissions })
      .eq('user_email', user_email);
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 });
  }
    