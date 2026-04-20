import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const PJE_API_URL = 'https://comunicaapi.pje.jus.br/api/v1';
const PJE_HML_URL = 'https://hcomunicaapi.cnj.jus.br/api/v1';

export async function GET() {
  try {
    const { data: config } = await supabase.from('pje_config').select('username, password_encrypted, use_homologation').single();
    if (!config) return NextResponse.json({ success: false, error: 'Config não encontrada' }, { status: 400 });

    const password = Buffer.from(config.password_encrypted, 'base64').toString('utf-8');
    const baseUrl = config.use_homologation ? PJE_HML_URL : PJE_API_URL;

    const authRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: config.username, password }),
    });

    if (!authRes.ok) return NextResponse.json({ success: false, error: 'Credenciais inválidas' });

    const authData = await authRes.json();
    if (authData.access_token) {
      await supabase.from('pje_config').update({ ultimo_sincronismo: new Date().toISOString() }).eq('username', config.username);
      return NextResponse.json({ success: true, message: 'Conectado com sucesso' });
    }

    return NextResponse.json({ success: false, error: 'Falha na autenticação' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro de conexão' }, { status: 500 });
  }
}