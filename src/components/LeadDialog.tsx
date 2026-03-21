
"use client"

import * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Trash2 } from 'lucide-react';
import type { Lead, StageId } from '@/lib/types';
import { STAGES } from '@/lib/types';
import { suggestLeadActions } from '@/ai/flows/suggested-lead-actions';
import { useToast } from '@/hooks/use-toast';

interface LeadDialogProps {
  lead?: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: any) => void;
  onDelete?: (id: string) => void;
}

export function LeadDialog({ lead, isOpen, onClose, onSave, onDelete }: LeadDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    contactName: lead?.contactName || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    stage: lead?.stage || 'new',
    notes: lead?.notes || '',
  });

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  React.useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        stage: lead.stage,
        notes: lead.notes,
      });
      setSuggestions([]);
    } else {
      setFormData({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        company: '',
        stage: 'new',
        notes: '',
      });
      setSuggestions([]);
    }
  }, [lead, isOpen]);

  const handleSuggestActions = async () => {
    if (!formData.notes) {
      toast({
        title: "Sin notas",
        description: "Por favor, añade algunas notas para obtener sugerencias de la IA.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestLeadActions({ leadNotes: formData.notes });
      setSuggestions(result.actions);
    } catch (error) {
      toast({
        title: "Error de IA",
        description: "No se pudieron generar sugerencias en este momento.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">
            {lead ? 'Editar Prospecto' : 'Crear Nuevo Prospecto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre / Oportunidad</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej. Expansión Enterprise"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Etapa del Estado</Label>
              <Select
                value={formData.stage}
                onValueChange={(val) => setFormData({ ...formData, stage: val as StageId })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Persona de Contacto</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="notes">Notas e Interacciones</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-accent hover:text-accent border-accent hover:bg-accent/10 gap-1.5"
                onClick={handleSuggestActions}
                disabled={isSuggesting}
              >
                {isSuggesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Sugerencias IA
              </Button>
            </div>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Añade detalles sobre reuniones, llamadas o requisitos específicos..."
            />
          </div>

          {suggestions.length > 0 && (
            <div className="bg-accent/5 rounded-lg p-3 border border-accent/20 space-y-2 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-accent uppercase tracking-wider">Acciones Sugeridas</p>
              <ul className="text-sm space-y-1 text-slate-700">
                {suggestions.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-accent">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between items-center pt-4">
            <div>
              {lead && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar este prospecto?')) {
                      onDelete(lead.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {lead ? 'Actualizar Prospecto' : 'Crear Prospecto'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
