
"use client"

import * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Trash2, DollarSign } from 'lucide-react';
import type { Lead, StageId } from '@/lib/types';
import { STAGES } from '@/lib/types';
import { suggestLeadActions } from '@/ai/flows/suggested-lead-actions';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/LanguageContext';

interface LeadDialogProps {
  lead?: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: any) => void;
  onDelete?: (id: string) => void;
}

export function LeadDialog({ lead, isOpen, onClose, onSave, onDelete }: LeadDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    contactName: lead?.contactName || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    stage: lead?.stage || 'new',
    notes: lead?.notes || '',
    budget: lead?.budget || '',
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
        budget: lead.budget || '',
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
        budget: '',
      });
      setSuggestions([]);
    }
  }, [lead, isOpen]);

  const handleSuggestActions = async () => {
    if (!formData.notes) {
      toast({
        title: t('leadDialog.noNotes'),
        description: t('leadDialog.noNotesDesc'),
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
        title: t('leadDialog.aiError'),
        description: t('leadDialog.aiErrorDesc'),
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
            {lead ? t('leadDialog.edit') : t('leadDialog.create')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('leadDialog.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej. Expansión Enterprise"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">{t('leadDialog.stage')}</Label>
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
                      {t(`stages.${s.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">{t('leadDialog.contact')}</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">{t('leadDialog.budget')}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="ej. 500.00"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('leadDialog.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('leadDialog.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">{t('leadDialog.company')}</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="notes">{t('leadDialog.notes')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-accent hover:text-accent border-accent hover:bg-accent/10 gap-1.5"
                onClick={handleSuggestActions}
                disabled={isSuggesting}
              >
                {isSuggesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {t('leadDialog.aiSuggestions')}
              </Button>
            </div>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="..."
            />
          </div>

          {suggestions.length > 0 && (
            <div className="bg-accent/5 rounded-lg p-3 border border-accent/20 space-y-2 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-accent uppercase tracking-wider">{t('leadDialog.suggestedActions')}</p>
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
                    if (confirm(t('leadDialog.deleteConfirm'))) {
                      onDelete(lead.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('leadDialog.delete')}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('leadDialog.cancel')}
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {lead ? t('leadDialog.update') : t('leadDialog.create')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
