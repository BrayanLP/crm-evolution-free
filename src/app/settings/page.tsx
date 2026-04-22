
"use client"

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Webhook, Save, Smartphone, History, Bot, Download, Upload, 
  FileJson, Languages, Briefcase, LayoutGrid, Users, Settings as SettingsIcon, PieChart, Info, Plus, Trash2, CheckCircle2
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
import type { AccountConfig } from '@/lib/types';

export default function SettingsPage() {
  const { accounts, activeAccount, updateSettings, isLoaded, setActiveAccountId } = useLeads();
  const { t, language, setLanguage } = useTranslation();
  const { toast } = useToast();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [localAccounts, setLocalAccounts] = useState<AccountConfig[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (isLoaded) {
      setLocalAccounts(accounts);
      setActiveId(activeAccount?.id || '');
    }
  }, [accounts, activeAccount, isLoaded]);

  const handleAddAccount = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newAccount: AccountConfig = {
      id: newId,
      name: 'Nueva Cuenta',
      instanceName: 'HALCONDIGITAL',
      webhookUrl: '',
      leadEditUrl: '',
      historyWebhookUrl: '',
      botWebhookUrl: '',
      servicesUrl: '',
      servicesCreateUrl: '',
      servicesEditUrl: '',
      servicesDeleteUrl: '',
      infoUrl: '',
      infoCreateUrl: '',
      infoEditUrl: '',
      infoDeleteUrl: ''
    };
    setLocalAccounts([...localAccounts, newAccount]);
    setActiveId(newId);
  };

  const handleRemoveAccount = (id: string) => {
    if (localAccounts.length <= 1) return;
    const filtered = localAccounts.filter(a => a.id !== id);
    setLocalAccounts(filtered);
    if (activeId === id) setActiveId(filtered[0].id);
  };

  const handleUpdateAccount = (id: string, updates: Partial<AccountConfig>) => {
    setLocalAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const currentLocalAccount = localAccounts.find(a => a.id === activeId);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateSettings(localAccounts, activeId);
    toast({
      title: t('settings.saved'),
      description: t('settings.savedDesc'),
      variant: "success",
    });
  };

  const exportConfig = () => {
    const config = { accounts: localAccounts, activeAccountId: activeId, language };
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
        if (json.accounts) {
          setLocalAccounts(json.accounts);
          setActiveId(json.activeAccountId || json.accounts[0].id);
        } else {
          const migratedId = 'default';
          setLocalAccounts([{ ...json, id: migratedId, name: json.instanceName || 'Cuenta Importada' }]);
          setActiveId(migratedId);
        }
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

  if (!isLoaded) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="p-6 pb-2">
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

        {accounts.length > 0 && (
          <div className="px-6 py-4 border-y bg-slate-50/50">
             <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Cuenta Activa</label>
             <Select value={activeAccount?.id} onValueChange={setActiveAccountId}>
               <SelectTrigger className="h-10 bg-white border-slate-200 text-xs font-bold shadow-none">
                 <Smartphone className="h-3.5 w-3.5 mr-2 text-primary" />
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {accounts.map(acc => (
                   <SelectItem key={acc.id} value={acc.id} className="text-xs font-bold">{acc.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
        )}

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
            <div className="md:col-span-1 space-y-4">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase">Cuentas</CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddAccount}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {localAccounts.map((acc) => (
                    <div 
                      key={acc.id}
                      onClick={() => setActiveId(acc.id)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all border border-transparent",
                        activeId === acc.id ? "bg-primary/5 border-primary/20" : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-2 h-2 rounded-full", activeId === acc.id ? "bg-primary" : "bg-slate-300")} />
                        <span className="text-xs font-bold truncate">{acc.name}</span>
                      </div>
                      {localAccounts.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:bg-destructive/10" 
                          onClick={(e) => { e.stopPropagation(); handleRemoveAccount(acc.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-bold uppercase">Idioma</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-2">
                    <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es" className="text-xs">Español</SelectItem>
                        <SelectItem value="en" className="text-xs">English</SelectItem>
                      </SelectContent>
                    </Select>
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

            <div className="md:col-span-2 space-y-6">
              {currentLocalAccount ? (
                <>
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Detalles de Cuenta
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">Nombre de la Cuenta</Label>
                          <Input
                            value={currentLocalAccount.name}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { name: e.target.value })}
                            placeholder="Ej. Mi Chatbot"
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">Instancia WhatsApp</Label>
                          <Input
                            value={currentLocalAccount.instanceName}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { instanceName: e.target.value })}
                            placeholder="Ej. HALCONDIGITAL"
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-primary" />
                        Webhooks de Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">{t('settings.webhookUrl')}</Label>
                        <Input
                          value={currentLocalAccount.webhookUrl}
                          onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { webhookUrl: e.target.value })}
                          placeholder="https://.../ver/lead"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">{t('settings.leadEditUrl')}</Label>
                        <Input
                          value={currentLocalAccount.leadEditUrl}
                          onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { leadEditUrl: e.target.value })}
                          placeholder="https://.../editar/lead"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('settings.historyUrl')}</Label>
                          <Input
                            value={currentLocalAccount.historyWebhookUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { historyWebhookUrl: e.target.value })}
                            placeholder="https://..."
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('settings.botUrl')}</Label>
                          <Input
                            value={currentLocalAccount.botWebhookUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { botWebhookUrl: e.target.value })}
                            placeholder="https://..."
                            className="h-9 text-xs"
                          />
                        </div>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.servicesUrl')}</Label>
                          <Input
                            value={currentLocalAccount.servicesUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { servicesUrl: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.servicesCreateUrl')}</Label>
                          <Input
                            value={currentLocalAccount.servicesCreateUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { servicesCreateUrl: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.servicesEditUrl')}</Label>
                          <Input
                            value={currentLocalAccount.servicesEditUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { servicesEditUrl: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.servicesDeleteUrl')}</Label>
                          <Input
                            value={currentLocalAccount.servicesDeleteUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { servicesDeleteUrl: e.target.value })}
                            className="h-8 text-xs"
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.infoUrl')}</Label>
                          <Input
                            value={currentLocalAccount.infoUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { infoUrl: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.infoCreateUrl')}</Label>
                          <Input
                            value={currentLocalAccount.infoCreateUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { infoCreateUrl: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.infoEditUrl')}</Label>
                          <Input
                            value={currentLocalAccount.infoEditUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { infoEditUrl: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{t('settings.infoDeleteUrl')}</Label>
                          <Input
                            value={currentLocalAccount.infoDeleteUrl}
                            onChange={(e) => handleUpdateAccount(currentLocalAccount.id, { infoDeleteUrl: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase italic">
                  Selecciona o crea una cuenta
                </div>
              )}
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
        "w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center rounded-md",
        active ? "bg-primary/5 text-primary shadow-sm hover:bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5"
      )}
    >
      {icon}
      {label}
      {active && <div className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </Link>
  );
}
