
"use client"

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { LayoutGrid, Users, Settings, PieChart, Search, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLeads } from '@/lib/store';
import { useTranslation } from '@/context/LanguageContext';

export default function Home() {
  const { webhookUrl, isLoaded } = useLeads();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !webhookUrl) {
      router.push('/settings');
    }
  }, [isLoaded, webhookUrl, router]);

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
          <div className="flex items-center w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 h-10 bg-slate-50 border-none shadow-none focus-visible:ring-1" 
                placeholder={t('contacts.search')} 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Dashboard />
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
