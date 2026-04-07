
"use client"

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, Smartphone, History, Bot, Download, Upload, FileJson, Languages, Briefcase } from 'lucide-react';
import { useLeads } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { 
    webhookUrl, historyWebhookUrl, botWebhookUrl, instanceName, 
    servicesUrl, servicesCreateUrl, servicesEditUrl, servicesDeleteUrl,
    updateSettings 
  } = useLeads();
  const { t, language, setLanguage } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    webhookUrl: '',
    historyWebhookUrl: '',
    botWebhookUrl: '',
    instanceName: 'HALCONDIGITAL',
    servicesUrl: '',
    servicesCreateUrl: '',
    servicesEditUrl: '',
    servicesDeleteUrl: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        webhookUrl,
        historyWebhookUrl,
        botWebhookUrl,
        instanceName,
        servicesUrl,
        servicesCreateUrl,
        servicesEditUrl,
        servicesDeleteUrl
      });
    }
  }, [isOpen, webhookUrl, historyWebhookUrl, botWebhookUrl, instanceName, servicesUrl, servicesCreateUrl, servicesEditUrl, servicesDeleteUrl]);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateSettings({ ...formData, language });
    toast({
      title: t('settings.saved'),
      description: t('settings.savedDesc'),
    });
    onClose();
  };

  const exportConfig = () => {
    const config = {
      ...formData,
      language: language
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `leadflow-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setFormData({
          webhookUrl: json.webhookUrl || '',
          historyWebhookUrl: json.historyWebhookUrl || '',
          botWebhookUrl: json.botWebhookUrl || '',
          instanceName: json.instanceName || 'HALCONDIGITAL',
          servicesUrl: json.servicesUrl || '',
          servicesCreateUrl: json.servicesCreateUrl || '',
          servicesEditUrl: json.servicesEditUrl || '',
          servicesDeleteUrl: json.servicesDeleteUrl || ''
        });
        if (json.language) setLanguage(json.language);
        toast({
          title: t('settings.imported'),
          description: t('settings.importedDesc'),
        });
      } catch (error) {
        toast({
          title: t('settings.importError'),
          description: t('settings.importErrorDesc'),
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
            <Webhook className="h-6 w-6" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={exportConfig}>
            <Download className="h-4 w-4" />
            {t('settings.export')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            {t('settings.import')}
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importConfig} />
        </div>

        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSave} className="space-y-6 pb-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    {t('settings.language')}
                  </Label>
                  <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    {t('settings.instanceName')}
                  </Label>
                  <Input
                    value={formData.instanceName}
                    onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                    placeholder="ej. HALCONDIGITAL"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  {t('settings.webhookUrl')}
                </Label>
                <Input
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t('settings.historyUrl')}
                </Label>
                <Input
                  value={formData.historyWebhookUrl}
                  onChange={(e) => setFormData({ ...formData, historyWebhookUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  {t('settings.botUrl')}
                </Label>
                <Input
                  value={formData.botWebhookUrl}
                  onChange={(e) => setFormData({ ...formData, botWebhookUrl: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-[10px] text-muted-foreground italic">{t('settings.botDesc')}</p>
              </div>

              <Separator className="my-6" />
              <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
                <Briefcase className="h-4 w-4" />
                SERVICIOS WEBHOOKS
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t('settings.servicesUrl')}</Label>
                  <Input
                    value={formData.servicesUrl}
                    onChange={(e) => setFormData({ ...formData, servicesUrl: e.target.value })}
                    placeholder="https://.../ver/servicios"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t('settings.servicesCreateUrl')}</Label>
                  <Input
                    value={formData.servicesCreateUrl}
                    onChange={(e) => setFormData({ ...formData, servicesCreateUrl: e.target.value })}
                    placeholder="https://.../crear/servicios"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t('settings.servicesEditUrl')}</Label>
                  <Input
                    value={formData.servicesEditUrl}
                    onChange={(e) => setFormData({ ...formData, servicesEditUrl: e.target.value })}
                    placeholder="https://.../editar/servicios"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t('settings.servicesDeleteUrl')}</Label>
                  <Input
                    value={formData.servicesDeleteUrl}
                    onChange={(e) => setFormData({ ...formData, servicesDeleteUrl: e.target.value })}
                    placeholder="https://.../eliminar/servicios"
                  />
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('leadDialog.cancel')}
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 gap-2">
            <Save className="h-4 w-4" />
            {t('settings.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
