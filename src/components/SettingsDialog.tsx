
"use client"

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, Smartphone, History } from 'lucide-react';
import { useLeads } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { webhookUrl, historyWebhookUrl, instanceName, updateSettings } = useLeads();
  const { toast } = useToast();
  const [url, setUrl] = useState(webhookUrl);
  const [hUrl, setHUrl] = useState(historyWebhookUrl);
  const [inst, setInst] = useState(instanceName);

  useEffect(() => {
    setUrl(webhookUrl);
    setHUrl(historyWebhookUrl);
    setInst(instanceName);
  }, [webhookUrl, historyWebhookUrl, instanceName, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(url, hUrl, inst);
    toast({
      title: "Configuración guardada",
      description: "Los webhooks se han actualizado correctamente.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
            <Webhook className="h-6 w-6" />
            Configuración de Webhooks
          </DialogTitle>
          <DialogDescription>
            Configura los endpoints para recibir leads e historiales de conversación.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instanceName" className="text-sm font-semibold flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Nombre de la Instancia
              </Label>
              <Input
                id="instanceName"
                value={inst}
                onChange={(e) => setInst(e.target.value)}
                placeholder="ej. HALCONDIGITAL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl" className="text-sm font-semibold flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                URL de Leads (GET)
              </Label>
              <Input
                id="webhookUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://tu-servicio.com/leads"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historyUrl" className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                URL de Historial Chat (GET)
              </Label>
              <Input
                id="historyUrl"
                value={hUrl}
                onChange={(e) => setHUrl(e.target.value)}
                placeholder="https://tu-servicio.com/history"
              />
              <p className="text-[10px] text-muted-foreground">
                Se enviará el parámetro `?remoteJid=` a esta URL.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
