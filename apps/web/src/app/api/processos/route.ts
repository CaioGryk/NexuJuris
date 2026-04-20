import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from('processos').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ processos: [] });
    return NextResponse.json({ processos: data || [] });
  } catch { return NextResponse.json({ processos: [] }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numero_processo, tribunal, classe, orgao_julgador, objeto } = body;
    if (!numero_processo) return NextResponse.json({ error: 'Número é obrigatório' }, { status: 400 });

    const { error } = await supabase.from('processos').insert({ numero_processo, tribunal, classe, orgao_julgador, objeto, status: 'ativo', ativo: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await supabase.from('processos').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Erro Interno' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await supabase.from('processos').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }); }
}