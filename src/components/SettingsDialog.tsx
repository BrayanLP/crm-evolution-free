
"use client"

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, Send, Smartphone, Download } from 'lucide-react';
import { useLeads } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { webhookUrl, instanceName, updateSettings, testWebhook, processIncomingWebhook } = useLeads();
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
        description: "Configura primero una URL para realizar la prueba de envío.",
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

  const handleSimulateIncoming = () => {
    const mockData = [
      {
        "INSTANCE": inst || "HALCONDIGITAL",
        "REMOTEJID": "51975521788@s.whatsapp.net",
        "REMOTEJIDALT": "51975521788@s.whatsapp.net",
        "PUSHNAME": "Brayan Developer (Test)",
        "MESSAGE": "hola qué tal, necesito información sobre el servicio",
        "TYPO_MESSAGE": "conversation",
        "WHATSAPP": 51975521788,
        "ESTADO_RESPUESTA": "LISTO",
        "ESTADO_BOT": true,
        "id": Date.now(),
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString()
      }
    ];

    processIncomingWebhook(mockData);
    toast({
      title: "Webhook Consumido",
      description: "Se ha simulado la entrada de un lead con el formato de WhatsApp.",
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
            Configura cómo tu CRM envía y recibe información de tus servicios de WhatsApp.
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
                URL del Endpoint (Salida)
              </Label>
              <Input
                id="webhookUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://tu-servicio.com/webhook"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Estructura de Datos:</p>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] text-accent hover:text-accent"
                  onClick={handleSimulateIncoming}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Simular Entrada
                </Button>
              </div>
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
              {isTesting ? 'Enviando...' : 'Probar Envío'}
            </Button>
            <div className="flex gap-2 flex-1">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                Cerrar
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
