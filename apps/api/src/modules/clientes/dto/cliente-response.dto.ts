export class ClienteResponseDto {
  id: string;
  tenantId: string;
  userId: string;
  nome: string;
  whatsapp: string | null;
  cpf: string | null;
  email: string | null;
  endereco: string | null;
  observacoes: string | null;
  origem: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}