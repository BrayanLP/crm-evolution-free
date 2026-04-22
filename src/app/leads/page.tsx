
"use client"

import { useState } from 'react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { LayoutGrid, Users, Settings, PieChart, Search, Briefcase, Info, Filter, Calendar, Eye, EyeOff, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLeads } from '@/lib/store';
import { useTranslation } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileNav } from '@/components/MobileNav';

export default function LeadsPage() {
  const { accounts, activeAccount, setActiveAccountId } = useLeads();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [botFilter, setBotFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | '60days' | '90days'>('all');
  const [showAmounts, setShowAmounts] = useState(true);

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
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            label={t('nav.settings')} 
            href="/settings"
            active={pathname === "/settings"}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-auto md:h-16 border-b bg-white flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 md:py-0 gap-4">
          <div className="flex items-center w-full max-w-5xl">
            <MobileNav />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 h-10 bg-slate-50 border-none shadow-none focus-visible:ring-1" 
                placeholder={t('contacts.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAmounts(!showAmounts)}
              className="h-10 w-10 text-slate-500 hover:text-primary transition-colors flex-shrink-0 ml-2"
            >
              {showAmounts ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-2 w-32 md:w-40 flex-shrink-0">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={botFilter} onValueChange={(val: any) => setBotFilter(val)}>
                <SelectTrigger className="h-10 bg-slate-50 border-none shadow-none focus:ring-1 text-xs">
                  <SelectValue placeholder={t('leads.filterBot')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('leads.botAll')}</SelectItem>
                  <SelectItem value="active">{t('leads.botActive')}</SelectItem>
                  <SelectItem value="inactive">{t('leads.botInactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-44 md:w-52 flex-shrink-0">
              <Calendar className="h-4 w-4 text-slate-400" />
              <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
                <SelectTrigger className="h-10 bg-slate-50 border-none shadow-none focus:ring-1 text-xs">
                  <SelectValue placeholder={t('leads.filterDate')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('leads.dateAll')}</SelectItem>
                  <SelectItem value="today">{t('leads.dateToday')}</SelectItem>
                  <SelectItem value="week">{t('leads.dateWeek')}</SelectItem>
                  <SelectItem value="month">{t('leads.dateMonth')}</SelectItem>
                  <SelectItem value="60days">{t('leads.date60')}</SelectItem>
                  <SelectItem value="90days">{t('leads.date90')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-8">
          <KanbanBoard 
            searchQuery={searchQuery} 
            botFilter={botFilter} 
            dateFilter={dateFilter}
            showAmounts={showAmounts}
          />
        </div>
      </main>
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
