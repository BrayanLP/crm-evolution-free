
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
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: StageId;
  title: string;
  color: string;
}

export const STAGES: Stage[] = [
  { id: 'new', title: 'New', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-amber-500' },
  { id: 'qualified', title: 'Qualified', color: 'bg-emerald-500' },
  { id: 'converted', title: 'Converted', color: 'bg-accent' },
];
