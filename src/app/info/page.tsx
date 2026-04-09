
"use client"

import { useState, useEffect } from 'react';
import { useLeads } from '@/lib/store';
import { LayoutGrid, Users, Settings, PieChart, Search, Briefcase, Plus, RefreshCw, Pencil, Trash2, Info as InfoIcon, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { Info } from '@/lib/types';

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
            <InfoIcon className="h-5 w-5" />
            {t('info.title')}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={syncInfo} disabled={isSyncingInfo}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isSyncingInfo && "animate-spin")} />
              {t('info.sync')}
            </Button>
            <Button size="sm" onClick={() => { setSelectedInfo(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('info.add')}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>{t('info.title')}</CardTitle>
              <CardDescription>{t('info.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('info.text')}</TableHead>
                      <TableHead className="text-right w-32">{t('info.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {info.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-xl">
                          <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 mt-1 text-slate-400 flex-shrink-0" />
                            <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                              {item.Informacion || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedInfo(item); setIsDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {info.length === 0 && !isSyncingInfo && (
                      <TableRow>
                        <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                          {t('info.empty')}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedInfo ? t('info.edit') : t('info.add')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="Informacion">{t('info.text')}</Label>
              <Textarea
                id="Informacion"
                rows={10}
                value={formData.Informacion}
                onChange={(e) => setFormData({ ...formData, Informacion: e.target.value })}
                placeholder="Escribe aquí la información de la empresa..."
                required
              />
              <p className="text-[10px] text-muted-foreground italic">
                Esta información será utilizada por la IA para responder consultas de los leads.
              </p>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('leadDialog.cancel')}
              </Button>
              <Button type="submit">{t('info.save')}</Button>
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
              <AlertDialogTitle>{t('info.deleteConfirm')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {t('info.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('leadDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90">
              {t('info.delete')}
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
