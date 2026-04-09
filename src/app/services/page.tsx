
"use client"

import { useState, useEffect } from 'react';
import { useLeads } from '@/lib/store';
import { LayoutGrid, Users, Settings, PieChart, Search, Briefcase, Plus, RefreshCw, Pencil, Trash2, DollarSign, Users2, BookOpen, AlertTriangle, Info } from 'lucide-react';
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
import type { Service } from '@/lib/types';

export default function ServicesPage() {
  const { services, isSyncingServices, syncServices, createService, updateService, deleteService, isLoaded } = useLeads();
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
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            label={t('nav.settings')} 
            href="/settings"
            active={pathname === "/settings"}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t('services.title')}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={syncServices} disabled={isSyncingServices}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isSyncingServices && "animate-spin")} />
              {t('services.sync')}
            </Button>
            <Button size="sm" onClick={() => { setSelectedService(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('services.add')}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>{t('services.title')}</CardTitle>
              <CardDescription>{t('services.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('services.name')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('services.description')}</TableHead>
                      <TableHead className="text-right">{t('services.price')}</TableHead>
                      <TableHead className="text-right">{t('services.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{service.NOMBRE || 'Sin nombre'}</span>
                            <div className="flex gap-2 mt-1">
                              {service.CANTIDAD_PERSONAS && (
                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Users2 className="h-2.5 w-2.5" />
                                  {service.CANTIDAD_PERSONAS} pers.
                                </span>
                              )}
                              {service.CANTIDAD_CLASES && (
                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <BookOpen className="h-2.5 w-2.5" />
                                  {service.CANTIDAD_CLASES} clases
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs">
                          <p className="line-clamp-2 text-xs">{service.DESCRIPCION || '-'}</p>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {service.PRECIO || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedService(service); setIsDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDelete(service.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {services.length === 0 && !isSyncingServices && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                          {t('services.empty')}
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

      {/* Diálogo de Creación/Edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedService ? t('services.edit') : t('services.add')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="NOMBRE">{t('services.name')}</Label>
              <Input
                id="NOMBRE"
                value={formData.NOMBRE}
                onChange={(e) => setFormData({ ...formData, NOMBRE: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="PRECIO">{t('services.price')}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="PRECIO"
                    className="pl-9"
                    value={formData.PRECIO}
                    onChange={(e) => setFormData({ ...formData, PRECIO: e.target.value })}
                    placeholder="ej. S/350"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="CANTIDAD_PERSONAS">Cant. Personas</Label>
                <Input
                  id="CANTIDAD_PERSONAS"
                  type="number"
                  value={formData.CANTIDAD_PERSONAS}
                  onChange={(e) => setFormData({ ...formData, CANTIDAD_PERSONAS: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="CANTIDAD_CLASES">Cant. Clases</Label>
              <Input
                id="CANTIDAD_CLASES"
                type="number"
                value={formData.CANTIDAD_CLASES}
                onChange={(e) => setFormData({ ...formData, CANTIDAD_CLASES: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="DESCRIPCION">{t('services.description')}</Label>
              <Textarea
                id="DESCRIPCION"
                rows={4}
                value={formData.DESCRIPCION}
                onChange={(e) => setFormData({ ...formData, DESCRIPCION: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('leadDialog.cancel')}
              </Button>
              <Button type="submit">{t('services.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle>{t('services.deleteConfirm')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {t('services.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('leadDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90">
              {t('services.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  href,
  active = false
}: { 
  icon: React.ReactNode, 
  label: string, 
  href: string,
  active?: boolean
}) {
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
