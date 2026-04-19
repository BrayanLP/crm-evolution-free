
export type StageId = 'new' | 'contacted' | 'qualified' | 'converted';

export interface Lead {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  company: string;
  stage: StageId;
  notes: string;
  budget?: string | number;
  remoteJid?: string;
  createdAt: string;
  updatedAt: string;
  botActive?: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  fromMe: boolean;
  timestamp: string;
  pushName?: string;
  type?: string;
}

export interface Stage {
  id: StageId;
  title: string;
  color: string;
}

export interface Service {
  id: string | number;
  NOMBRE: string;
  DESCRIPCION: string;
  PRECIO: string | number;
  CANTIDAD_PERSONAS?: number;
  CANTIDAD_CLASES?: number;
  FOTOS?: string;
  VIDEO?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Info {
  id: string | number;
  Informacion: string;
  createdAt?: string;
  updatedAt?: string;
}

export const STAGES: Stage[] = [
  { id: 'new', title: 'Nuevo', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contactado', color: 'bg-amber-500' },
  { id: 'qualified', title: 'Cualificado', color: 'bg-emerald-500' },
  { id: 'converted', title: 'Convertido', color: 'bg-accent' },
];
