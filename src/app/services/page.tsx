
"use client"

import { useState, useEffect } from 'react';
import { useLeads } from '@/lib/store';
import { LayoutGrid, Users, Settings, PieChart, Search, Briefcase, Plus, RefreshCw, Pencil, Trash2, DollarSign, Users2, BookOpen, AlertTriangle, Info, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Service } from '@/lib/types';
import { MobileNav } from '@/components/MobileNav';

export default function ServicesPage() {
  const { services, isSyncingServices, syncServices, createService, updateService, deleteService, isLoaded, accounts, activeAccount, setActiveAccountId } = useLeads();
  const { t } = useTranslation();
  const pathname = usePathname();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    NOMBRE: '',
    DESCRIPCION: '',
    PRECIO: '',
    CANTIDAD_PERSONAS: 0,
    CANTIDAD_CLASES: 0
  });

  useEffect(() => {
    if (selectedService) {
      setFormData({
        NOMBRE: selectedService.NOMBRE || '',
        DESCRIPCION: selectedService.DESCRIPCION || '',
        PRECIO: selectedService.PRECIO?.toString() || '',
        CANTIDAD_PERSONAS: selectedService.CANTIDAD_PERSONAS || 0,
        CANTIDAD_CLASES: selectedService.CANTIDAD_CLASES || 0
      });
    } else {
      setFormData({ NOMBRE: '', DESCRIPCION: '', PRECIO: '', CANTIDAD_PERSONAS: 0, CANTIDAD_CLASES: 0 });
    }
  }, [selectedService]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService) {
      await updateService(selectedService.id.toString(), formData);
    } else {
      await createService(formData);
    }
    setIsDialogOpen(false);
    setSelectedService(null);
  };

  const confirmDelete = (id: string | number) => {
    setServiceToDelete(id.toString());
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (serviceToDelete) {
      await deleteService(serviceToDelete);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
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
          <NavItem icon={<Settings className="h-5 w-5" />} label={t('nav.settings')} href="/settings" active={pathname === "/settings"} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center">
            <MobileNav />
            <h1 className="text-base md:text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
              <Briefcase className="h-5 w-5 hidden sm:inline" />
              {t('services.title')}
            </h1>
          </div>
          <div className="flex gap-1.5 md:gap-2">
            <Button variant="ghost" size="icon" onClick={syncServices} disabled={isSyncingServices} className="h-9 w-9">
              <RefreshCw className={cn("h-4 w-4", isSyncingServices && "animate-spin")} />
            </Button>
            <Button size="sm" onClick={() => { setSelectedService(null); setIsDialogOpen(true); }} className="h-9 text-xs font-bold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('services.add')}</span>
              <span className="sm:hidden">ADD</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 md:p-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-6">
              <CardTitle className="text-base md:text-lg font-black">{t('services.title')}</CardTitle>
              <CardDescription className="text-[10px] md:text-sm font-medium">{t('services.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              <div className="md:rounded-md border-y md:border overflow-x-auto bg-white">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] md:text-xs uppercase">{t('services.name')}</TableHead>
                      <TableHead className="hidden md:table-cell font-black text-[10px] md:text-xs uppercase">{t('services.description')}</TableHead>
                      <TableHead className="text-right font-black text-[10px] md:text-xs uppercase">{t('services.price')}</TableHead>
                      <TableHead className="text-right font-black text-[10px] md:text-xs uppercase">{t('services.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="p-3 md:p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs md:text-sm font-bold tracking-tight text-slate-800">{service.NOMBRE || 'Sin nombre'}</span>
                            <div className="flex flex-wrap gap-1">
                              {service.CANTIDAD_PERSONAS && (
                                <span className="text-[8px] md:text-[9px] bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded-full font-black flex items-center gap-1">
                                  <Users2 className="h-2 w-2" />
                                  {service.CANTIDAD_PERSONAS} P.
                                </span>
                              )}
                              {service.CANTIDAD_CLASES && (
                                <span className="text-[8px] md:text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-black flex items-center gap-1">
                                  <BookOpen className="h-2 w-2" />
                                  {service.CANTIDAD_CLASES} CLS
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs p-4">
                          <p className="line-clamp-2 text-[11px] leading-relaxed font-medium">{service.DESCRIPCION || '-'}</p>
                        </TableCell>
                        <TableCell className="text-right p-3 md:p-4">
                          <span className="text-xs md:text-sm font-black text-primary tracking-tighter">
                            {service.PRECIO || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right p-3 md:p-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/5" onClick={() => { setSelectedService(service); setIsDialogOpen(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => confirmDelete(service.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {services.length === 0 && !isSyncingServices && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center opacity-20 space-y-2">
                            <Briefcase className="h-10 w-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('services.empty')}</p>
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
        <DialogContent className="sm:max-w-[425px] w-[95%] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tighter">{selectedService ? t('services.edit') : t('services.add')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="NOMBRE" className="text-xs font-bold uppercase tracking-tight">{t('services.name')}</Label>
              <Input id="NOMBRE" value={formData.NOMBRE} onChange={(e) => setFormData({ ...formData, NOMBRE: e.target.value })} required className="h-10 text-xs font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="PRECIO" className="text-xs font-bold uppercase tracking-tight">{t('services.price')}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input id="PRECIO" className="pl-8 h-10 text-xs font-medium" value={formData.PRECIO} onChange={(e) => setFormData({ ...formData, PRECIO: e.target.value })} placeholder="ej. S/350" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="CANTIDAD_PERSONAS" className="text-xs font-bold uppercase tracking-tight">Personas</Label>
                <Input id="CANTIDAD_PERSONAS" type="number" value={formData.CANTIDAD_PERSONAS} onChange={(e) => setFormData({ ...formData, CANTIDAD_PERSONAS: parseInt(e.target.value) || 0 })} className="h-10 text-xs font-medium" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="CANTIDAD_CLASES" className="text-xs font-bold uppercase tracking-tight">Clases</Label>
              <Input id="CANTIDAD_CLASES" type="number" value={formData.CANTIDAD_CLASES} onChange={(e) => setFormData({ ...formData, CANTIDAD_CLASES: parseInt(e.target.value) || 0 })} className="h-10 text-xs font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="DESCRIPCION" className="text-xs font-bold uppercase tracking-tight">{t('services.description')}</Label>
              <Textarea id="DESCRIPCION" rows={3} value={formData.DESCRIPCION} onChange={(e) => setFormData({ ...formData, DESCRIPCION: e.target.value })} className="text-xs font-medium leading-relaxed" />
            </div>
            <DialogFooter className="pt-2 flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs font-bold">
                {t('leadDialog.cancel')}
              </Button>
              <Button type="submit" className="text-xs font-black uppercase tracking-tight shadow-md">{t('services.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[95%] rounded-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="font-black text-lg tracking-tight">{t('services.deleteConfirm')}</AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel className="text-xs font-bold">{t('leadDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-xs font-black uppercase tracking-tight">
              {t('services.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
