import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ clientes: [] });
    return NextResponse.json({ clientes: data || [] });
  } catch { return NextResponse.json({ clientes: [] }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, whatsapp, cpf, email, endereco, observacoes } = body;
    if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const { error } = await supabase.from('clientes').insert({ nome, whatsapp, cpf, email, endereco, observacoes, ativo: true });
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

    const { error } = await supabase.from('clientes').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Erro interno' }, { status: 500 }); }
}