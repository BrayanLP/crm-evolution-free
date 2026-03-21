
"use client"

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, ExternalLink } from 'lucide-react';
import { useLeads } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { webhookUrl, updateSettings } = useLeads();
  const { toast } = useToast();
  const [url, setUrl] = useState(webhookUrl);

  useEffect(() => {
    setUrl(webhookUrl);
  }, [webhookUrl, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(url);
    toast({
      title: "Configuración guardada",
      description: "La URL del webhook se ha actualizado correctamente.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
            <Webhook className="h-6 w-6" />
            Configuración de Webhooks
          </DialogTitle>
          <DialogDescription>
            Configura una URL externa para recibir notificaciones automáticas cada vez que se cree un nuevo prospecto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="webhookUrl" className="text-sm font-semibold">
              URL del Webhook (Lead Inbound)
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://tu-servicio.com/api/webhook"
                className="flex-1"
              />
            </div>
            <p className="text-[12px] text-muted-foreground bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
              Se enviará un objeto JSON mediante <strong>POST</strong> con los detalles del prospecto y el evento "lead.created".
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
              <Save className="h-4 w-4" />
              Guardar Configuración
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
