
"use client"

import { useState, useEffect } from 'react';
import { useLeads } from '@/lib/store';
import { LayoutGrid, Users, Settings, PieChart, Search, Briefcase, Plus, RefreshCw, Pencil, Trash2, Info as InfoIcon, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Info } from '@/lib/types';
import { MobileNav } from '@/components/MobileNav';

export default function InfoPage() {
  const { info, isSyncingInfo, syncInfo, createInfo, updateInfo, deleteInfo, isLoaded } = useLeads();
  const { t } = useTranslation();
  const pathname = usePathname();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<Info | null>(null);
  const [infoToDelete, setInfoToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    Informacion: ''
  });

  useEffect(() => {
    if (selectedInfo) {
      setFormData({
        Informacion: selectedInfo.Informacion || ''
      });
    } else {
      setFormData({ Informacion: '' });
    }
  }, [selectedInfo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInfo) {
      await updateInfo(selectedInfo.id.toString(), formData);
    } else {
      await createInfo(formData);
    }
    setIsDialogOpen(false);
    setSelectedInfo(null);
  };

  const confirmDelete = (id: string | number) => {
    setInfoToDelete(id.toString());
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (infoToDelete) {
      await deleteInfo(infoToDelete);
      setIsDeleteDialogOpen(false);
      setInfoToDelete(null);
    }
  };

  if (!isLoaded) return null;

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
            <NavItem icon={<InfoIcon className="h-5 w-5" />} label={t('nav.info')} href="/info" active={pathname === "/info"} />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t">
          <NavItem icon={<Settings className="h-5 w-5" />} label={t('nav.settings')} href="/settings" active={pathname === "/settings"} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center">
            <MobileNav />
            <h1 className="text-base md:text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
              <InfoIcon className="h-5 w-5 hidden sm:inline" />
              {t('info.title')}
            </h1>
          </div>
          <div className="flex gap-1.5 md:gap-2">
            <Button variant="ghost" size="icon" onClick={syncInfo} disabled={isSyncingInfo} className="h-9 w-9">
              <RefreshCw className={cn("h-4 w-4", isSyncingInfo && "animate-spin")} />
            </Button>
            <Button size="sm" onClick={() => { setSelectedInfo(null); setIsDialogOpen(true); }} className="h-9 text-xs font-bold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('info.add')}</span>
              <span className="sm:hidden">ADD</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 md:p-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-6">
              <CardTitle className="text-base md:text-lg font-black">{t('info.title')}</CardTitle>
              <CardDescription className="text-[10px] md:text-sm font-medium">{t('info.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              <div className="md:rounded-md border-y md:border overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] md:text-xs uppercase">{t('info.text')}</TableHead>
                      <TableHead className="text-right w-24 md:w-32 font-black text-[10px] md:text-xs uppercase">{t('info.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {info.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="max-w-xl p-3 md:p-4">
                          <div className="flex items-start gap-2 md:gap-3">
                            <FileText className="h-3.5 w-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                            <p className="whitespace-pre-wrap text-[11px] md:text-[13px] text-slate-700 leading-relaxed font-medium">
                              {item.Informacion || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right p-3 md:p-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/5" onClick={() => { setSelectedInfo(item); setIsDialogOpen(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => confirmDelete(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {info.length === 0 && !isSyncingInfo && (
                      <TableRow>
                        <TableCell colSpan={2} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center opacity-20 space-y-2">
                            <InfoIcon className="h-10 w-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('info.empty')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95%] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tighter">{selectedInfo ? t('info.edit') : t('info.add')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="Informacion" className="text-xs font-bold uppercase tracking-tight">{t('info.text')}</Label>
              <Textarea
                id="Informacion"
                rows={10}
                value={formData.Informacion}
                onChange={(e) => setFormData({ ...formData, Informacion: e.target.value })}
                placeholder="Escribe aquí la información de la empresa..."
                required
                className="text-[12px] md:text-sm font-medium leading-relaxed"
              />
              <p className="text-[9px] text-muted-foreground italic font-medium">
                Esta información será utilizada por la IA para responder consultas de los leads.
              </p>
            </div>
            <DialogFooter className="pt-2 flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs font-bold">
                {t('leadDialog.cancel')}
              </Button>
              <Button type="submit" className="text-xs font-black uppercase tracking-tight shadow-md">{t('info.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
