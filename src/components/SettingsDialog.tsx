
"use client"

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, Send, Smartphone } from 'lucide-react';
import { useLeads } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { webhookUrl, instanceName, updateSettings, testWebhook } = useLeads();
  const { toast } = useToast();
  const [url, setUrl] = useState(webhookUrl);
  const [inst, setInst] = useState(instanceName);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setUrl(webhookUrl);
    setInst(instanceName);
  }, [webhookUrl, instanceName, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(url, inst);
    toast({
      title: "Configuración guardada",
      description: "La configuración del webhook se ha actualizado correctamente.",
    });
    onClose();
  };

  const handleTest = async () => {
    if (!url) {
      toast({
        title: "URL faltante",
        description: "Configura primero una URL para realizar la prueba.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    await testWebhook();
    setIsTesting(false);
    
    toast({
      title: "Prueba enviada",
      description: "Se ha enviado la estructura de prueba a tu servidor.",
    });
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
            Define el endpoint y la instancia para la integración con tus servicios de WhatsApp.
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
                URL del Endpoint
              </Label>
              <Input
                id="webhookUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://tu-servicio.com/webhook"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Estructura de Envío:</p>
              <pre className="text-[10px] text-slate-600 overflow-x-auto">
{`[
  {
    "INSTANCE": "${inst || '...'}",
    "REMOTEJID": "51975521788@s.whatsapp.net",
    "PUSHNAME": "Brayan Developer",
    "MESSAGE": "hola qué tal",
    "WHATSAPP": 51975521788,
    ...
  }
]`}
              </pre>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleTest}
              disabled={isTesting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isTesting ? 'Probando...' : 'Probar Webhook'}
            </Button>
            <div className="flex gap-2 flex-1">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2 flex-1">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
