import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, useHomologation } = body;
    if (!username || !password) return NextResponse.json({ error: 'Obrigatório' }, { status: 400 });

    const encrypted = Buffer.from(password).toString('base64');
    const { error } = await supabase.from('pje_config').upsert({ username, password_encrypted: encrypted, use_homologation: useHomologation || false, updated_at: new Date().toISOString() }, { onConflict: 'usuario_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, message: 'Config salvo' });
  } catch { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }); }
}

export async function GET() {
  try {
    const { data } = await supabase.from('pje_config').select('username, use_homologation, tribunais, ativo, ultimo_sincronismo').single();
    return NextResponse.json({ configured: !!data, ...data });
  } catch { return NextResponse.json({ configured: false }); }
}