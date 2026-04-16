
"use client"

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Webhook, Save, Smartphone, History, Bot, Download, Upload, 
  FileJson, Languages, Briefcase, LayoutGrid, Users, Settings as SettingsIcon, PieChart, Info
} from 'lucide-react';
import { useLeads } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileNav } from '@/components/MobileNav';

export default function SettingsPage() {
  const { 
    webhookUrl, leadEditUrl, historyWebhookUrl, botWebhookUrl, instanceName, 
    servicesUrl, servicesCreateUrl, servicesEditUrl, servicesDeleteUrl,
    infoUrl, infoCreateUrl, infoEditUrl, infoDeleteUrl,
    updateSettings 
  } = useLeads();
  const { t, language, setLanguage } = useTranslation();
  const { toast } = useToast();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    webhookUrl: '',
    leadEditUrl: '',
    historyWebhookUrl: '',
    botWebhookUrl: '',
    instanceName: 'HALCONDIGITAL',
    servicesUrl: '',
    servicesCreateUrl: '',
    servicesEditUrl: '',
    servicesDeleteUrl: '',
    infoUrl: '',
    infoCreateUrl: '',
    infoEditUrl: '',
    infoDeleteUrl: ''
  });

  useEffect(() => {
    setFormData({
      webhookUrl: webhookUrl || '',
      leadEditUrl: leadEditUrl || '',
      historyWebhookUrl: historyWebhookUrl || '',
      botWebhookUrl: botWebhookUrl || '',
      instanceName: instanceName || 'HALCONDIGITAL',
      servicesUrl: servicesUrl || '',
      servicesCreateUrl: servicesCreateUrl || '',
      servicesEditUrl: servicesEditUrl || '',
      servicesDeleteUrl: servicesDeleteUrl || '',
      infoUrl: infoUrl || '',
      infoCreateUrl: infoCreateUrl || '',
      infoEditUrl: infoEditUrl || '',
      infoDeleteUrl: infoDeleteUrl || ''
    });
  }, [
    webhookUrl, leadEditUrl, historyWebhookUrl, botWebhookUrl, instanceName, 
    servicesUrl, servicesCreateUrl, servicesEditUrl, servicesDeleteUrl,
    infoUrl, infoCreateUrl, infoEditUrl, infoDeleteUrl
  ]);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateSettings({ ...formData, language });
    toast({
      title: t('settings.saved'),
      description: t('settings.savedDesc'),
      variant: "success",
    });
  };

  const exportConfig = () => {
    const config = { ...formData, language: language };
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
          leadEditUrl: json.leadEditUrl || '',
          historyWebhookUrl: json.historyWebhookUrl || '',
          botWebhookUrl: json.botWebhookUrl || '',
          instanceName: json.instanceName || 'HALCONDIGITAL',
          servicesUrl: json.servicesUrl || '',
          servicesCreateUrl: json.servicesCreateUrl || '',
          servicesEditUrl: json.servicesEditUrl || '',
          servicesDeleteUrl: json.servicesDeleteUrl || '',
          infoUrl: json.infoUrl || '',
          infoCreateUrl: json.infoCreateUrl || '',
          infoEditUrl: json.infoEditUrl || '',
          infoDeleteUrl: json.infoDeleteUrl || ''
        });
        if (json.language) setLanguage(json.language);
        toast({
          title: t('settings.imported'),
          description: t('settings.importedDesc'),
          variant: "success",
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
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutGrid className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary font-headline">LeadFlow</span>
          </div>
          <nav className="space-y-1">
            <NavItem icon={<PieChart className="h-5 w-5" />} label={t('nav.dashboard')} href="/" active={pathname === "/"} />
            <NavItem icon={<LayoutGrid className="h-5 w-5" />} label={t('nav.leads')} href="/leads" active={pathname === "/leads"} />
            <NavItem icon={<Users className="h-5 w-5" />} label={t('nav.contacts')} href="/contacts" active={pathname === "/contacts"} />
            <NavItem icon={<Briefcase className="h-5 w-5" />} label={t('nav.services')} href="/services" active={pathname === "/services"} />
            <NavItem icon={<Info className="h-5 w-5" />} label={t('nav.info')} href="/info" active={pathname === "/info"} />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t">
          <NavItem icon={<SettingsIcon className="h-5 w-5" />} label={t('nav.settings')} href="/settings" active={pathname === "/settings"} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <MobileNav />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
                  <SettingsIcon className="h-6 w-6 md:h-8 md:w-8" />
                  {t('settings.title')}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{t('settings.description')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none" onClick={exportConfig}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t('settings.export')}</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">{t('settings.import')}</span>
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importConfig} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Webhook className="h-5 w-5 text-primary" />
                    Webhooks de Leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      {t('settings.webhookUrl')}
                    </Label>
                    <Input
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                      placeholder="https://.../ver/lead"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {t('settings.leadEditUrl')}
                    </Label>
                    <Input
                      value={formData.leadEditUrl}
                      onChange={(e) => setFormData({ ...formData, leadEditUrl: e.target.value })}
                      placeholder="https://.../editar/lead"
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
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Webhooks de Servicios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Webhooks de Información
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">{t('settings.infoUrl')}</Label>
                      <Input
                        value={formData.infoUrl}
                        onChange={(e) => setFormData({ ...formData, infoUrl: e.target.value })}
                        placeholder="https://.../ver/info"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">{t('settings.infoCreateUrl')}</Label>
                      <Input
                        value={formData.infoCreateUrl}
                        onChange={(e) => setFormData({ ...formData, infoCreateUrl: e.target.value })}
                        placeholder="https://.../crear/info"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">{t('settings.infoEditUrl')}</Label>
                      <Input
                        value={formData.infoEditUrl}
                        onChange={(e) => setFormData({ ...formData, infoEditUrl: e.target.value })}
                        placeholder="https://.../editar/info"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">{t('settings.infoDeleteUrl')}</Label>
                      <Input
                        value={formData.infoDeleteUrl}
                        onChange={(e) => setFormData({ ...formData, infoDeleteUrl: e.target.value })}
                        placeholder="https://.../eliminar/info"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Instancia e Idioma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              <div className="pt-4 sticky top-8">
                <Button onClick={handleSave} className="w-full h-12 bg-primary hover:bg-primary/90 gap-2 text-lg shadow-lg">
                  <Save className="h-5 w-5" />
                  {t('settings.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "w-full justify-start gap-3 px-4 py-6 text-base font-medium transition-all duration-200 flex items-center",
        active ? "bg-primary/5 text-primary shadow-sm hover:bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5"
      )}
    >
      {icon}
      {label}
      {active && <div className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </Link>
  );
}
