
"use client"

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, Smartphone, History, Bot, Download, Upload, FileJson, Languages } from 'lucide-react';
import { useLeads } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { webhookUrl, historyWebhookUrl, botWebhookUrl, instanceName, updateSettings } = useLeads();
  const { t, language, setLanguage } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [url, setUrl] = useState(webhookUrl);
  const [hUrl, setHUrl] = useState(historyWebhookUrl);
  const [bUrl, setBUrl] = useState(botWebhookUrl);
  const [inst, setInst] = useState(instanceName);

  useEffect(() => {
    if (isOpen) {
      setUrl(webhookUrl);
      setHUrl(historyWebhookUrl);
      setBUrl(botWebhookUrl);
      setInst(instanceName);
    }
  }, [webhookUrl, historyWebhookUrl, botWebhookUrl, instanceName, isOpen]);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateSettings(url, hUrl, bUrl, inst);
    toast({
      title: t('settings.saved'),
      description: t('settings.savedDesc'),
    });
    onClose();
  };

  const exportConfig = () => {
    const config = {
      webhookUrl: url,
      historyWebhookUrl: hUrl,
      botWebhookUrl: bUrl,
      instanceName: inst,
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
        setUrl(json.webhookUrl || '');
        setHUrl(json.historyWebhookUrl || '');
        setBUrl(json.botWebhookUrl || '');
        setInst(json.instanceName || 'HALCONDIGITAL');
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
      <DialogContent className="sm:max-w-[550px]">
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2" 
            onClick={exportConfig}
          >
            <Download className="h-4 w-4" />
            {t('settings.export')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {t('settings.import')}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={importConfig} 
          />
        </div>

        <Separator className="mb-6" />

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-semibold flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  {t('settings.language')}
                </Label>
                <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instanceName" className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  {t('settings.instanceName')}
                </Label>
                <Input
                  id="instanceName"
                  value={inst}
                  onChange={(e) => setInst(e.target.value)}
                  placeholder="ej. HALCONDIGITAL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl" className="text-sm font-semibold flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                {t('settings.webhookUrl')}
              </Label>
              <Input
                id="webhookUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historyUrl" className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                {t('settings.historyUrl')}
              </Label>
              <Input
                id="historyUrl"
                value={hUrl}
                onChange={(e) => setHUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="botUrl" className="text-sm font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {t('settings.botUrl')}
              </Label>
              <Input
                id="botUrl"
                value={bUrl}
                onChange={(e) => setBUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-[10px] text-muted-foreground italic">
                {t('settings.botDesc')}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('leadDialog.cancel')}
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
              <Save className="h-4 w-4" />
              {t('settings.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
